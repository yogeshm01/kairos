from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import ai_profiles, calendar, health, missions, tasks, users
from app.core.config import settings
from app.core.errors import AppError
from app.core.logging import configure_logging

configure_logging()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs" if settings.is_local else None,
        redoc_url="/redoc" if settings.is_local else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
        "http://localhost:5173",
        "https://kairos-fawn-beta.vercel.app"
    ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": exc.message})

    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(users.router, prefix=settings.api_prefix)
    app.include_router(ai_profiles.router, prefix=settings.api_prefix)
    app.include_router(missions.router, prefix=settings.api_prefix)
    app.include_router(tasks.router, prefix=settings.api_prefix)
    app.include_router(calendar.router, prefix=settings.api_prefix)
    return app


app = create_app()
