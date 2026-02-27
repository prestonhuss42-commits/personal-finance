from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    user_id: int = Field(..., ge=1)
    movie_id: int = Field(..., ge=1)


class PredictResponse(BaseModel):
    user_id: int
    movie_id: int
    predicted_rating: float
