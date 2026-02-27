from pathlib import Path

import joblib
import numpy as np
from fastapi import HTTPException


class RecommenderService:
    def __init__(self, model_path: str):
        path = Path(model_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Trained model was not found at {model_path}. Run the ML training step first."
            )

        model_bundle = joblib.load(path)
        self.user_factors = model_bundle["user_factors"]
        self.item_factors = model_bundle["item_factors"]
        self.user_means = model_bundle["user_means"]
        self.global_mean = model_bundle["global_mean"]
        self.user_to_index = model_bundle["user_to_index"]
        self.movie_to_index = model_bundle["movie_to_index"]
        self.index_to_movie = model_bundle["index_to_movie"]
        self.user_seen_movies = model_bundle["user_seen_movies"]
        self.movie_titles = model_bundle["movie_titles"]

    def _predict_known_user_movie(self, user_idx: int, movie_idx: int) -> float:
        centered_score = float(np.dot(self.user_factors[user_idx], self.item_factors[movie_idx]))
        score = centered_score + float(self.user_means[user_idx])
        return float(np.clip(score, 0.5, 5.0))

    def predict(self, user_id: int, movie_id: int) -> float:
        if user_id not in self.user_to_index:
            raise HTTPException(status_code=404, detail=f"Unknown user_id: {user_id}")
        if movie_id not in self.movie_to_index:
            raise HTTPException(status_code=404, detail=f"Unknown movie_id: {movie_id}")

        user_idx = self.user_to_index[user_id]
        movie_idx = self.movie_to_index[movie_id]
        return self._predict_known_user_movie(user_idx, movie_idx)

    def recommend(self, user_id: int, top_k: int = 5):
        if user_id not in self.user_to_index:
            raise HTTPException(status_code=404, detail=f"Unknown user_id: {user_id}")

        user_idx = self.user_to_index[user_id]
        raw_scores = self.item_factors @ self.user_factors[user_idx]
        scores = np.clip(raw_scores + self.user_means[user_idx], 0.5, 5.0)

        seen_movie_ids = set(self.user_seen_movies.get(user_id, []))
        candidate_items = []
        for movie_idx, score in enumerate(scores):
            movie_id = self.index_to_movie[movie_idx]
            if movie_id in seen_movie_ids:
                continue
            candidate_items.append((movie_id, float(score)))

        candidate_items.sort(key=lambda item: item[1], reverse=True)
        top_items = candidate_items[:top_k]

        return [
            {
                "movie_id": movie_id,
                "title": self.movie_titles.get(movie_id, f"Movie {movie_id}"),
                "score": round(score, 4),
            }
            for movie_id, score in top_items
        ]
