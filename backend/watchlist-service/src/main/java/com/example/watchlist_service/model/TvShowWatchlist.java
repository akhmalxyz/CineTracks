package com.example.watchlist_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tv_show_watchlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TvShowWatchlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String tvShowId;
    
    // Current episode details
    private Integer currentSeason;
    private Integer currentEpisode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchStatus status;
    
    // Timestamp fields
    private Long createdAt;
    private Long updatedAt;
}