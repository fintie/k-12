from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.question import (
    AnswerCheckResponse,
    FillInNumberAnswerRequest,
    MultipleChoiceAnswerRequest,
    QuestionCreate,
    QuestionListResponse,
    QuestionRead,
    QuestionUpdate,
)
from app.services.question_service import (
    create_question,
    delete_question,
    get_question,
    list_questions,
    update_question,
    check_question_answer,
)

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("", response_model=QuestionRead)
def create_question_endpoint(payload: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, payload)


@router.get("", response_model=QuestionListResponse)
def list_questions_endpoint(
    subject: str | None = Query(default=None),
    difficulty: str | None = Query(default=None),
    type: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    questions = list_questions(
        db=db,
        subject=subject,
        difficulty=difficulty,
        question_type=type,
    )
    return {"questions": questions}


@router.get("/{question_id}", response_model=QuestionRead)
def get_question_endpoint(question_id: UUID, db: Session = Depends(get_db)):
    question = get_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.patch("/{question_id}", response_model=QuestionRead)
def update_question_endpoint(
    question_id: UUID,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
):
    question = get_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return update_question(db, question, payload)


@router.post("/{question_id}/check-answer", response_model=AnswerCheckResponse)
def check_answer_endpoint(
    question_id: UUID,
    payload: MultipleChoiceAnswerRequest | FillInNumberAnswerRequest,
    db: Session = Depends(get_db),
):
    question = get_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        return check_question_answer(question, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/{question_id}")
def delete_question_endpoint(question_id: UUID, db: Session = Depends(get_db)):
    question = get_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    delete_question(db, question)
    return {"ok": True}