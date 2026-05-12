from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.question import Question, QuestionOption
from app.schemas.question import (
    AnswerCheckResponse,
    FillInNumberAnswerRequest,
    MultipleChoiceAnswerRequest,
    QuestionCreate, 
    QuestionUpdate
)



def create_question(db: Session, payload: QuestionCreate) -> Question:
    question = Question(
        type=payload.type,
        curriculum=payload.curriculum,
        subject=payload.subject,
        year_level=payload.year_level,
        topic=payload.topic,
        difficulty=payload.difficulty,
        prompt_text=payload.prompt_text,
        prompt_latex=payload.prompt_latex,
        prompt_image_url=payload.prompt_image_url,
        explanation_text=payload.explanation_text,
        explanation_latex=payload.explanation_latex,
        answer_config=payload.answer_config.model_dump() if payload.answer_config else None,
        tags=payload.tags,
        source=payload.source,
        status=payload.status,
        created_by=payload.created_by,
    )

    for idx, option in enumerate(payload.options):
        question.options.append(
            QuestionOption(
                label=option.label,
                option_text=option.option_text,
                option_latex=option.option_latex,
                option_image_url=option.option_image_url,
                is_correct=option.is_correct,
                order_index=option.order_index or idx,
            )
        )

    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def list_questions(
    db: Session,
    subject: str | None = None,
    difficulty: str | None = None,
    question_type: str | None = None,
) -> list[Question]:
    stmt = select(Question).options(selectinload(Question.options)).order_by(Question.created_at.desc())

    if subject:
        stmt = stmt.where(Question.subject == subject)
    if difficulty:
        stmt = stmt.where(Question.difficulty == difficulty)
    if question_type:
        stmt = stmt.where(Question.type == question_type)

    return list(db.scalars(stmt).all())


def get_question(db: Session, question_id: UUID) -> Question | None:
    stmt = (
        select(Question)
        .options(selectinload(Question.options))
        .where(Question.id == question_id)
    )
    return db.scalars(stmt).first()


def update_question(db: Session, question: Question, payload: QuestionUpdate) -> Question:
    data = payload.model_dump(exclude_unset=True)

    options = data.pop("options", None)
    answer_config = data.pop("answer_config", None)

    for key, value in data.items():
        setattr(question, key, value)

    if answer_config is not None:
        question.answer_config = answer_config.model_dump()

    if options is not None:
        question.options.clear()
        for idx, option in enumerate(options):
            question.options.append(
                QuestionOption(
                    label=option.label,
                    option_text=option.option_text,
                    option_latex=option.option_latex,
                    option_image_url=option.option_image_url,
                    is_correct=option.is_correct,
                    order_index=option.order_index or idx,
                )
            )

    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question: Question) -> None:
    db.delete(question)
    db.commit()
    

def check_question_answer(
    question: Question,
    payload: MultipleChoiceAnswerRequest | FillInNumberAnswerRequest,
) -> AnswerCheckResponse:
    if question.type == "multiple_choice":
        if not isinstance(payload, MultipleChoiceAnswerRequest):
            raise ValueError("multiple_choice questions require selected_option_ids")

        correct_option_ids = {
            option.id for option in question.options if option.is_correct
        }
        selected_option_ids = set(payload.selected_option_ids)

        return AnswerCheckResponse(
            is_correct=selected_option_ids == correct_option_ids,
            question_id=question.id,
            question_type=question.type,
            correct_option_ids=list(correct_option_ids),
            explanation_text=question.explanation_text,
            explanation_latex=question.explanation_latex,
        )

    if question.type == "fill_in_number":
        if not isinstance(payload, FillInNumberAnswerRequest):
            raise ValueError("fill_in_number questions require numeric_answer")

        config = question.answer_config or {}
        answers = [float(x) for x in config.get("answers", [])]
        tolerance = float(config.get("tolerance", 0.001))
        numeric_answer = float(payload.numeric_answer)

        is_correct = any(abs(numeric_answer - answer) <= tolerance for answer in answers)

        return AnswerCheckResponse(
            is_correct=is_correct,
            question_id=question.id,
            question_type=question.type,
            accepted_answers=answers,
            tolerance=tolerance,
            explanation_text=question.explanation_text,
            explanation_latex=question.explanation_latex,
        )

    raise ValueError(f"Unsupported question type: {question.type}")