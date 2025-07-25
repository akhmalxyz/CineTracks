package com.example.catalog_service.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TvShow {
    private Long id;
    private String name;
    private String overview;
    
    @JsonProperty("poster_path")
    private String posterPath;
    
    @JsonProperty("backdrop_path")
    private String backdropPath;
    
    @JsonProperty("first_air_date")
    private String firstAirDate;
    
    @JsonProperty("vote_average")
    private Double voteAverage;

    @JsonProperty("vote_count")
    private Integer voteCount;
    
    @JsonProperty("genre_ids")
    private List<Integer> genreIds;
    
    @JsonProperty("origin_country")
    private List<String> originCountry;
    
    @JsonProperty("original_language")
    private String originalLanguage;
    
    @JsonProperty("original_name")
    private String originalName;
    
    @JsonProperty("popularity")
    private Double popularity;
    
    // Added for trailer functionality
    private String trailerUrl;
    
    // Add a contentType field to support SearchService
    private String contentType;
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getOverview() {
        return overview;
    }
    
    public void setOverview(String overview) {
        this.overview = overview;
    }
    
    public String getPosterPath() {
        return posterPath;
    }
    
    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }
    
    public String getBackdropPath() {
        return backdropPath;
    }
    
    public void setBackdropPath(String backdropPath) {
        this.backdropPath = backdropPath;
    }
    
    public String getFirstAirDate() {
        return firstAirDate;
    }
    
    public void setFirstAirDate(String firstAirDate) {
        this.firstAirDate = firstAirDate;
    }
    
    public Double getVoteAverage() {
        return voteAverage;
    }

    public Integer getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }
    
    public void setVoteAverage(Double voteAverage) {
        this.voteAverage = voteAverage;
    }
    
    public List<Integer> getGenreIds() {
        return genreIds;
    }
    
    public void setGenreIds(List<Integer> genreIds) {
        this.genreIds = genreIds;
    }
    
    public List<String> getOriginCountry() {
        return originCountry;
    }
    
    public void setOriginCountry(List<String> originCountry) {
        this.originCountry = originCountry;
    }
    
    public String getOriginalLanguage() {
        return originalLanguage;
    }
    
    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }
    
    public String getOriginalName() {
        return originalName;
    }
    
    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }
    
    public Double getPopularity() {
        return popularity;
    }
    
    public void setPopularity(Double popularity) {
        this.popularity = popularity;
    }
    
    public String getTrailerUrl() {
        return trailerUrl;
    }
    
    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }
}
