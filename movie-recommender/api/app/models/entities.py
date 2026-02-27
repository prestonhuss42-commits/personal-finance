from sqlalchemy import Column, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from ..db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genres = Column(String, nullable=True)


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("user_id", "movie_id", name="uq_user_movie"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)

    user = relationship("User")
    movie = relationship("Movie")
