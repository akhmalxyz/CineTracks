package com.example.catalog_service.model;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DetailedMovie {
    private Long id;
    private String title;
    private String overview;
    private String tagline;
    private String status;
    private String homepage;
    
    @JsonProperty("poster_path")
    private String posterPath;
    
    @JsonProperty("backdrop_path")
    private String backdropPath;
    
    @JsonProperty("release_date")
    private String releaseDate;
    
    @JsonProperty("vote_average")
    private Double voteAverage;
    
    @JsonProperty("vote_count")
    private Integer voteCount;
    
    @JsonProperty("runtime")
    private Integer runtime;
    
    @JsonProperty("budget")
    private Long budget;
    
    @JsonProperty("revenue")
    private Long revenue;
    
    @JsonProperty("popularity")
    private Double popularity;
    
    @JsonProperty("belongs_to_collection")
    private Map<String, Object> belongsToCollection;
    
    private List<Genre> genres;
    
    @JsonProperty("production_companies")
    private List<ProductionCompany> productionCompanies;
    
    @JsonProperty("production_countries")
    private List<ProductionCountry> productionCountries;
    
    @JsonProperty("spoken_languages")
    private List<SpokenLanguage> spokenLanguages;
    
    private Credits credits;
    private Similar similar;
    private String trailerUrl;

    // Nested classes for complex properties
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Genre {
        private Integer id;
        private String name;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProductionCompany {
        private Integer id;
        private String name;
        
        @JsonProperty("logo_path")
        private String logoPath;
        
        @JsonProperty("origin_country")
        private String originCountry;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getLogoPath() { return logoPath; }
        public void setLogoPath(String logoPath) { this.logoPath = logoPath; }
        
        public String getOriginCountry() { return originCountry; }
        public void setOriginCountry(String originCountry) { this.originCountry = originCountry; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProductionCountry {
        @JsonProperty("iso_3166_1")
        private String iso;
        
        private String name;
        
        public String getIso() { return iso; }
        public void setIso(String iso) { this.iso = iso; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SpokenLanguage {
        @JsonProperty("english_name")
        private String englishName;
        
        @JsonProperty("iso_639_1")
        private String iso;
        
        private String name;
        
        public String getEnglishName() { return englishName; }
        public void setEnglishName(String englishName) { this.englishName = englishName; }
        
        public String getIso() { return iso; }
        public void setIso(String iso) { this.iso = iso; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Credits {
        private List<Cast> cast;
        private List<Crew> crew;
        
        public List<Cast> getCast() { return cast; }
        public void setCast(List<Cast> cast) { this.cast = cast; }
        
        public List<Crew> getCrew() { return crew; }
        public void setCrew(List<Crew> crew) { this.crew = crew; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Cast {
        private Integer id;
        private String name;
        private String character;
        private String imdbId;
        
        @JsonProperty("profile_path")
        private String profilePath;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getCharacter() { return character; }
        public void setCharacter(String character) { this.character = character; }
        
        public String getProfilePath() { return profilePath; }
        public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
        
        public String getImdbId() { return imdbId; }
        public void setImdbId(String imdbId) { this.imdbId = imdbId; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Crew {
        private Integer id;
        private String name;
        private String job;
        private String imdbId;
        
        @JsonProperty("profile_path")
        private String profilePath;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getJob() { return job; }
        public void setJob(String job) { this.job = job; }
        
        public String getProfilePath() { return profilePath; }
        public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
        
        public String getImdbId() { return imdbId; }
        public void setImdbId(String imdbId) { this.imdbId = imdbId; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Similar {
        private List<SimilarMovie> results;
        
        public List<SimilarMovie> getResults() { return results; }
        public void setResults(List<SimilarMovie> results) { this.results = results; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SimilarMovie {
        private Integer id;
        private String title;
        
        @JsonProperty("poster_path")
        private String posterPath;
        
        @JsonProperty("vote_average")
        private Double voteAverage;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getPosterPath() { return posterPath; }
        public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
        
        public Double getVoteAverage() { return voteAverage; }
        public void setVoteAverage(Double voteAverage) { this.voteAverage = voteAverage; }
    }

    // Getters and Setters for the main class
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHomepage() {
        return homepage;
    }

    public void setHomepage(String homepage) {
        this.homepage = homepage;
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

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Double getVoteAverage() {
        return voteAverage;
    }

    public void setVoteAverage(Double voteAverage) {
        this.voteAverage = voteAverage;
    }

    public Integer getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }

    public Integer getRuntime() {
        return runtime;
    }

    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
    }

    public Long getBudget() {
        return budget;
    }

    public void setBudget(Long budget) {
        this.budget = budget;
    }

    public Long getRevenue() {
        return revenue;
    }

    public void setRevenue(Long revenue) {
        this.revenue = revenue;
    }

    public Double getPopularity() {
        return popularity;
    }

    public void setPopularity(Double popularity) {
        this.popularity = popularity;
    }

    public Map<String, Object> getBelongsToCollection() {
        return belongsToCollection;
    }

    public void setBelongsToCollection(Map<String, Object> belongsToCollection) {
        this.belongsToCollection = belongsToCollection;
    }

    public List<Genre> getGenres() {
        return genres;
    }

    public void setGenres(List<Genre> genres) {
        this.genres = genres;
    }

    public List<ProductionCompany> getProductionCompanies() {
        return productionCompanies;
    }

    public void setProductionCompanies(List<ProductionCompany> productionCompanies) {
        this.productionCompanies = productionCompanies;
    }

    public List<ProductionCountry> getProductionCountries() {
        return productionCountries;
    }

    public void setProductionCountries(List<ProductionCountry> productionCountries) {
        this.productionCountries = productionCountries;
    }

    public List<SpokenLanguage> getSpokenLanguages() {
        return spokenLanguages;
    }

    public void setSpokenLanguages(List<SpokenLanguage> spokenLanguages) {
        this.spokenLanguages = spokenLanguages;
    }
    
    public Credits getCredits() {
        return credits;
    }

    public void setCredits(Credits credits) {
        this.credits = credits;
    }

    public Similar getSimilar() {
        return similar;
    }

    public void setSimilar(Similar similar) {
        this.similar = similar;
    }
    
    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }
}