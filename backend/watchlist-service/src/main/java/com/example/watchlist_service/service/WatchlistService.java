package com.example.watchlist_service.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.watchlist_service.model.MovieWatchlist;
import com.example.watchlist_service.model.TvShowWatchlist;
import com.example.watchlist_service.model.WatchStatus;
import com.example.watchlist_service.repository.MovieWatchlistRepository;
import com.example.watchlist_service.repository.TvShowWatchlistRepository;

@Service
public class WatchlistService {

    private final MovieWatchlistRepository movieWatchlistRepository;
    private final TvShowWatchlistRepository tvShowWatchlistRepository;

    public WatchlistService(MovieWatchlistRepository movieWatchlistRepository, 
                          TvShowWatchlistRepository tvShowWatchlistRepository) {
        this.movieWatchlistRepository = movieWatchlistRepository;
        this.tvShowWatchlistRepository = tvShowWatchlistRepository;
    }

    // Movie watchlist methods
    public List<MovieWatchlist> getMovieWatchlistForUser(String username) {
        return movieWatchlistRepository.findByUsername(username);
    }

    public MovieWatchlist addMovieToWatchlist(MovieWatchlist movieWatchlist) {
        // Set timestamp
        long currentTime = System.currentTimeMillis();
        movieWatchlist.setCreatedAt(currentTime);
        movieWatchlist.setUpdatedAt(currentTime);
        return movieWatchlistRepository.save(movieWatchlist);
    }

    public MovieWatchlist updateMovieWatchStatus(String username, String movieId, WatchStatus status) {
        Optional<MovieWatchlist> existingEntry = movieWatchlistRepository.findByUsernameAndMovieId(username, movieId);
        
        if (existingEntry.isPresent()) {
            MovieWatchlist movieWatchlist = existingEntry.get();
            movieWatchlist.setStatus(status);
            movieWatchlist.setUpdatedAt(System.currentTimeMillis());
            return movieWatchlistRepository.save(movieWatchlist);
        }
        
        return null;
    }

    public void removeMovieFromWatchlist(String username, String movieId) {
        Optional<MovieWatchlist> existingEntry = movieWatchlistRepository.findByUsernameAndMovieId(username, movieId);
        existingEntry.ifPresent(movieWatchlistRepository::delete);
    }

    // TV Show watchlist methods
    public List<TvShowWatchlist> getTvShowWatchlistForUser(String username) {
        return tvShowWatchlistRepository.findByUsername(username);
    }

    public TvShowWatchlist addTvShowToWatchlist(TvShowWatchlist tvShowWatchlist) {
        // Set timestamp
        long currentTime = System.currentTimeMillis();
        tvShowWatchlist.setCreatedAt(currentTime);
        tvShowWatchlist.setUpdatedAt(currentTime);
        return tvShowWatchlistRepository.save(tvShowWatchlist);
    }

    public TvShowWatchlist updateTvShowWatchStatus(String username, String tvShowId, 
                                              WatchStatus status, Integer currentSeason, Integer currentEpisode) {
        Optional<TvShowWatchlist> existingEntry = tvShowWatchlistRepository.findByUsernameAndTvShowId(username, tvShowId);
        
        if (existingEntry.isPresent()) {
            TvShowWatchlist tvShowWatchlist = existingEntry.get();
            tvShowWatchlist.setStatus(status);
            
            if (currentSeason != null) {
                tvShowWatchlist.setCurrentSeason(currentSeason);
            }
            
            if (currentEpisode != null) {
                tvShowWatchlist.setCurrentEpisode(currentEpisode);
            }
            
            tvShowWatchlist.setUpdatedAt(System.currentTimeMillis());
            return tvShowWatchlistRepository.save(tvShowWatchlist);
        }
        
        return null;
    }

    public void removeTvShowFromWatchlist(String username, String tvShowId) {
        Optional<TvShowWatchlist> existingEntry = tvShowWatchlistRepository.findByUsernameAndTvShowId(username, tvShowId);
        existingEntry.ifPresent(tvShowWatchlistRepository::delete);
    }
}