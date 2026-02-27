# Production-Ready Movie Recommendation System

This project implements a collaborative filtering recommendation system trained on MovieLens, served via FastAPI, persisted with SQLite, and optionally consumed by a React frontend.

## 1) Project Folder Structure

```text
movie-recommender/
├── api/
│   ├── app/
│   │   ├── db/
│   │   │   ├── init_db.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   └── entities.py
│   │   ├── routers/
│   │   │   └── recommendations.py
│   │   ├── schemas/
│   │   │   ├── prediction.py
│   │   │   └── recommendation.py
│   │   ├── services/
│   │   │   └── recommender.py
│   │   ├── config.py
│   │   └── main.py
│   └── run.py
├── ml/
│   └── src/
│       └── train.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MovieCard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── data/
│   ├── raw/
│   └── processed/
├── artifacts/
├── scripts/
│   └── train_and_run.ps1
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 2) ML Pipeline (Collaborative Filtering)

### What is implemented
- **Algorithm:** Matrix factorization with `TruncatedSVD` (scikit-learn)
- **Dataset:** MovieLens Latest Small (`ml-latest-small`)
- **Data cleaning:** Null removal, rating range filtering, type normalization
- **Preprocessing:** User/movie index mapping, sparse matrix creation, user-mean centering
- **Split:** Train/test with `train_test_split`
- **Evaluation:** RMSE on held-out test ratings
- **Persistence:** `joblib` model bundle in `artifacts/cf_model.joblib`

### Run training

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m ml.src.train
```

Training output includes RMSE and artifact location.

## 3) Backend API (FastAPI)

### Endpoints
- `GET /recommend/{user_id}` → top 5 recommended movies
- `POST /predict` → predicted rating for a `(user_id, movie_id)` pair
- `GET /health` → health check

### API request example

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "movie_id": 50}'
```

### Run API

```bash
cd api
python run.py
```

## 4) Database Layer (SQLite)

### Tables
- `users`
- `movies`
- `ratings`

### Behavior
- SQLAlchemy manages schema creation at startup.
- DB is seeded from MovieLens CSV files (if empty).
- Endpoints validate `user_id` and `movie_id` against DB records.

## 5) Frontend (React, Optional)

### Features
- Input a user ID
- Click button to fetch recommendations
- Display movie cards with title, movie ID, predicted score

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

By default it calls `http://localhost:8000`. Override with `VITE_API_BASE`.

## 6) Environment Variables

Copy and edit:

```bash
copy .env.example .env
```

Variables:
- `APP_NAME`
- `API_HOST`
- `API_PORT`
- `DATABASE_URL`
- `MODEL_PATH`
- `TOP_K`

## 7) Docker (Optional)

```bash
docker compose up --build
```

Starts:
- API on `http://localhost:8000`
- Frontend on `http://localhost:5173`

## 8) Production Notes

- Model loading is cached in the API to avoid reloading per request.
- Pydantic request/response schemas enforce API contracts.
- Error handling returns HTTP 404 for unknown users/movies.
- Artifacts are separated from source code for clean deployment boundaries.
- The structure is modular and supports adding retraining jobs, auth, and PostgreSQL migration.
