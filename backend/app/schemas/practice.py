from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class PracticeSessionCreate(BaseModel):
    student_id: str

    curriculum: str | None = None
    subject: str | None = None
    year_level: str | None = None
    topic: str | None = None
    difficulty: str | None = None


class MyPracticeSessionCreate(BaseModel):
    curriculum: str | None = None
    subject: str | None = None
    year_level: str | None = None
    topic: str | None = None
    difficulty: str | None = None


class PracticeSessionRead(BaseModel):
    id: UUID
    student_id: str

    curriculum: str | None
    subject: str | None
    year_level: str | None
    topic: str | None
    difficulty: str | None

    status: Literal["active", "finished"]
    total_questions: int
    correct_questions: int
    accuracy: float

    started_at: datetime
    finished_at: datetime | None

    model_config = {"from_attributes": True}


class PracticeAnswerSubmit(BaseModel):
    question_id: UUID

    selected_option_ids: list[UUID] = Field(default_factory=list)
    numeric_answer: float | None = None

    time_taken_seconds: int | None = None


class PracticeAnswerRead(BaseModel):
    id: UUID
    session_id: UUID
    question_id: UUID
    question_type: str

    submitted_answer: dict
    check_result: dict

    is_correct: bool
    time_taken_seconds: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PracticeAnswerSubmitResponse(BaseModel):
    answer: PracticeAnswerRead
    is_correct: bool
    check_result: dict


class PracticeSessionDetail(PracticeSessionRead):
    answers: list[PracticeAnswerRead] = []


class PracticeProgressResponse(BaseModel):
    student_id: str
    total_sessions: int
    total_questions: int
    correct_questions: int
    accuracy: float