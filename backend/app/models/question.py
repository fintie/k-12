import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    fill_in_number = "fill_in_number"


class Difficulty(str, enum.Enum):
    easy = "easy"
    moderate = "moderate"
    advanced = "advanced"


class QuestionStatus(str, enum.Enum):
    draft = "draft"
    reviewed = "reviewed"
    published = "published"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)

    curriculum: Mapped[str] = mapped_column(String(100), default="NSW")
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    year_level: Mapped[str] = mapped_column(String(50), nullable=False)
    topic: Mapped[str] = mapped_column(String(150), nullable=True)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty), default=Difficulty.easy)

    prompt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_latex: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    explanation_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation_latex: Mapped[str | None] = mapped_column(Text, nullable=True)

    answer_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list)

    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[QuestionStatus] = mapped_column(
        Enum(QuestionStatus),
        default=QuestionStatus.draft,
    )

    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.order_index",
    )


class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
    )

    label: Mapped[str] = mapped_column(String(10), nullable=False)
    option_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_latex: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped[Question] = relationship(back_populates="options")