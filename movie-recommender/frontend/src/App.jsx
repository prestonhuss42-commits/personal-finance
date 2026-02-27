import { useState } from "react";
import MovieCard from "./components/MovieCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const [userId, setUserId] = useState(1);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/recommend/${userId}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Failed to fetch recommendations");
      }
      const payload = await response.json();
      setMovies(payload.recommendations || []);
    } catch (err) {
      setMovies([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Movie Recommendation System</h1>
      <div className="controls">
        <input
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          placeholder="Enter user ID"
        />
        <button onClick={fetchRecommendations} disabled={loading}>
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <section className="grid">
        {movies.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie} />
        ))}
      </section>
    </main>
  );
}
