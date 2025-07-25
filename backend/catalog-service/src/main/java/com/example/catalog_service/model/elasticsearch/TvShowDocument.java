package com.example.catalog_service.model.elasticsearch;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "tv_shows")
public class TvShowDocument {
    
    // Remove 'final' from all fields and ensure Lombok can generate setters
    @Id
    private Long id;
    
    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;
    
    @Field(type = FieldType.Text, analyzer = "standard")
    private String overview;
    
    @Field(type = FieldType.Keyword)
    private String posterPath;
    
    @Field(type = FieldType.Keyword)
    private String backdropPath;
    
    @Field(type = FieldType.Keyword)
    private String firstAirDate;
    
    @Field(type = FieldType.Float)
    private Float voteAverage;
    
    @Field(type = FieldType.Keyword)
    private String originalLanguage;
    
    // Content type to differentiate between movies and TV shows
    @Field(type = FieldType.Keyword)
    private String contentType;
    
    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }

    public String getFirstAirDate() { return firstAirDate; }
    public void setFirstAirDate(String firstAirDate) { this.firstAirDate = firstAirDate; }

    public Float getVoteAverage() { return voteAverage; }
    public void setVoteAverage(Float voteAverage) { this.voteAverage = voteAverage; }

    public String getOriginalLanguage() { return originalLanguage; }
    public void setOriginalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
}
