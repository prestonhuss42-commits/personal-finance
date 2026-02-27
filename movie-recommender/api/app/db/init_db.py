from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from .session import Base, engine
from ..models.entities import Movie, Rating, User


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_from_movielens(project_root: Path, db: Session):
    if db.query(User).first() is not None:
        return

    dataset_dir = project_root / "data" / "raw" / "ml-latest-small"
    ratings_path = dataset_dir / "ratings.csv"
    movies_path = dataset_dir / "movies.csv"

    if not ratings_path.exists() or not movies_path.exists():
        return

    ratings_df = pd.read_csv(ratings_path)
    movies_df = pd.read_csv(movies_path)

    users = [User(id=int(user_id)) for user_id in sorted(ratings_df["userId"].unique())]
    movies = [
        Movie(id=int(row.movieId), title=row.title, genres=row.genres)
        for row in movies_df.itertuples(index=False)
    ]
    ratings = [
        Rating(user_id=int(row.userId), movie_id=int(row.movieId), rating=float(row.rating))
        for row in ratings_df.itertuples(index=False)
    ]

    db.bulk_save_objects(users)
    db.bulk_save_objects(movies)
    db.bulk_save_objects(ratings)
    db.commit()
