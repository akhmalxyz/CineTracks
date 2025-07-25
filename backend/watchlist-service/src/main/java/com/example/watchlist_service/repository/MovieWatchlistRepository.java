package com.example.watchlist_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.watchlist_service.model.MovieWatchlist;

@Repository
public interface MovieWatchlistRepository extends JpaRepository<MovieWatchlist, Long> {
    List<MovieWatchlist> findByUsername(String username);
    Optional<MovieWatchlist> findByUsernameAndMovieId(String username, String movieId);
}