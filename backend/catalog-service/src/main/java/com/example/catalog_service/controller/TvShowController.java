package com.example.catalog_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.catalog_service.model.DetailedTvShow;
import com.example.catalog_service.model.TvShow;
import com.example.catalog_service.service.TmdbService;

import java.util.List;

@RestController
@RequestMapping("api/catalog/tvshows")
public class TvShowController {
    
    @Autowired
    private TmdbService tmdbService;
    
    @GetMapping("/popular")
    public ResponseEntity<List<TvShow>> getPopularTvShows(
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> tvShows = tmdbService.getPopularTvShows(page);
        return ResponseEntity.ok(tvShows);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTvShowById(@PathVariable Long id) {
        return tmdbService.getDetailedTvShowInfo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TvShow>> searchTvShows(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> tvShows = tmdbService.searchTvShows(query, page);
        return ResponseEntity.ok(tvShows);
    }
    
    @GetMapping("/trending")
    public ResponseEntity<List<TvShow>> getTrendingTvShows(
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> tvShows = tmdbService.getTrendingTvShows(page);
        return ResponseEntity.ok(tvShows);
    }
    
    @GetMapping("/anime")
    public ResponseEntity<List<TvShow>> getAnime(
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> anime = tmdbService.getAnime(page);
        return ResponseEntity.ok(anime);
    }
    
    @GetMapping("/anime/search")
    public ResponseEntity<List<TvShow>> searchAnime(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> anime = tmdbService.searchAnime(query, page);
        return ResponseEntity.ok(anime);
    }
    
    @GetMapping("/anime/trending")
    public ResponseEntity<List<TvShow>> getTrendingAnime(
            @RequestParam(defaultValue = "1") int page) {
        List<TvShow> anime = tmdbService.getTrendingAnime(page);
        return ResponseEntity.ok(anime);
    }
    
    @GetMapping("/anime/{id}")
    public ResponseEntity<?> getAnimeById(@PathVariable Long id) {
        return tmdbService.getDetailedAnimeInfo(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
