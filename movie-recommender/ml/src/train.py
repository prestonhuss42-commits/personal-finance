import io
import zipfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import requests
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import train_test_split

DATASET_URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"


def download_movielens(raw_dir: Path) -> Path:
    raw_dir.mkdir(parents=True, exist_ok=True)
    dataset_dir = raw_dir / "ml-latest-small"
    if dataset_dir.exists():
        return dataset_dir

    response = requests.get(DATASET_URL, timeout=60)
    response.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        archive.extractall(raw_dir)
    return dataset_dir


def build_mappings(df: pd.DataFrame):
    unique_users = sorted(df["userId"].unique())
    unique_movies = sorted(df["movieId"].unique())

    user_to_index = {user_id: idx for idx, user_id in enumerate(unique_users)}
    movie_to_index = {movie_id: idx for idx, movie_id in enumerate(unique_movies)}
    index_to_user = {idx: user_id for user_id, idx in user_to_index.items()}
    index_to_movie = {idx: movie_id for movie_id, idx in movie_to_index.items()}

    return user_to_index, movie_to_index, index_to_user, index_to_movie


def make_sparse_matrix(df: pd.DataFrame, user_to_index: dict, movie_to_index: dict):
    row = df["userId"].map(user_to_index).to_numpy()
    col = df["movieId"].map(movie_to_index).to_numpy()
    values = df["rating"].to_numpy(dtype=np.float32)

    return csr_matrix((values, (row, col)), shape=(len(user_to_index), len(movie_to_index)), dtype=np.float32)


def train_model(project_root: Path, n_components: int = 40, random_state: int = 42):
    raw_dir = project_root / "data" / "raw"
    dataset_dir = download_movielens(raw_dir)

    ratings = pd.read_csv(dataset_dir / "ratings.csv")
    movies = pd.read_csv(dataset_dir / "movies.csv")

    # Data cleaning: keep only valid user/movie/rating rows and normalize dtypes.
    ratings = ratings.dropna(subset=["userId", "movieId", "rating"])
    ratings = ratings[(ratings["rating"] >= 0.5) & (ratings["rating"] <= 5.0)]
    ratings = ratings.astype({"userId": "int64", "movieId": "int64", "rating": "float32"})

    # Train/test split for unbiased offline evaluation.
    train_df, test_df = train_test_split(ratings, test_size=0.2, random_state=random_state)

    # Preprocessing: map raw ids to contiguous matrix indices.
    user_to_index, movie_to_index, index_to_user, index_to_movie = build_mappings(train_df)

    train_df = train_df[
        train_df["userId"].isin(user_to_index) & train_df["movieId"].isin(movie_to_index)
    ].copy()
    test_df = test_df[
        test_df["userId"].isin(user_to_index) & test_df["movieId"].isin(movie_to_index)
    ].copy()

    train_matrix = make_sparse_matrix(train_df, user_to_index, movie_to_index)

    # Baseline normalization: subtract each user's mean rating so the factor model
    # learns interaction signal rather than absolute user bias.
    user_rating_sums = np.asarray(train_matrix.sum(axis=1)).reshape(-1)
    user_rating_counts = np.diff(train_matrix.indptr)
    user_means = np.divide(
        user_rating_sums,
        np.maximum(user_rating_counts, 1),
        out=np.zeros_like(user_rating_sums, dtype=np.float32),
    )

    centered = train_matrix.tolil(copy=True)
    for user_idx in range(centered.shape[0]):
        row_values = centered.data[user_idx]
        if row_values:
            centered.data[user_idx] = [value - user_means[user_idx] for value in row_values]
    centered = centered.tocsr()

    # Collaborative filtering via low-rank matrix factorization (SVD).
    # This approximates the sparse user-item matrix in latent feature space.
    component_count = min(n_components, max(1, min(centered.shape) - 1))
    svd = TruncatedSVD(n_components=component_count, random_state=random_state)
    user_factors = svd.fit_transform(centered)
    item_factors = svd.components_.T

    test_user_idx = test_df["userId"].map(user_to_index).to_numpy()
    test_movie_idx = test_df["movieId"].map(movie_to_index).to_numpy()
    actual = test_df["rating"].to_numpy(dtype=np.float32)

    pred_centered = np.sum(user_factors[test_user_idx] * item_factors[test_movie_idx], axis=1)
    predictions = np.clip(pred_centered + user_means[test_user_idx], 0.5, 5.0)

    # Evaluation metric: RMSE on held-out ratings.
    rmse = root_mean_squared_error(actual, predictions)

    user_seen_movies = train_df.groupby("userId")["movieId"].apply(list).to_dict()
    movie_titles = dict(zip(movies["movieId"], movies["title"]))

    artifacts_dir = project_root / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    # Persist everything required for inference/recommendation without retraining.
    model_bundle = {
        "svd": svd,
        "user_factors": user_factors,
        "item_factors": item_factors,
        "user_means": user_means,
        "global_mean": float(train_df["rating"].mean()),
        "user_to_index": user_to_index,
        "movie_to_index": movie_to_index,
        "index_to_user": index_to_user,
        "index_to_movie": index_to_movie,
        "user_seen_movies": user_seen_movies,
        "movie_titles": movie_titles,
        "metrics": {"rmse": float(rmse)},
    }

    output_path = artifacts_dir / "cf_model.joblib"
    joblib.dump(model_bundle, output_path)

    processed_dir = project_root / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    train_df.to_csv(processed_dir / "train_ratings.csv", index=False)
    test_df.to_csv(processed_dir / "test_ratings.csv", index=False)

    print(f"Training complete. RMSE: {rmse:.4f}")
    print(f"Model saved to: {output_path}")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[2]
    train_model(root)
