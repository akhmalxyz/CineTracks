package com.example.catalog_service.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.catalog_service.service.SearchService;

@RestController
@RequestMapping("/api/catalog/search")
public class SearchController {

    @Autowired
    private SearchService searchService;
    
    /**
     * Unified search endpoint that searches across movies, TV shows, and anime
     * 
     * @param query The search query
     * @param page The page number (defaults to 1)
     * @return Combined search results
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> searchAll(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        Map<String, Object> results = searchService.searchAll(query, page);
        return ResponseEntity.ok(results);
    }
}
