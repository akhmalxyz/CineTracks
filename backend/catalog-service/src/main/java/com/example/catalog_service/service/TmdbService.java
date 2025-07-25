package com.example.catalog_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.catalog_service.config.TmdbProperties;
import com.example.catalog_service.model.DetailedMovie;
import com.example.catalog_service.model.DetailedTvShow;
import com.example.catalog_service.model.Movie;
import com.example.catalog_service.model.MovieResponse;
import com.example.catalog_service.model.TvShow;
import com.example.catalog_service.model.TvShowResponse;
import com.example.catalog_service.model.VideoResponse;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
public class TmdbService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private TmdbProperties tmdbProperties;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);
    
    public List<Movie> getPopularMovies(int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/popular")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            MovieResponse response = restTemplate.getForObject(url, MovieResponse.class);
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each movie
                List<Movie> movies = response.getResults();
                for (Movie movie : movies) {
                    fetchAndSetTrailerUrl(movie);
                }
                return movies;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    public Optional<Movie> getMovieDetails(Long movieId) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId)
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            Movie movie = restTemplate.getForObject(url, Movie.class);
            if (movie != null) {
                fetchAndSetTrailerUrl(movie);
            }
            return Optional.ofNullable(movie);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
    
    /**
     * Get comprehensive details about a movie including credits and similar movies
     */
    public Optional<DetailedMovie> getDetailedMovieInfo(Long movieId) {
        try {
            // 1. Get basic movie details
            String movieUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId)
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie movie = restTemplate.getForObject(movieUrl, DetailedMovie.class);
            if (movie == null) {
                return Optional.empty();
            }
            
            // 2. Get credits (cast and crew)
            String creditsUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId + "/credits")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie.Credits credits = restTemplate.getForObject(creditsUrl, DetailedMovie.Credits.class);
            if (credits != null) {
                movie.setCredits(credits);
                
                // Fetch IMDb IDs for cast and crew in parallel (for better performance)
                if (credits.getCast() != null) {                    List<CompletableFuture<Void>> castFutures = credits.getCast().stream()
                        .map(castMember -> CompletableFuture.runAsync(() -> {
                            fetchAndSetImdbId(castMember.getId(), id -> castMember.setImdbId(id));
                        }, executorService))
                        .toList();
                    
                    // Wait for all cast IMDb IDs to be fetched
                    CompletableFuture.allOf(castFutures.toArray(new CompletableFuture[0])).join();
                }
                
                if (credits.getCrew() != null) {                    List<CompletableFuture<Void>> crewFutures = credits.getCrew().stream()
                        .map(crewMember -> CompletableFuture.runAsync(() -> {
                            fetchAndSetImdbId(crewMember.getId(), id -> crewMember.setImdbId(id));
                        }, executorService))
                        .toList();
                    
                    // Wait for all crew IMDb IDs to be fetched
                    CompletableFuture.allOf(crewFutures.toArray(new CompletableFuture[0])).join();
                }
            }
            
            // 3. Get similar movies
            String similarUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movieId + "/similar")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .build()
                .toUriString();
                
            DetailedMovie.Similar similar = restTemplate.getForObject(similarUrl, DetailedMovie.Similar.class);
            if (similar != null) {
                movie.setSimilar(similar);
            }
            
            // 4. Get trailer URL
            fetchTrailerForDetailedMovie(movie);
            
            return Optional.of(movie);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }    /**
     * Fetch external IDs (including IMDb ID) for a person from TMDB API
     */
    private void fetchAndSetImdbId(Integer personId, Consumer<String> setter) {
        if (personId == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/person/" + personId + "/external_ids")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null && response.has("imdb_id") && !response.get("imdb_id").isNull()) {
                setter.accept(response.get("imdb_id").asText());
            }
        } catch (Exception e) {
            System.err.println("Error fetching IMDB ID for person " + personId + ": " + e.getMessage());
        }
    }
    
    /**
     * Fetch and set the trailer URL for a movie
     */
    private void fetchAndSetTrailerUrl(Movie movie) {
        if (movie == null || movie.getId() == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movie.getId() + "/videos")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            VideoResponse videoResponse = restTemplate.getForObject(url, VideoResponse.class);
            if (videoResponse != null && videoResponse.getResults() != null && !videoResponse.getResults().isEmpty()) {
                // Find a YouTube trailer
                videoResponse.getResults().stream()
                    .filter(video -> "YouTube".equalsIgnoreCase(video.getSite()) && 
                                    ("Trailer".equalsIgnoreCase(video.getType()) || "Teaser".equalsIgnoreCase(video.getType())))
                    .findFirst()
                    .ifPresent(video -> {
                        String youtubeUrl = "https://www.youtube.com/watch?v=" + video.getKey();
                        movie.setTrailerUrl(youtubeUrl);
                    });
            }
        } catch (Exception e) {
            // Log error but continue
            System.err.println("Error fetching trailer for movie " + movie.getId() + ": " + e.getMessage());
        }
    }
    
    /**
     * Fetch and set the trailer URL for a detailed movie
     */
    private void fetchTrailerForDetailedMovie(DetailedMovie movie) {
        if (movie == null || movie.getId() == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/movie/" + movie.getId() + "/videos")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            VideoResponse videoResponse = restTemplate.getForObject(url, VideoResponse.class);
            if (videoResponse != null && videoResponse.getResults() != null && !videoResponse.getResults().isEmpty()) {
                // Find a YouTube trailer
                videoResponse.getResults().stream()
                    .filter(video -> "YouTube".equalsIgnoreCase(video.getSite()) && 
                                    ("Trailer".equalsIgnoreCase(video.getType()) || 
                                     "Teaser".equalsIgnoreCase(video.getType())))
                    .findFirst()
                    .ifPresent(video -> {
                        String youtubeUrl = "https://www.youtube.com/watch?v=" + video.getKey();
                        movie.setTrailerUrl(youtubeUrl);
                    });
            }
        } catch (Exception e) {
            // Log error but continue
            System.err.println("Error fetching trailer for movie " + movie.getId() + ": " + e.getMessage());
        }
    }
    
    // TV SHOW METHODS
    
    /**
     * Get popular TV shows
     */
    public List<TvShow> getPopularTvShows(int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/discover/tv")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("sort_by", "popularity.desc")
            .queryParam("first_air_date.gte", "2025-01-01")
            .queryParam("without_genres", "16") // Exclude animation genre
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each TV show
                List<TvShow> tvShows = response.getResults();
                for (TvShow tvShow : tvShows) {
                    fetchAndSetTvTrailerUrl(tvShow);
                }
                return tvShows;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Get trending TV shows
     */
    public List<TvShow> getTrendingTvShows(int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/trending/tv/week")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each TV show
                List<TvShow> tvShows = response.getResults();
                for (TvShow tvShow : tvShows) {
                    fetchAndSetTvTrailerUrl(tvShow);
                }
                return tvShows;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Search for TV shows
     */
    public List<TvShow> searchTvShows(String query, int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/search/tv")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("query", query)
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {
                List<TvShow> tvShows = response.getResults().stream()
                    .filter(tvShow -> {
                        List<Integer> genres = tvShow.getGenreIds();
                        List<String> origin = tvShow.getOriginCountry();
                        // Filter out only if it's both animated AND from Japan
                        boolean isAnime = (genres != null && genres.contains(16)) &&
                                        (origin != null && origin.contains("JP"));
                        return !isAnime;
                    })
                    .collect(Collectors.toList());
                for (TvShow tvShow : tvShows) {
                    fetchAndSetTvTrailerUrl(tvShow);
                }
                return tvShows;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Get detailed TV show information including credits, similar shows, and videos
     */
    public Optional<DetailedTvShow> getDetailedTvShowInfo(Long tvShowId) {
        try {
            // 1. Get basic TV show details
            String tvShowUrl = UriComponentsBuilder
                .fromUriString(tmdbProperties.getBaseUrl() + "/tv/" + tvShowId)
                .queryParam("api_key", tmdbProperties.getApiKey())
                .queryParam("append_to_response", "credits,similar")
                .build()
                .toUriString();
                
            DetailedTvShow tvShow = restTemplate.getForObject(tvShowUrl, DetailedTvShow.class);
            if (tvShow == null) {
                return Optional.empty();
            }
            
            // 2. Process creator IMDb IDs if available
            if (tvShow.getCreatedBy() != null && !tvShow.getCreatedBy().isEmpty()) {
                List<CompletableFuture<Void>> creatorFutures = tvShow.getCreatedBy().stream()
                    .map(creator -> CompletableFuture.runAsync(() -> {
                        // Use Consumer functional interface for TV show
                        fetchAndSetImdbId(creator.getId(), id -> creator.setImdbId(id));
                    }, executorService))
                    .toList();
                
                // Wait for all creator IMDb IDs to be fetched
                CompletableFuture.allOf(creatorFutures.toArray(new CompletableFuture[0])).join();
            }
            
            // 3. Process cast and crew IMDb IDs
            if (tvShow.getCredits() != null) {
                if (tvShow.getCredits().getCast() != null) {
                    List<CompletableFuture<Void>> castFutures = tvShow.getCredits().getCast().stream()
                        .map(castMember -> CompletableFuture.runAsync(() -> {
                            // Use Consumer functional interface for TV show
                            fetchAndSetImdbId(castMember.getId(), id -> castMember.setImdbId(id));
                        }, executorService))
                        .toList();
                    
                    // Wait for all cast IMDb IDs to be fetched
                    CompletableFuture.allOf(castFutures.toArray(new CompletableFuture[0])).join();
                }
                
                if (tvShow.getCredits().getCrew() != null) {
                    List<CompletableFuture<Void>> crewFutures = tvShow.getCredits().getCrew().stream()
                        .map(crewMember -> CompletableFuture.runAsync(() -> {
                            // Use Consumer functional interface for TV show
                            fetchAndSetImdbId(crewMember.getId(), id -> crewMember.setImdbId(id));
                        }, executorService))
                        .toList();
                    
                    // Wait for all crew IMDb IDs to be fetched
                    CompletableFuture.allOf(crewFutures.toArray(new CompletableFuture[0])).join();
                }
            }
            
            // 4. Get trailer URL
            fetchTrailerForDetailedTvShow(tvShow);
            
            return Optional.of(tvShow);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }
    
    /**
     * Fetch and set the trailer URL for a TV show
     */
    private void fetchAndSetTvTrailerUrl(TvShow tvShow) {
        if (tvShow == null || tvShow.getId() == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/tv/" + tvShow.getId() + "/videos")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            VideoResponse videoResponse = restTemplate.getForObject(url, VideoResponse.class);
            if (videoResponse != null && videoResponse.getResults() != null && !videoResponse.getResults().isEmpty()) {
                // Find a YouTube trailer
                videoResponse.getResults().stream()
                    .filter(video -> "YouTube".equalsIgnoreCase(video.getSite()) && 
                                    ("Trailer".equalsIgnoreCase(video.getType()) || 
                                     "Teaser".equalsIgnoreCase(video.getType())))
                    .findFirst()
                    .ifPresent(video -> {
                        String youtubeUrl = "https://www.youtube.com/watch?v=" + video.getKey();
                        tvShow.setTrailerUrl(youtubeUrl);
                    });
            }
        } catch (Exception e) {
            // Log error but continue
            System.err.println("Error fetching trailer for TV show " + tvShow.getId() + ": " + e.getMessage());
        }
    }
    
    /**
     * Fetch and set the trailer URL for a detailed TV show
     */
    private void fetchTrailerForDetailedTvShow(DetailedTvShow tvShow) {
        if (tvShow == null || tvShow.getId() == null) {
            return;
        }
        
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/tv/" + tvShow.getId() + "/videos")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .build()
            .toUriString();
            
        try {
            VideoResponse videoResponse = restTemplate.getForObject(url, VideoResponse.class);
            if (videoResponse != null && videoResponse.getResults() != null && !videoResponse.getResults().isEmpty()) {
                // Find a YouTube trailer
                videoResponse.getResults().stream()
                    .filter(video -> "YouTube".equalsIgnoreCase(video.getSite()) && 
                                    ("Trailer".equalsIgnoreCase(video.getType()) || 
                                     "Teaser".equalsIgnoreCase(video.getType())))
                    .findFirst()
                    .ifPresent(video -> {
                        String youtubeUrl = "https://www.youtube.com/watch?v=" + video.getKey();
                        tvShow.setTrailerUrl(youtubeUrl);
                    });
            }
        } catch (Exception e) {
            // Log error but continue
            System.err.println("Error fetching trailer for TV show " + tvShow.getId() + ": " + e.getMessage());
        }
    }
    
    // ANIME METHODS - Using TMDB's TV show API with anime-specific filtering
    
    /**
     * Get anime (Japanese animation TV shows)
     * Uses TV show endpoints with filtering for anime content
     */
    public List<TvShow> getAnime(int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/discover/tv")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("with_original_language", "ja") // Japanese content
            .queryParam("with_genres", "16") // Animation genre
            .queryParam("sort_by", "popularity.desc") // Most popular (trending)
            .queryParam("vote_count.gte", 100) // Only shows with enough votes
            .queryParam("first_air_date.gte", "2023-01-01") // Only recent shows
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {
                List<TvShow> animeShows = response.getResults();
                for (TvShow anime : animeShows) {
                    fetchAndSetTvTrailerUrl(anime);
                }
                return animeShows;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Search for anime
     */
    public List<TvShow> searchAnime(String query, int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/search/tv")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("query", query)
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {

                List<TvShow> animeShows = response.getResults().stream()
                .filter(tvShow -> {
                    List<Integer> genres = tvShow.getGenreIds();
                    List<String> origin = tvShow.getOriginCountry();
                    String lang = tvShow.getOriginalLanguage();

                    boolean isAnimated = genres != null && genres.contains(16);
                    boolean isJapaneseOrigin = (origin != null && origin.contains("JP")) || "ja".equalsIgnoreCase(lang);

                    return isAnimated && isJapaneseOrigin;
                })
                .collect(Collectors.toList());

                for (TvShow anime : animeShows) {
                    fetchAndSetTvTrailerUrl(anime);
                }
                return animeShows;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    
    /**
     * Get trending anime
     */
    public List<TvShow> getTrendingAnime(int page) {
        // First get trending TV shows
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/trending/tv/week")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            TvShowResponse response = restTemplate.getForObject(url, TvShowResponse.class);
            if (response != null && response.getResults() != null) {
                // Filter to only include Japanese animation
                List<TvShow> trendingAnime = response.getResults().stream()
                    .filter(show -> "ja".equals(show.getOriginalLanguage()) && 
                                   (show.getGenreIds() != null && show.getGenreIds().contains(16)))
                    .toList();
                
                for (TvShow anime : trendingAnime) {
                    fetchAndSetTvTrailerUrl(anime);
                }
                return trendingAnime;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
      /**
     * Get detailed anime information
     * This is essentially the same as getDetailedTvShowInfo but ensures it's an anime
     */
    public Optional<DetailedTvShow> getDetailedAnimeInfo(Long animeId) {
        Optional<DetailedTvShow> tvShowDetail = getDetailedTvShowInfo(animeId);
        
        // Verify it's actually an anime (Japanese animation)
        if (tvShowDetail.isPresent()) {
            DetailedTvShow show = tvShowDetail.get();
            boolean isJapanese = "ja".equals(show.getOriginalLanguage());
            boolean isAnimation = show.getGenres() != null && 
                                 show.getGenres().stream().anyMatch(genre -> genre.getId() == 16);
                                 
            if (isJapanese && isAnimation) {
                return tvShowDetail;
            }
            return Optional.empty();
        }
        
        return Optional.empty();
    }
    /**
     * Search for movies
     */
    public List<Movie> searchMovies(String query, int page) {
        String url = UriComponentsBuilder
            .fromUriString(tmdbProperties.getBaseUrl() + "/search/movie")
            .queryParam("api_key", tmdbProperties.getApiKey())
            .queryParam("query", query)
            .queryParam("page", page)
            .build()
            .toUriString();
            
        try {
            MovieResponse response = restTemplate.getForObject(url, MovieResponse.class);
            if (response != null && response.getResults() != null) {
                // Fetch trailer URLs for each movie asynchronously
                List<CompletableFuture<Void>> futures = response.getResults().stream()
                    .map(movie -> CompletableFuture.runAsync(() -> fetchAndSetTrailerUrl(movie), executorService))
                    .toList();
                
                // Wait for all trailer fetching to complete
                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
                
                return response.getResults();
            }
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}