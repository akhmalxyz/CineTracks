package com.example.catalog_service.model;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DetailedTvShow {
    private Long id;
    private String name;
    private String overview;
    private String tagline;
    private String status;
    private String homepage;
    
    @JsonProperty("poster_path")
    private String posterPath;
    
    @JsonProperty("backdrop_path")
    private String backdropPath;
    
    @JsonProperty("first_air_date")
    private String firstAirDate;
    
    @JsonProperty("last_air_date")
    private String lastAirDate;
    
    @JsonProperty("vote_average")
    private Double voteAverage;
    
    @JsonProperty("vote_count")
    private Integer voteCount;
    
    @JsonProperty("popularity")
    private Double popularity;
    
    @JsonProperty("number_of_seasons")
    private Integer numberOfSeasons;
    
    @JsonProperty("number_of_episodes")
    private Integer numberOfEpisodes;
    
    @JsonProperty("in_production")
    private Boolean inProduction;
    
    @JsonProperty("origin_country")
    private List<String> originCountry;
    
    @JsonProperty("original_language")
    private String originalLanguage;
    
    @JsonProperty("original_name")
    private String originalName;
    
    @JsonProperty("episode_run_time")
    private List<Integer> episodeRunTime;
    
    @JsonProperty("type")
    private String type;  // TV show type (e.g., scripted, reality, etc.)
    
    private List<Genre> genres;
    
    private List<Season> seasons;
    
    @JsonProperty("created_by")
    private List<Creator> createdBy;
    
    @JsonProperty("networks")
    private List<Network> networks;
    
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
    public static class Season {
        private Integer id;
        
        @JsonProperty("season_number")
        private Integer seasonNumber;
        
        @JsonProperty("episode_count")
        private Integer episodeCount;
        
        @JsonProperty("air_date")
        private String airDate;
        
        private String name;
        private String overview;
        
        @JsonProperty("poster_path")
        private String posterPath;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public Integer getSeasonNumber() { return seasonNumber; }
        public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }
        
        public Integer getEpisodeCount() { return episodeCount; }
        public void setEpisodeCount(Integer episodeCount) { this.episodeCount = episodeCount; }
        
        public String getAirDate() { return airDate; }
        public void setAirDate(String airDate) { this.airDate = airDate; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getOverview() { return overview; }
        public void setOverview(String overview) { this.overview = overview; }
        
        public String getPosterPath() { return posterPath; }
        public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Creator {
        private Integer id;
        private String name;
        
        @JsonProperty("profile_path")
        private String profilePath;
        
        private String imdbId;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getProfilePath() { return profilePath; }
        public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
        
        public String getImdbId() { return imdbId; }
        public void setImdbId(String imdbId) { this.imdbId = imdbId; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Network {
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
        private List<SimilarTvShow> results;
        
        public List<SimilarTvShow> getResults() { return results; }
        public void setResults(List<SimilarTvShow> results) { this.results = results; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SimilarTvShow {
        private Integer id;
        private String name;
        
        @JsonProperty("poster_path")
        private String posterPath;
        
        @JsonProperty("vote_average")
        private Double voteAverage;
        
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
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

    public String getFirstAirDate() {
        return firstAirDate;
    }

    public void setFirstAirDate(String firstAirDate) {
        this.firstAirDate = firstAirDate;
    }

    public String getLastAirDate() {
        return lastAirDate;
    }

    public void setLastAirDate(String lastAirDate) {
        this.lastAirDate = lastAirDate;
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

    public Double getPopularity() {
        return popularity;
    }

    public void setPopularity(Double popularity) {
        this.popularity = popularity;
    }

    public Integer getNumberOfSeasons() {
        return numberOfSeasons;
    }

    public void setNumberOfSeasons(Integer numberOfSeasons) {
        this.numberOfSeasons = numberOfSeasons;
    }

    public Integer getNumberOfEpisodes() {
        return numberOfEpisodes;
    }

    public void setNumberOfEpisodes(Integer numberOfEpisodes) {
        this.numberOfEpisodes = numberOfEpisodes;
    }

    public Boolean getInProduction() {
        return inProduction;
    }

    public void setInProduction(Boolean inProduction) {
        this.inProduction = inProduction;
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

    public List<Integer> getEpisodeRunTime() {
        return episodeRunTime;
    }

    public void setEpisodeRunTime(List<Integer> episodeRunTime) {
        this.episodeRunTime = episodeRunTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Genre> getGenres() {
        return genres;
    }

    public void setGenres(List<Genre> genres) {
        this.genres = genres;
    }

    public List<Season> getSeasons() {
        return seasons;
    }

    public void setSeasons(List<Season> seasons) {
        this.seasons = seasons;
    }

    public List<Creator> getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(List<Creator> createdBy) {
        this.createdBy = createdBy;
    }

    public List<Network> getNetworks() {
        return networks;
    }

    public void setNetworks(List<Network> networks) {
        this.networks = networks;
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
