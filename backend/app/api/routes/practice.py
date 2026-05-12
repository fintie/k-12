from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.routes.auth import get_current_user
from app.schemas.practice import (
    PracticeAnswerSubmit,
    PracticeAnswerSubmitResponse,
    PracticeProgressResponse,
    PracticeSessionCreate,
    PracticeSessionDetail,
    PracticeSessionRead,
    MyPracticeSessionCreate
)
from app.services.practice_service import (
    create_practice_session,
    finish_practice_session,
    get_practice_session,
    get_student_progress,
    submit_practice_answer,
)

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("/sessions", response_model=PracticeSessionRead)
def create_session_endpoint(payload: PracticeSessionCreate, db: Session = Depends(get_db)):
    return create_practice_session(db, payload)


@router.post("/sessions/me", response_model=PracticeSessionRead)
def create_my_session_endpoint(
    payload: MyPracticeSessionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can create practice sessions",
        )

    session_payload = PracticeSessionCreate(
        student_id=str(current_user.id),
        curriculum=payload.curriculum,
        subject=payload.subject,
        year_level=payload.year_level,
        topic=payload.topic,
        difficulty=payload.difficulty,
    )

    return create_practice_session(db, session_payload)


@router.get("/sessions/{session_id}", response_model=PracticeSessionDetail)
def get_session_endpoint(session_id: UUID, db: Session = Depends(get_db)):
    session = get_practice_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Practice session not found")
    return session


@router.post("/sessions/{session_id}/answers", response_model=PracticeAnswerSubmitResponse)
def submit_answer_endpoint(
    session_id: UUID,
    payload: PracticeAnswerSubmit,
    db: Session = Depends(get_db),
):
    session = get_practice_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Practice session not found")

    try:
        answer = submit_practice_answer(db, session, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "answer": answer,
        "is_correct": answer.is_correct,
        "check_result": answer.check_result,
    }


@router.post("/sessions/{session_id}/finish", response_model=PracticeSessionRead)
def finish_session_endpoint(session_id: UUID, db: Session = Depends(get_db)):
    session = get_practice_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Practice session not found")
    return finish_practice_session(db, session)


@router.get("/progress", response_model=PracticeProgressResponse)
def get_progress_endpoint(
    student_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return get_student_progress(db, student_id)