import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    app_name: str = os.getenv("APP_NAME", "Movie Recommender API")
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./movie_recommender.db")
    model_path: str = os.getenv("MODEL_PATH", "./artifacts/cf_model.joblib")
    top_k: int = int(os.getenv("TOP_K", "5"))


settings = Settings()
