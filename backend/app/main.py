from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes.auth import router as auth_router
from app.api.routes.learning_checkup import router as learning_checkup_router
from app.api.routes.practice import router as practice_router
from app.api.routes.questions import router as questions_router
from app.api.routes.uploads import router as uploads_router
from app.api.routes.users import router as users_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

# Import models so SQLAlchemy registers them before create_all
from app.models import PracticeAnswer, PracticeSession, Question, QuestionOption, User  # noqa: F401

settings = get_settings()

app = FastAPI(title=settings.app_name)


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            response = await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise
        if response.status_code == 404:
            return await super().get_response("index.html", scope)
        return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

media_path = Path(settings.media_root)
media_path.mkdir(parents=True, exist_ok=True)
app.mount(settings.media_url, StaticFiles(directory=settings.media_root), name="media")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(questions_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
app.include_router(practice_router, prefix="/api")
app.include_router(learning_checkup_router, prefix="/api")

frontend_path = Path(__file__).resolve().parents[2] / "dist"
if frontend_path.exists():
    app.mount("/", SPAStaticFiles(directory=frontend_path, html=True), name="frontend")
