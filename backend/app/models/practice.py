import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PracticeSessionStatus(str, enum.Enum):
    active = "active"
    finished = "finished"


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    student_id: Mapped[str] = mapped_column(String(100), nullable=False)

    curriculum: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(100), nullable=True)
    year_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    topic: Mapped[str | None] = mapped_column(String(150), nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)

    status: Mapped[PracticeSessionStatus] = mapped_column(
        Enum(PracticeSessionStatus),
        default=PracticeSessionStatus.active,
    )

    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    correct_questions: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)

    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    answers: Mapped[list["PracticeAnswer"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="PracticeAnswer.created_at",
    )


class PracticeAnswer(Base):
    __tablename__ = "practice_answers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practice_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
    )

    question_type: Mapped[str] = mapped_column(String(50), nullable=False)

    submitted_answer: Mapped[dict] = mapped_column(JSONB, default=dict)
    check_result: Mapped[dict] = mapped_column(JSONB, default=dict)

    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    time_taken_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped[PracticeSession] = relationship(back_populates="answers")