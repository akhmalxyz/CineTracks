package com.example.catalog_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.catalog_service.model.Movie;
import com.example.catalog_service.model.TvShow;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {

    @Autowired
    private TmdbService tmdbService;
    
    /**
     * Unified search across movies, TV shows, and anime
     * 
     * @param query The search query
     * @param page The page number (1-based)
     * @return Map containing search results by content type
     */
    public Map<String, Object> searchAll(String query, int page) {
        Map<String, Object> results = new HashMap<>();
        
        // Search for movies
        List<Movie> movies = tmdbService.searchMovies(query, page);
        
        // Search for TV shows
        List<TvShow> tvShows = tmdbService.searchTvShows(query, page);
        
        // Search for anime - filter TV shows that are anime
        List<TvShow> animeShows = tmdbService.searchAnime(query, page);
        
        // Add content type indicators to make frontend handling easier
        enrichMoviesWithContentType(movies);
        enrichTVShowsWithContentType(tvShows, "tvshow");
        enrichTVShowsWithContentType(animeShows, "anime");
        
        results.put("movies", movies);
        results.put("tvShows", tvShows);
        results.put("animeShows", animeShows);
        
        // Create a unified list of all results for easy display
        List<Object> combinedResults = new ArrayList<>();
        combinedResults.addAll(movies);
        combinedResults.addAll(tvShows);
        combinedResults.addAll(animeShows);
        results.put("allResults", combinedResults);
        
        return results;
    }
    
    /**
     * Add content type to movie objects
     */
    private void enrichMoviesWithContentType(List<Movie> movies) {
        for (Movie movie : movies) {
            movie.setContentType("movie");
        }
    }
    
    /**
     * Add content type to TV show objects
     */
    private void enrichTVShowsWithContentType(List<TvShow> tvShows, String contentType) {
        for (TvShow tvShow : tvShows) {
            tvShow.setContentType(contentType);
        }
    }
}
