from datetime import datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.practice import PracticeAnswer, PracticeSession, PracticeSessionStatus
from app.models.question import QuestionType
from app.schemas.practice import PracticeAnswerSubmit, PracticeSessionCreate
from app.schemas.question import FillInNumberAnswerRequest, MultipleChoiceAnswerRequest
from app.services.question_service import check_question_answer, get_question


def create_practice_session(db: Session, payload: PracticeSessionCreate) -> PracticeSession:
    session = PracticeSession(
        student_id=payload.student_id,
        curriculum=payload.curriculum,
        subject=payload.subject,
        year_level=payload.year_level,
        topic=payload.topic,
        difficulty=payload.difficulty,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_practice_session(db: Session, session_id: UUID) -> PracticeSession | None:
    stmt = (
        select(PracticeSession)
        .options(selectinload(PracticeSession.answers))
        .where(PracticeSession.id == session_id)
    )
    return db.scalars(stmt).first()


def submit_practice_answer(
    db: Session,
    session: PracticeSession,
    payload: PracticeAnswerSubmit,
) -> PracticeAnswer:
    if session.status == PracticeSessionStatus.finished:
        raise ValueError("Cannot submit answer to a finished practice session")

    question = get_question(db, payload.question_id)
    if question is None:
        raise ValueError("Question not found")

    if question.type == QuestionType.multiple_choice:
        answer_payload = MultipleChoiceAnswerRequest(
            selected_option_ids=payload.selected_option_ids,
        )
        submitted_answer = {
            "selected_option_ids": [str(x) for x in payload.selected_option_ids],
        }

    elif question.type == QuestionType.fill_in_number:
        if payload.numeric_answer is None:
            raise ValueError("fill_in_number questions require numeric_answer")

        answer_payload = FillInNumberAnswerRequest(
            numeric_answer=payload.numeric_answer,
        )
        submitted_answer = {
            "numeric_answer": payload.numeric_answer,
        }

    else:
        raise ValueError(f"Unsupported question type: {question.type}")

    check_result = check_question_answer(question, answer_payload)
    check_result_dict = check_result.model_dump(mode="json")

    answer = PracticeAnswer(
        session_id=session.id,
        question_id=question.id,
        question_type=question.type.value,
        submitted_answer=submitted_answer,
        check_result=check_result_dict,
        is_correct=check_result.is_correct,
        time_taken_seconds=payload.time_taken_seconds,
    )

    db.add(answer)
    db.flush()

    session.total_questions += 1
    if answer.is_correct:
        session.correct_questions += 1

    session.accuracy = (
        session.correct_questions / session.total_questions
        if session.total_questions > 0
        else 0.0
    )

    db.add(session)
    db.commit()
    db.refresh(answer)

    return answer


def finish_practice_session(db: Session, session: PracticeSession) -> PracticeSession:
    session.status = PracticeSessionStatus.finished
    session.finished_at = datetime.utcnow()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_student_progress(db: Session, student_id: str) -> dict:
    stmt = select(PracticeSession).where(PracticeSession.student_id == student_id)
    sessions = list(db.scalars(stmt).all())

    total_sessions = len(sessions)
    total_questions = sum(s.total_questions for s in sessions)
    correct_questions = sum(s.correct_questions for s in sessions)

    accuracy = correct_questions / total_questions if total_questions > 0 else 0.0

    return {
        "student_id": student_id,
        "total_sessions": total_sessions,
        "total_questions": total_questions,
        "correct_questions": correct_questions,
        "accuracy": accuracy,
    }