package com.example.watchlist_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_watchlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieWatchlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String movieId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchStatus status;
    
    // Timestamp fields can be added for created/updated time
    private Long createdAt;
    private Long updatedAt;
}