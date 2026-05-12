from typing import Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


QuestionTypeLiteral = Literal["multiple_choice", "fill_in_number"]
DifficultyLiteral = Literal["easy", "moderate", "advanced"]
StatusLiteral = Literal["draft", "reviewed", "published"]


class QuestionOptionCreate(BaseModel):
    label: str = Field(..., examples=["A"])
    option_text: str | None = None
    option_latex: str | None = None
    option_image_url: str | None = None
    is_correct: bool = False
    order_index: int = 0


class QuestionOptionRead(QuestionOptionCreate):
    id: UUID

    model_config = {"from_attributes": True}


class NumberAnswerConfig(BaseModel):
    kind: Literal["number"] = "number"
    answers: list[float] = Field(..., min_length=1)
    tolerance: float = 0.001
    unit: str | None = None


class QuestionCreate(BaseModel):
    type: QuestionTypeLiteral

    curriculum: str = "NSW"
    subject: str
    year_level: str
    topic: str | None = None
    difficulty: DifficultyLiteral = "easy"

    prompt_text: str | None = None
    prompt_latex: str | None = None
    prompt_image_url: str | None = None

    explanation_text: str | None = None
    explanation_latex: str | None = None

    options: list[QuestionOptionCreate] = []
    answer_config: NumberAnswerConfig | None = None

    tags: list[str] = []
    source: str | None = None
    status: StatusLiteral = "draft"
    created_by: str | None = None

    @model_validator(mode="after")
    def validate_question_by_type(self):
        if self.type == "multiple_choice":
            if len(self.options) < 2:
                raise ValueError("multiple_choice questions require at least 2 options")
            if not any(option.is_correct for option in self.options):
                raise ValueError("multiple_choice questions require at least 1 correct option")
            self.answer_config = None

        if self.type == "fill_in_number":
            if self.answer_config is None:
                raise ValueError("fill_in_number questions require answer_config")
            self.options = []

        if not self.prompt_text and not self.prompt_latex and not self.prompt_image_url:
            raise ValueError("question requires at least prompt_text, prompt_latex, or prompt_image_url")

        return self


class QuestionUpdate(BaseModel):
    curriculum: str | None = None
    subject: str | None = None
    year_level: str | None = None
    topic: str | None = None
    difficulty: DifficultyLiteral | None = None

    prompt_text: str | None = None
    prompt_latex: str | None = None
    prompt_image_url: str | None = None

    explanation_text: str | None = None
    explanation_latex: str | None = None

    options: list[QuestionOptionCreate] | None = None
    answer_config: NumberAnswerConfig | None = None

    tags: list[str] | None = None
    source: str | None = None
    status: StatusLiteral | None = None


class QuestionRead(BaseModel):
    id: UUID
    type: QuestionTypeLiteral

    curriculum: str
    subject: str
    year_level: str
    topic: str | None
    difficulty: DifficultyLiteral

    prompt_text: str | None
    prompt_latex: str | None
    prompt_image_url: str | None

    explanation_text: str | None
    explanation_latex: str | None

    options: list[QuestionOptionRead] = []
    answer_config: dict | None

    tags: list[str]
    source: str | None
    status: StatusLiteral
    created_by: str | None
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuestionListResponse(BaseModel):
    questions: list[QuestionRead]
    

class MultipleChoiceAnswerRequest(BaseModel):
    selected_option_ids: list[UUID] = Field(default_factory=list)


class FillInNumberAnswerRequest(BaseModel):
    numeric_answer: float


class AnswerCheckResponse(BaseModel):
    is_correct: bool
    question_id: UUID
    question_type: QuestionTypeLiteral

    correct_option_ids: list[UUID] = []
    accepted_answers: list[float] = []
    tolerance: float | None = None

    explanation_text: str | None = None
    explanation_latex: str | None = None