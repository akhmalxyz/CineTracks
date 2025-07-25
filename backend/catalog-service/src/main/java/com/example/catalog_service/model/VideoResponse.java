package com.example.catalog_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class VideoResponse {
    private List<Video> results;
    
    public List<Video> getResults() {
        return results;
    }
    
    public void setResults(List<Video> results) {
        this.results = results;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Video {
        private String id;
        private String key;
        private String name;
        private String site;
        private String type;
        
        @JsonProperty("published_at")
        private String publishedAt;
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getKey() {
            return key;
        }
        
        public void setKey(String key) {
            this.key = key;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getSite() {
            return site;
        }
        
        public void setSite(String site) {
            this.site = site;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getPublishedAt() {
            return publishedAt;
        }
        
        public void setPublishedAt(String publishedAt) {
            this.publishedAt = publishedAt;
        }
    }
}