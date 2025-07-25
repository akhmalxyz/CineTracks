package com.example.watchlist_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.watchlist_service.model.MovieWatchlist;
import com.example.watchlist_service.model.TvShowWatchlist;
import com.example.watchlist_service.model.WatchStatus;
import com.example.watchlist_service.service.WatchlistService;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    // Movie watchlist endpoints
    @GetMapping("/movies/{username}")
    public ResponseEntity<List<MovieWatchlist>> getMovieWatchlist(@PathVariable String username) {
        return ResponseEntity.ok(watchlistService.getMovieWatchlistForUser(username));
    }

    @PostMapping("/movies")
    public ResponseEntity<MovieWatchlist> addMovieToWatchlist(@RequestBody MovieWatchlist movieWatchlist) {
        return new ResponseEntity<>(watchlistService.addMovieToWatchlist(movieWatchlist), HttpStatus.CREATED);
    }

    @PutMapping("/movies/{username}/{movieId}")
    public ResponseEntity<MovieWatchlist> updateMovieWatchStatus(
            @PathVariable String username,
            @PathVariable String movieId,
            @RequestBody Map<String, String> statusUpdate) {
        
        WatchStatus status = WatchStatus.valueOf(statusUpdate.get("status"));
        MovieWatchlist updated = watchlistService.updateMovieWatchStatus(username, movieId, status);
        
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/movies/{username}/{movieId}")
    public ResponseEntity<Void> removeMovieFromWatchlist(
            @PathVariable String username,
            @PathVariable String movieId) {
        
        watchlistService.removeMovieFromWatchlist(username, movieId);
        return ResponseEntity.noContent().build();
    }

    // TV Show watchlist endpoints
    @GetMapping("/tvshows/{username}")
    public ResponseEntity<List<TvShowWatchlist>> getTvShowWatchlist(@PathVariable String username) {
        return ResponseEntity.ok(watchlistService.getTvShowWatchlistForUser(username));
    }

    @PostMapping("/tvshows")
    public ResponseEntity<TvShowWatchlist> addTvShowToWatchlist(@RequestBody TvShowWatchlist tvShowWatchlist) {
        return new ResponseEntity<>(watchlistService.addTvShowToWatchlist(tvShowWatchlist), HttpStatus.CREATED);
    }

    @PutMapping("/tvshows/{username}/{tvShowId}")
    public ResponseEntity<TvShowWatchlist> updateTvShowWatchStatus(
            @PathVariable String username,
            @PathVariable String tvShowId,
            @RequestBody Map<String, Object> statusUpdate) {
        
        WatchStatus status = WatchStatus.valueOf((String) statusUpdate.get("status"));
        Integer currentSeason = (Integer) statusUpdate.get("currentSeason");
        Integer currentEpisode = (Integer) statusUpdate.get("currentEpisode");
        
        TvShowWatchlist updated = watchlistService.updateTvShowWatchStatus(
            username, tvShowId, status, currentSeason, currentEpisode);
        
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/tvshows/{username}/{tvShowId}")
    public ResponseEntity<Void> removeTvShowFromWatchlist(
            @PathVariable String username,
            @PathVariable String tvShowId) {
        
        watchlistService.removeTvShowFromWatchlist(username, tvShowId);
        return ResponseEntity.noContent().build();
    }
}