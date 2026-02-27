export default function MovieCard({ movie }) {
  return (
    <div className="movie-card">
      <h3>{movie.title}</h3>
      <p>Movie ID: {movie.movie_id}</p>
      <p>Predicted Score: {movie.score.toFixed(2)}</p>
    </div>
  );
}
