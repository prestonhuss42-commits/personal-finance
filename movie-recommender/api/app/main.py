from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db.init_db import init_db, seed_from_movielens
from .db.session import SessionLocal
from .routers.recommendations import router as recommendation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = app
    init_db()
    db = SessionLocal()
    try:
        project_root = Path(__file__).resolve().parents[2]
        seed_from_movielens(project_root, db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
