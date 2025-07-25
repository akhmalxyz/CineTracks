package com.example.catalog_service.model;

import java.util.List;

public class MovieResponse {
    private List<Movie> results;
    private int page;
    private int total_pages;
    private int total_results;
    
    // Getters and setters
    public List<Movie> getResults() {
        return results;
    }
    
    public void setResults(List<Movie> results) {
        this.results = results;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getTotal_pages() {
        return total_pages;
    }
    
    public void setTotal_pages(int total_pages) {
        this.total_pages = total_pages;
    }
    
    public int getTotal_results() {
        return total_results;
    }
    
    public void setTotal_results(int total_results) {
        this.total_results = total_results;
    }
}