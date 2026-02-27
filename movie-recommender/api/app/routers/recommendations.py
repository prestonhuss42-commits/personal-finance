from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..db.session import get_db
from ..models.entities import Movie, User
from ..schemas.prediction import PredictRequest, PredictResponse
from ..schemas.recommendation import RecommendationResponse
from ..services.recommender import RecommenderService

router = APIRouter(tags=["recommendations"])


@lru_cache(maxsize=1)
def get_recommender() -> RecommenderService:
    return RecommenderService(settings.model_path)


@router.get("/recommend/{user_id}", response_model=RecommendationResponse)
def recommend_movies(
    user_id: int,
    db: Session = Depends(get_db),
    recommender: RecommenderService = Depends(get_recommender),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found in database")

    recs = recommender.recommend(user_id=user_id, top_k=settings.top_k)
    return RecommendationResponse(user_id=user_id, recommendations=recs)


@router.post("/predict", response_model=PredictResponse)
def predict_rating(
    payload: PredictRequest,
    db: Session = Depends(get_db),
    recommender: RecommenderService = Depends(get_recommender),
):
    user = db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User {payload.user_id} not found in database")

    movie = db.get(Movie, payload.movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail=f"Movie {payload.movie_id} not found in database")

    prediction = recommender.predict(payload.user_id, payload.movie_id)
    return PredictResponse(
        user_id=payload.user_id,
        movie_id=payload.movie_id,
        predicted_rating=round(prediction, 4),
    )
