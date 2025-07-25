package com.example.watchlist_service.repository;

import com.example.watchlist_service.model.TvShowWatchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TvShowWatchlistRepository extends JpaRepository<TvShowWatchlist, Long> {
    List<TvShowWatchlist> findByUsername(String username);
    Optional<TvShowWatchlist> findByUsernameAndTvShowId(String username, String tvShowId);
}