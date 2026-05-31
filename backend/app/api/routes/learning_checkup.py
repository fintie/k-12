from __future__ import annotations

import html
import json
import os
import smtplib
from email.message import EmailMessage
from typing import Any, Literal
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/learning-checkup", tags=["learning-checkup"])

TrackType = Literal["oc", "selective", "hsc"]


class LearningCheckupRequest(BaseModel):
    track: TrackType
    trackLabel: str
    parentName: str = ""
    studentName: str = ""
    email: EmailStr
    phone: str = ""
    grade: str = ""
    currentLevel: str = ""
    targetGoal: str = ""
    strengthArea: str = ""
    weakArea: str = ""
    studyTime: str = ""
    tutoringHistory: str = ""
    concern: str = Field(default="", max_length=4000)
    assessmentAnswers: dict[str, str] = Field(default_factory=dict)
    assessmentResult: dict[str, Any] = Field(default_factory=dict)
    submittedAt: str | None = None


class LearningCheckupResponse(BaseModel):
    ok: bool
    report: str
    delivery: str
    generator: str


TRACK_PROMPTS = {
    "oc": "OC entry preparation for opportunity class applicants in NSW.",
    "selective": (
        "Selective school preparation with focus on English, Maths, Thinking Skills and Writing."
    ),
    "hsc": "HSC preparation with focus on subject readiness, study habits and exam performance.",
}


def build_rule_based_report(payload: LearningCheckupRequest) -> str:
    result = payload.assessmentResult or {}
    weakest_skill = result.get("weakestSkill") or {}
    strongest_skill = result.get("strongestSkill") or {}
    skill_scores = result.get("skillScores") or []
    focus_line = weakest_skill.get("skill") or payload.weakArea or payload.concern or "study consistency"
    strength_line = strongest_skill.get("skill") or payload.strengthArea or "general classroom learning"
    target_line = payload.targetGoal or "stronger academic progress"
    study_line = payload.studyTime or "an unclear weekly study routine"
    tutoring_line = payload.tutoringHistory or "no tutoring history provided"
    score_line = (
        f"Online assessment score: {result.get('correct')}/{result.get('total')} "
        f"({result.get('percentage')}%) - {result.get('level')}"
        if result
        else f"Current level: {payload.currentLevel or 'Not specified'}"
    )
    skill_lines = "\n".join(
        f"- {item.get('skill')}: {item.get('correct')}/{item.get('total')}"
        for item in skill_scores
    )

    return (
        f"Learning Checkup Summary for {payload.studentName or 'the student'}\n\n"
        f"Track: {payload.trackLabel}\n"
        f"{score_line}\n"
        f"Target goal: {target_line}\n\n"
        f"Skill breakdown:\n"
        f"{skill_lines or '- Not enough assessment data provided.'}\n\n"
        f"Likely strength area:\n"
        f"- {strength_line} appears to be a useful base to build on.\n\n"
        f"Main risk area:\n"
        f"- {focus_line} is the clearest issue affecting progress right now.\n"
        f"- Current study pattern ({study_line}) may not yet be enough for the target outcome.\n"
        f"- Tutoring context: {tutoring_line}.\n\n"
        f"Recommended next steps:\n"
        f"1. Create a 2-week study plan focused on {focus_line}.\n"
        f"2. Add one timed practice or structured review session each week.\n"
        f"3. Review accuracy, confidence, and error patterns before increasing workload.\n\n"
        f"Parent note:\n"
        f"This report is an initial AI-assisted learning checkup and should be followed by "
        f"a teacher review or consultation for a more precise plan."
    )


def build_ai_prompt(payload: LearningCheckupRequest) -> str:
    return (
        "You are an experienced Australian K-12 academic advisor. "
        "Write a concise, warm, practical email-ready learning checkup report for a parent. "
        "Keep it specific, not fluffy. Include: summary, strengths, risks, and 3 next steps.\n\n"
        f"Program context: {TRACK_PROMPTS[payload.track]}\n"
        f"Track: {payload.trackLabel}\n"
        f"Parent name: {payload.parentName}\n"
        f"Student name: {payload.studentName}\n"
        f"Grade: {payload.grade}\n"
        f"Current level: {payload.currentLevel}\n"
        f"Target goal: {payload.targetGoal}\n"
        f"Strength area: {payload.strengthArea}\n"
        f"Weak area: {payload.weakArea}\n"
        f"Study time: {payload.studyTime}\n"
        f"Tutoring history: {payload.tutoringHistory}\n"
        f"Main concern: {payload.concern}\n"
        f"Assessment result JSON: {json.dumps(payload.assessmentResult)}\n"
        f"Assessment answers JSON: {json.dumps(payload.assessmentAnswers)}\n"
    )


def call_json_api(url: str, body: dict, headers: dict[str, str], timeout: int = 60) -> dict | None:
    req = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    try:
        with urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def maybe_generate_ollama_report(payload: LearningCheckupRequest) -> str | None:
    if os.getenv("LOCAL_LLM_PROVIDER", "").lower() != "ollama":
        return None

    base_url = os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("LOCAL_LLM_MODEL", "gemma4")
    timeout = int(os.getenv("LOCAL_LLM_TIMEOUT_SECONDS", "240"))
    num_predict = int(os.getenv("LOCAL_LLM_NUM_PREDICT", "500"))
    data = call_json_api(
        f"{base_url}/api/generate",
        {
            "model": model,
            "prompt": build_ai_prompt(payload),
            "stream": False,
            "think": False,
            "options": {
                "num_predict": num_predict,
                "temperature": 0.4,
            },
        },
        headers={},
        timeout=timeout,
    )
    if not data:
        return None
    result = (data.get("response") or "").strip()
    return result or None


def maybe_generate_openai_report(payload: LearningCheckupRequest) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    data = call_json_api(
        "https://api.openai.com/v1/responses",
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "input": build_ai_prompt(payload),
        },
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=60,
    )
    if not data:
        return None

    output = data.get("output", [])
    parts: list[str] = []
    for item in output:
        for content in item.get("content", []):
            text = content.get("text")
            if text:
                parts.append(text)
    result = "\n".join(part.strip() for part in parts if part.strip()).strip()
    return result or None


def generate_report(payload: LearningCheckupRequest) -> tuple[str, str]:
    ollama_report = maybe_generate_ollama_report(payload)
    if ollama_report:
        return ollama_report, "ollama"

    openai_report = maybe_generate_openai_report(payload)
    if openai_report:
        return openai_report, "openai"

    return build_rule_based_report(payload), "rule-based"


def send_via_resend(payload: LearningCheckupRequest, report: str) -> bool:
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("LEARNING_CHECKUP_FROM_EMAIL")
    if not api_key or not from_email:
        return False

    html_body = (
        f"<h2>{html.escape(payload.trackLabel)} Learning Checkup</h2>"
        f"<p>Hello {html.escape(payload.parentName or 'Parent')},</p>"
        f"<pre style='white-space:pre-wrap;font-family:Arial,sans-serif'>"
        f"{html.escape(report)}</pre>"
        f"<p>Reply to this email if you'd like a more tailored study plan or tutoring "
        f"recommendation.</p>"
    )

    data = call_json_api(
        "https://api.resend.com/emails",
        {
            "from": from_email,
            "to": [payload.email],
            "subject": f"{payload.trackLabel} Learning Checkup Report",
            "html": html_body,
        },
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=60,
    )
    return bool(data)


def send_via_smtp(payload: LearningCheckupRequest, report: str) -> bool:
    host = os.getenv("SMTP_HOST")
    port = os.getenv("SMTP_PORT")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("LEARNING_CHECKUP_FROM_EMAIL") or username
    secure = os.getenv("SMTP_SECURE", "starttls").lower()

    if not host or not port or not username or not password or not from_email:
        return False

    message = EmailMessage()
    message["Subject"] = f"{payload.trackLabel} Learning Checkup Report"
    message["From"] = from_email
    message["To"] = payload.email
    message.set_content(
        f"Hello {payload.parentName or 'Parent'},\n\n"
        f"{report}\n\n"
        f"Reply to this email if you'd like a more tailored study plan or tutoring "
        f"recommendation."
    )

    try:
        if secure == "ssl":
            with smtplib.SMTP_SSL(host, int(port), timeout=45) as server:
                server.login(username, password)
                server.send_message(message)
        else:
            with smtplib.SMTP(host, int(port), timeout=45) as server:
                if secure == "starttls":
                    server.starttls()
                server.login(username, password)
                server.send_message(message)
        return True
    except Exception:
        return False


@router.post("", response_model=LearningCheckupResponse)
def submit_learning_checkup(payload: LearningCheckupRequest):
    report, generator = generate_report(payload)

    if send_via_smtp(payload, report):
        return {"ok": True, "report": report, "delivery": "smtp", "generator": generator}

    if send_via_resend(payload, report):
        return {"ok": True, "report": report, "delivery": "resend", "generator": generator}

    if os.getenv("LEARNING_CHECKUP_REQUIRE_EMAIL_DELIVERY", "false").lower() not in {
        "1",
        "true",
        "yes",
    }:
        return {
            "ok": True,
            "report": report,
            "delivery": "not_configured",
            "generator": generator,
        }

    raise HTTPException(
        status_code=503,
        detail=(
            "Learning checkup report was generated, but no email delivery provider is configured."
        ),
    )
