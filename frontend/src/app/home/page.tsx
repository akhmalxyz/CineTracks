'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FaFilm, FaTv, FaList, FaSignOutAlt, FaUserCircle, FaSearch, FaPlay, FaChevronRight, FaChevronLeft, FaPlus, FaCalendarAlt, FaCog, FaStar, FaCheckCircle, FaRegClock, FaRegEye, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { MovieWatchlistItem, TvShowWatchlistItem, WatchStatus } from '@/types';
import { getMovieWatchlist, getTvShowWatchlist, updateTvShowWatchStatus, removeMovieFromWatchlist, removeTvShowFromWatchlist, updateMovieWatchStatus } from '@/utils/watchlistApi';
import debounce from 'lodash/debounce';

// Define Movie interface based on the API response
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  trailerUrl?: string; // Added for trailer functionality
}

// Define TV Show interface
interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  trailerUrl?: string;
  // Add properties needed for the watchlist functionality
  number_of_seasons?: number;
  seasons?: {
    id: number;
    season_number: number;
    episode_count: number;
    air_date?: string;
    name: string;
    overview?: string;
    poster_path?: string;
  }[];
}

// Anime is essentially a TV show with specific properties
type Anime = TvShow;

export default function Home() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<TvShow[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingTvShows, setIsLoadingTvShows] = useState(true);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Watchlist states
  const [movieWatchlist, setMovieWatchlist] = useState<MovieWatchlistItem[]>([]);
  const [tvShowWatchlist, setTvShowWatchlist] = useState<TvShowWatchlistItem[]>([]);
  const [isLoadingMovieWatchlist, setIsLoadingMovieWatchlist] = useState(false);
  const [isLoadingTvShowWatchlist, setIsLoadingTvShowWatchlist] = useState(false);
  const [watchlistMovieDetails, setWatchlistMovieDetails] = useState<{[id: string]: Movie}>({});
  const [watchlistTvShowDetails, setWatchlistTvShowDetails] = useState<{[id: string]: TvShow}>({});
    // Episode progress tracking states
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [editingTvShowItem, setEditingTvShowItem] = useState<TvShowWatchlistItem | null>(null);
  const [currentSeasonInput, setCurrentSeasonInput] = useState<number>(1);
  const [currentEpisodeInput, setCurrentEpisodeInput] = useState<number>(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [currentTvShowDetails, setCurrentTvShowDetails] = useState<any>(null);  // --- Subtle remove button, only on hover, for all watchlist sections ---
  // Wrap each card (movie or tv) in a group and use group-hover to show the cross
  const [openSeasonDropdown, setOpenSeasonDropdown] = useState<string|null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({
    top: 0,
    left: 0,
    width: 0
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // Ref for the dropdown menu and button
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  // Add a ref map for season buttons
  const seasonButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Function to fetch movie details for watchlist items
  const fetchWatchlistMovieDetails = async (watchlistItems: MovieWatchlistItem[]) => {
    const movieDetails: {[id: string]: Movie} = {};
    
    for (const item of watchlistItems) {
      try {
        const response = await fetch(`/api/catalog/movies/${item.movieId}`);
        if (response.ok) {
          const data = await response.json();
          movieDetails[item.movieId] = data;
        }
      } catch (error) {
        console.error(`Error fetching details for movie ${item.movieId}:`, error);
      }
    }
    
    setWatchlistMovieDetails(movieDetails);
  };
    // Function to fetch TV show details for watchlist items
  const fetchWatchlistTvShowDetails = async (watchlistItems: TvShowWatchlistItem[]) => {
    const tvShowDetails: {[id: string]: TvShow} = {};
    
    for (const item of watchlistItems) {
      try {
        const response = await fetch(`/api/catalog/tvshows/${item.tvShowId}`);
        if (response.ok) {
          const data = await response.json();
          tvShowDetails[item.tvShowId] = data;
        }
      } catch (error) {
        console.error(`Error fetching details for TV show ${item.tvShowId}:`, error);
      }
    }
    
    setWatchlistTvShowDetails(tvShowDetails);
  };
    // Handle episode progress increment
  const incrementEpisode = async (item: TvShowWatchlistItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user || isGuest) return;
    
    try {
      const updatedEpisode = (item.currentEpisode || 0) + 1;
      await updateTvShowWatchStatus(
        user.username, 
        item.tvShowId, 
        item.status,
        item.currentSeason,
        updatedEpisode
      );
      
      // Update the local state
      setTvShowWatchlist(prev => prev.map(show => 
        show.id === item.id 
          ? {...show, currentEpisode: updatedEpisode}
          : show
      ));
    } catch (error) {
      console.error('Error updating episode progress:', error);
    }
  };
    // Handle season selection
  const handleSeasonChange = async (
    item: TvShowWatchlistItem, 
    season: number,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user || isGuest) return;
    
    try {
      await updateTvShowWatchStatus(
        user.username, 
        item.tvShowId, 
        item.status,
        season,
        1  // Reset episode to 1 when changing season
      );
      
      // Update the local state
      setTvShowWatchlist(prev => prev.map(show => 
        show.id === item.id 
          ? {...show, currentSeason: season, currentEpisode: 1}
          : show
      ));
    } catch (error) {
      console.error('Error updating season:', error);
    }
  };
  
  // Fetch both movie and TV show watchlists
  const fetchUserWatchlists = async () => {
    if (!user || isGuest) return;
    
    // Fetch movie watchlist
    setIsLoadingMovieWatchlist(true);
    try {
      const movieList = await getMovieWatchlist(user.username);
      setMovieWatchlist(movieList);
      
      // Fetch details for each movie in watchlist
      fetchWatchlistMovieDetails(movieList);
    } catch (error) {
      console.error('Error fetching movie watchlist:', error);
    } finally {
      setIsLoadingMovieWatchlist(false);
    }
    
    // Fetch TV show watchlist
    setIsLoadingTvShowWatchlist(true);
    try {
      const tvShowList = await getTvShowWatchlist(user.username);
      setTvShowWatchlist(tvShowList);
      
      // Fetch details for each TV show in watchlist
      fetchWatchlistTvShowDetails(tvShowList);
    } catch (error) {
      console.error('Error fetching TV show watchlist:', error);
    } finally {
      setIsLoadingTvShowWatchlist(false);
    }
  };

  // Set active tab based on URL param
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('home');
    }
  }, [tabParam]);

  // Fetch watchlists automatically when the watchlist tab is selected
  useEffect(() => {
    if (activeTab === 'watchlist' && user && !isGuest) {
      fetchUserWatchlists();
    }
  }, [activeTab, user, isGuest]);

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Close season dropdown when clicking outside
  useEffect(() => {
    if (!openSeasonDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownNode = dropdownRef.current;
      const buttonNode = seasonButtonRefs.current[openSeasonDropdown];
      if (
        dropdownNode &&
        !dropdownNode.contains(event.target as Node) &&
        buttonNode &&
        !buttonNode.contains(event.target as Node)
      ) {
        setOpenSeasonDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSeasonDropdown]);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
  // Fetch popular movies
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch('/api/catalog/movies/popular?page=1');
        const data = await response.json();
        setPopularMovies(data);
        setIsLoadingMovies(false);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        setIsLoadingMovies(false);
      }
    };

    fetchPopularMovies();
  }, []);

  // Fetch popular TV shows
  useEffect(() => {
    const fetchPopularTvShows = async () => {
      try {
        const response = await fetch('/api/catalog/tvshows/popular?page=1');
        const data = await response.json();
        setPopularTvShows(data);
        setIsLoadingTvShows(false);
      } catch (error) {
        console.error('Error fetching popular TV shows:', error);
        setIsLoadingTvShows(false);
      }
    };

    fetchPopularTvShows();
  }, []);

  // Fetch popular anime
  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const response = await fetch('/api/catalog/tvshows/anime?page=1');
        const data = await response.json();
        setPopularAnime(data);
        setIsLoadingAnime(false);
      } catch (error) {
        console.error('Error fetching popular anime:', error);
        setIsLoadingAnime(false);
      }
    };

    fetchPopularAnime();
  }, []);

  // Create a combined trending items array for the carousel
  const [trendingItems, setTrendingItems] = useState<(Movie | TvShow)[]>([]);
  const [itemType, setItemType] = useState<{[key: number]: 'movie' | 'tvshow' | 'anime'}>({});

  // Combine trending items for the carousel
  useEffect(() => {
    if (!isLoadingMovies && !isLoadingTvShows && !isLoadingAnime) {
      // Create a combined array of movies and TV shows, sorted by popularity
      const combined: (Movie | TvShow)[] = [];
      
      // Add movies
      popularMovies.forEach(movie => {
        combined.push(movie);
        setItemType(prev => ({ ...prev, [movie.id]: 'movie' }));
      });
      
      // Add TV shows
      popularTvShows.forEach(tvShow => {
        combined.push(tvShow);
        setItemType(prev => ({ ...prev, [tvShow.id]: 'tvshow' }));
      });
      
      // Add anime
      popularAnime.forEach(anime => {
        combined.push(anime);
        setItemType(prev => ({ ...prev, [anime.id]: 'anime' }));
      });
      
      // Sort by popularity or vote average (higher numbers first)
      const sorted = combined.sort((a, b) => {
        if ('popularity' in a && 'popularity' in b) {
          return b.popularity - a.popularity;
        }
        return b.vote_average - a.vote_average;
      });
      
      // Take top 10 items for the carousel
      setTrendingItems(sorted.slice(0, 10));
    }
  }, [isLoadingMovies, isLoadingTvShows, isLoadingAnime, popularMovies, popularTvShows, popularAnime]);
  // Auto-cycle through featured items every 5 seconds but stop when trailer is shown
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (autoRotate && !showTrailer && trendingItems.length > 0) {
      interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => (prevIndex + 1) % trendingItems.length);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRotate, trendingItems.length, showTrailer]);

  // Pause auto-rotation when showing trailer
  useEffect(() => {
    if (showTrailer) {
      setAutoRotate(false);
    } else {
      setAutoRotate(true);
    }
  }, [showTrailer]);

  // Manually cycle to the next item
  const nextMovie = () => {
    if (trendingItems.length === 0) return;
    setCurrentFeaturedIndex((prevIndex) => (prevIndex + 1) % trendingItems.length);
  };

  // Manually cycle to the previous item
  const prevMovie = () => {
    if (trendingItems.length === 0) return;
    setCurrentFeaturedIndex((prevIndex) => (prevIndex - 1 + trendingItems.length) % trendingItems.length);
  };

  // Watch trailer functionality
  const openTrailer = () => {
    if (trendingItems[currentFeaturedIndex]?.trailerUrl) {
      setShowTrailer(true);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  // Extract YouTube video ID from YouTube URL
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : '';
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`;
  };

  // If still loading or no user, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xl font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: FaPlay, href: '/home' },
    { id: 'watchlist', label: 'Watchlist', icon: FaList, href: '/home?tab=watchlist' },
    { id: 'movies', label: 'Movies', icon: FaFilm, href: '/home?tab=movies' },
    { id: 'tv', label: 'TV Shows', icon: FaTv, href: '/home?tab=tv' },
    { id: 'ratings', label: 'My Ratings', icon: FaStar, href: '/home?tab=ratings' },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt, href: '/home?tab=calendar' },
  ];

  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };
  // Function to get poster URL (works for movies and TV shows)
  const getPosterUrl = (posterPath: string) => {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  // Function to get backdrop URL (works for movies and TV shows)
  const getBackdropUrl = (backdropPath: string) => {
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  };

  // Handle search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/catalog/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Combine all results and format them
      const allResults: any[] = [];
      
      // Add movies to results
      if (data.movies && Array.isArray(data.movies)) {
        data.movies.forEach((movie: any) => {
          allResults.push({
            ...movie,
            contentType: 'movie'
          });
        });
      }
      
      // Add TV shows to results
      if (data.tvShows && Array.isArray(data.tvShows)) {
        data.tvShows.forEach((tvShow: any) => {
          allResults.push({
            ...tvShow,
            contentType: 'tvshow'
          });
        });
      }
      
      // Add anime to results
      if (data.animeShows && Array.isArray(data.animeShows)) {
        data.animeShows.forEach((anime: any) => {
          allResults.push({
            ...anime,
            contentType: 'anime'
          });
        });
      }
      
      // Sort by popularity or vote average
      const sortedResults = allResults.sort((a, b) => {
        const aScore = a.vote_count * a.vote_average;
        const bScore = b.vote_count * b.vote_average;
        return bScore - aScore;
      });
      
      // Limit to 8 results for better UI
      setSearchResults(sortedResults.slice(0, 8));
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      handleSearch(query);
    }, 500),
    []
  );

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Navigate to content detail page
  const navigateToContent = (result: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    if (result.contentType === 'movie') {
      router.push(`/movie/${result.id}`);
    } else if (result.contentType === 'tvshow') {
      router.push(`/tvshow/${result.id}`);
    } else if (result.contentType === 'anime') {
      router.push(`/tvshow/${result.id}?type=anime`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 z-50">
        <div className="px-6 py-4 flex items-center justify-between w-full">
          {/* Logo and mobile sidebar toggle */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
            >
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href="/home">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer">
                <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">            <div className="relative hidden md:block">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies & shows..."
                  className="w-64 py-2 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:text-white"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute mt-2 w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700 max-h-[80vh] overflow-y-auto"
                >
                  <div className="p-2 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white flex items-center justify-between">
                      Search Results
                      {isSearching && (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-indigo-600 dark:border-indigo-400"></span>
                      )}
                    </p>
                  </div>
                  {searchResults.map((result) => (
                    <div 
                      key={`${result.contentType}-${result.id}`}
                      onClick={() => navigateToContent(result)}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 h-12 w-8 relative">
                        {result.poster_path ? (
                          <Image
                            src={getPosterUrl(result.poster_path)}
                            alt={result.title || result.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                            <FaFilm className="text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {result.title || result.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                          <span className={`px-1.5 py-0.5 rounded-sm text-white text-[10px] ${
                            result.contentType === 'movie' ? 'bg-blue-600' : 
                            result.contentType === 'tvshow' ? 'bg-green-600' : 
                            'bg-purple-600'
                          }`}>
                            {result.contentType === 'movie' ? 'Movie' : 
                             result.contentType === 'tvshow' ? 'TV Show' : 
                             'Anime'}
                          </span>
                          <span>{result.vote_average.toFixed(1)}/10</span>
                          <span>
                            {result.release_date ? 
                              new Date(result.release_date).getFullYear() :
                              result.first_air_date ? 
                              new Date(result.first_air_date).getFullYear() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notification button */}
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            
            {/* Username display and profile menu */}
            <div className="relative flex items-center space-x-3">
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Profile dropdown menu positioned correctly under profile icon */}
              {showProfileMenu && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
                >
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'Guest User'}</p>
                  </div>
                  <Link href="/home?tab=watchlist">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaList className="mr-2 h-4 w-4" />
                      My Watchlist
                    </div>
                  </Link>
                  <Link href="/home/profile">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaCog className="mr-2 h-4 w-4" />
                      Account Settings
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  >
                    <FaSignOutAlt className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            {isGuest && (
              <Link href="/register" className="hidden md:block">
                <button className="ml-3 px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
                  Create Account
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-16"> {/* Changed to min-h-screen to ensure full height */}
        {/* Sidebar */}
        <div
          className={`fixed top-16 bottom-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 z-40 ${
            activeSidebar ? 'translate-x-0' : '-translate-x-full'
          } md:sticky md:top-16 md:translate-x-0 md:h-[calc(100vh-4rem)]`} /* Changed positioning and added height calc */
        >
          <div className="flex flex-col h-full">
            {/* Navigation links */}
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                    item.id === activeTab
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <Link href="/home/profile" passHref>
                <div
                  className="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors 
                  text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer mt-4"
                >
                  <FaCog className="h-5 w-5" />
                  <span>Account Settings</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Home content */}
          <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            {/* Display guest banner if user is guest */}
            {isGuest && (
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-300 rounded-md mx-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium">You're browsing as a guest</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Create an account to save your data and access all features</p>
                  </div>
                  <Link href="/register">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
                      Create Account
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Dashboard Content or Home Content based on active tab */}
            {activeTab === 'home' && (
              <>
                {/* Featured Movie Section with Arrows */}                <div className="relative w-full h-[70vh] overflow-hidden">
                  {/* Left navigation arrow */}
                  <button 
                    onClick={prevMovie}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-3 rounded-full backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <FaChevronLeft className="h-6 w-6" />
                  </button>
                  
                  {/* Right navigation arrow */}
                  <button
                    onClick={nextMovie}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-3 rounded-full backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <FaChevronRight className="h-6 w-6" />
                  </button>

                  {trendingItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: currentFeaturedIndex === index ? 1 : 0,
                        scale: currentFeaturedIndex === index ? 1 : 1.05,
                      }}
                      transition={{
                        opacity: { duration: 1, ease: 'easeInOut' },
                        scale: { duration: 1.2, ease: 'easeInOut' },
                      }}
                      style={{
                        zIndex: currentFeaturedIndex === index ? 1 : 0,
                      }}
                    >
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent z-10"></div>                        
                        {item.backdrop_path && (
                          <Image
                            src={getBackdropUrl(item.backdrop_path)}
                            alt={'title' in item ? item.title : item.name}
                            fill
                            className="object-cover object-center"
                            priority
                            key={item.id}
                          />
                        )}
                      </div>
                      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
                        {/* Content Type Badge */}
                        <div className="mb-2">
                          <span className={`px-3 py-1 text-white text-sm rounded-full ${
                            itemType[item.id] === 'movie' ? 'bg-blue-600/90' : 
                            itemType[item.id] === 'tvshow' ? 'bg-green-600/90' :
                            'bg-purple-600/90'
                          }`}>
                            {itemType[item.id] === 'movie' ? 'Movie' : 
                             itemType[item.id] === 'tvshow' ? 'TV Show' : 'Anime'}
                          </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                          {'title' in item ? item.title : item.name}
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mb-6">
                          {item.overview.length > 200 ? `${item.overview.substring(0, 200)}...` : item.overview}
                        </p>
                        <div className="flex flex-wrap gap-3 mb-8">
                          <span className="px-3 py-1 bg-indigo-600/90 text-white text-sm rounded-full">
                            Rating: {item.vote_average.toFixed(1)}/10
                          </span>
                          <span className="px-3 py-1 bg-gray-600/90 text-white text-sm rounded-full">
                            {new Date('release_date' in item ? item.release_date : item.first_air_date).getFullYear()}
                          </span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <button
                            onClick={openTrailer}
                            disabled={!item.trailerUrl}
                            className={`px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${
                              item.trailerUrl
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                          >
                            <FaPlay className="h-4 w-4" />
                            <span>{item.trailerUrl ? 'Watch Trailer' : 'No Trailer Available'}</span>
                          </button>
                          <Link href={
                            itemType[item.id] === 'movie' 
                              ? `/movie/${item.id}` 
                              : itemType[item.id] === 'anime' 
                                ? `/tvshow/${item.id}?type=anime` 
                                : `/tvshow/${item.id}`
                          }>
                            <button className="px-6 py-3 bg-gray-700/70 text-white rounded-md hover:bg-gray-600 transition-colors">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Progress indicators for featured items */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                    {trendingItems.map((_, index) => (
                      <button
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentFeaturedIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                        }`}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                  {/* Popular Movies Section */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Popular Movies</h2>
                    {isLoadingMovies ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {popularMovies.slice(1, 11).map((movie) => (
                          <div
                            key={movie.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative group"
                          >
                            <Link href={`/movie/${movie.id}`} className="block">
                              <div className="relative aspect-[2/3] w-full">
                                {movie.poster_path ? (
                                  <Image
                                    src={getPosterUrl(movie.poster_path)}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaFilm className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {movie.vote_average.toFixed(1)}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{movie.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric' })}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* --- Popular TV Shows Section --- */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Popular TV Shows</h2>
                    {isLoadingTvShows ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {popularTvShows.slice(0, 10).map((tvShow) => (
                          <div
                            key={tvShow.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative group"
                          >
                            <Link href={`/tvshow/${tvShow.id}`} className="block">
                              <div className="relative aspect-[2/3] w-full">
                                {tvShow.poster_path ? (
                                  <Image
                                    src={getPosterUrl(tvShow.poster_path)}
                                    alt={tvShow.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaTv className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {tvShow.vote_average.toFixed(1)}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{tvShow.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {tvShow.first_air_date ? new Date(tvShow.first_air_date).toLocaleDateString('en-US', { year: 'numeric' }) : 'Unknown date'}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* --- Popular Anime Section --- */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Popular Anime</h2>
                    {isLoadingAnime ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {popularAnime.slice(0, 10).map((anime) => (
                          <div
                            key={anime.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative group"
                          >
                            <Link href={`/tvshow/${anime.id}?type=anime`} className="block">
                              <div className="relative aspect-[2/3] w-full">
                                {anime.poster_path ? (
                                  <Image
                                    src={getPosterUrl(anime.poster_path)}
                                    alt={anime.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaTv className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {anime.vote_average.toFixed(1)}
                                </div>
                                <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  Anime
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{anime.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {anime.first_air_date ? new Date(anime.first_air_date).toLocaleDateString('en-US', { year: 'numeric' }) : 'Unknown date'}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Coming Soon</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {popularMovies.slice(11, 14).map((movie) => (
                        <Link key={movie.id} href={`/movie/${movie.id}`}>
                          <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative w-1/3">
                              {movie.poster_path ? (
                                <Image
                                  src={getPosterUrl(movie.poster_path)}
                                  alt={movie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                  <FaFilm className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="p-4 w-2/3">
                              <h3 className="font-bold text-gray-800 dark:text-white mb-1">{movie.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Release:{' '}
                                {new Date(movie.release_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{movie.overview}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>

                  {/* Recommended for You */}
                  <section>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recommended for You</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {popularMovies.slice(14, 18).map((movie) => (
                        <Link key={movie.id} href={`/movie/${movie.id}`}>
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative aspect-[16/9] w-full">
                              {movie.backdrop_path ? (
                                <Image
                                  src={getBackdropUrl(movie.backdrop_path)}
                                  alt={movie.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                  <FaFilm className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <h3 className="text-white font-bold p-4">{movie.title}</h3>
                              </div>
                              <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {movie.vote_average.toFixed(1)}
                              </div>
                              {/* Play trailer button */}
                              {movie.trailerUrl && (
                                <div
                                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentFeaturedIndex(popularMovies.indexOf(movie));
                                    setShowTrailer(true);
                                  }}
                                >
                                  <div className="bg-indigo-600/80 p-3 rounded-full hover:bg-indigo-600 transition-colors">
                                    <FaPlay className="text-white h-5 w-5" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{movie.overview}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                  <FaCalendarAlt className="mr-1 h-3 w-3" />
                                  {new Date(movie.release_date).getFullYear()}
                                </span>
                                <button 
                                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Add to watchlist functionality
                                  }}
                                >
                                  <FaPlus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}            {/* Watchlist Tab Content */}
            {activeTab === 'watchlist' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="space-y-8">                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Watchlist</h2>
                    {(isLoadingMovieWatchlist || isLoadingTvShowWatchlist) && (
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-indigo-600 dark:border-indigo-400"></div>
                        <span>Loading watchlist...</span>
                      </div>
                    )}
                  </div>

                  {isGuest && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-md">
                      <p className="text-amber-800 dark:text-amber-300">
                        <span className="font-bold">Note:</span> Guest accounts cannot save watchlists permanently. Create an account to save your watchlist data.
                      </p>
                      <Link href="/register" className="mt-2 inline-block text-amber-800 dark:text-amber-300 font-medium hover:underline">
                        Create Account →
                      </Link>
                    </div>
                  )}

                  {/* Currently Watching Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaRegEye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Currently Watching
                      </h3>
                    </div>

                    {(isLoadingMovieWatchlist || isLoadingTvShowWatchlist) ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">                          {/* TV shows currently watching */}
                          {tvShowWatchlist
                            .filter(item => item.status === WatchStatus.CURRENTLY_WATCHING)
                            .map(item => {
                              const tvShow = watchlistTvShowDetails[item.tvShowId];
                              const numSeasons = tvShow?.number_of_seasons || 1;
                              const currentSeasonIdx = (item.currentSeason || 1) - 1;
                              const episodeCount = tvShow?.seasons?.[currentSeasonIdx]?.episode_count || 1;
                              return tvShow ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeTvShowFromWatchlist(user.username, item.tvShowId);
                                        setTvShowWatchlist(prev => prev.filter(show => show.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <div className="relative">
                                    <Link href={`/tvshow/${item.tvShowId}`}>
                                      <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-700">
                                        {tvShow.backdrop_path ? (
                                          <Image
                                            src={`https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`}
                                            alt={tvShow.name}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <FaTv className="h-12 w-12 text-gray-400" />
                                          </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded">
                                          {tvShow.genre_ids?.includes(16) ? 'Anime' : 'TV Show'}
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="p-4">
                                    <Link href={`/tvshow/${item.tvShowId}`}>
                                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{tvShow.name}</h4>
                                    </Link>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <div className="flex items-center">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                          S{item.currentSeason} E{item.currentEpisode}
                                        </span>
                                      </div>
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : ''}
                                      </span>
                                    </div>                                    <div className="flex gap-2 mt-1">
                                      <div className="flex-1 relative">                                        <button 
                                          className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 text-sm font-medium rounded transition-colors cursor-pointer flex justify-between items-center"
                                          onClick={e => { 
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Store button position before showing dropdown
                                            if (openSeasonDropdown !== `${item.id}`) {
                                              const buttonRect = e.currentTarget.getBoundingClientRect();
                                              setDropdownPosition({
                                                top: buttonRect.bottom,
                                                left: buttonRect.left,
                                                width: buttonRect.width
                                              });
                                            }
                                            setOpenSeasonDropdown(openSeasonDropdown === `${item.id}` ? null : `${item.id}`);
                                          }}
                                        >
                                          <span>Season {item.currentSeason}</span>
                                          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </button>                                        {openSeasonDropdown === `${item.id}` && (
                                          <div 
                                            ref={dropdownRef} 
                                            className="fixed mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-[1000] text-center"
                                            style={{
                                              width: `${dropdownPosition.width}px`,
                                              position: 'fixed',
                                              top: `${dropdownPosition.top}px`, 
                                              left: `${dropdownPosition.left}px`
                                            }}
                                          >
                                            {Array.from({ length: numSeasons }, (_, idx) => (
                                              <button
                                                key={idx + 1}
                                                onClick={e => { 
                                                  handleSeasonChange(item, idx + 1, e); 
                                                  setOpenSeasonDropdown(null); 
                                                }}
                                                className={`w-full px-4 py-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors ${
                                                  item.currentSeason === (idx + 1) ? 
                                                  'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold' : 
                                                  'text-gray-700 dark:text-gray-300'
                                                }`}
                                              >
                                                Season {idx + 1}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      {/* Episode controls */}
                                      <div className="flex-1 flex items-center gap-1">
                                        <button
                                          className="py-1.5 px-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-l hover:bg-gray-300 dark:hover:bg-gray-600"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!user || isGuest) return;
                                            const newEp = Math.max(1, (item.currentEpisode ?? 1) - 1);
                                            await updateTvShowWatchStatus(user.username, item.tvShowId, item.status, item.currentSeason, newEp);
                                            setTvShowWatchlist(prev => prev.map(show => show.id === item.id ? { ...show, currentEpisode: newEp } : show));
                                          }}
                                          disabled={(item.currentEpisode ?? 1) <= 1}
                                        >-</button>
                                        <span className="px-2 text-sm">E{item.currentEpisode ?? 1}</span>
                                        <button
                                          className="py-1.5 px-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r hover:bg-gray-300 dark:hover:bg-gray-600"
                                          onClick={e => incrementEpisode(item, e)}
                                          disabled={(item.currentEpisode ?? 1) >= episodeCount}
                                        >+</button>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Season {item.currentSeason} has {episodeCount} episodes.
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                            
                          {/* Movies currently watching */}
                          {movieWatchlist
                            .filter(item => item.status === WatchStatus.CURRENTLY_WATCHING)
                            .map(item => {
                              const movie = watchlistMovieDetails[item.movieId];
                              return movie ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group flex flex-col">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeMovieFromWatchlist(user.username, item.movieId);
                                        setMovieWatchlist(prev => prev.filter(m => m.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <Link href={`/movie/${item.movieId}`}>
                                    <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-700">
                                      {movie.backdrop_path ? (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                                          alt={movie.title}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FaFilm className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
                                        Movie
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="p-4 flex-1 flex flex-col justify-between">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{movie.title}</h4>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                      </span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        {movie.vote_average ? `${movie.vote_average.toFixed(1)}★` : ''}
                                      </span>
                                    </div>
                                    <button
                                      className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!user || isGuest) return;
                                        try {
                                          await updateMovieWatchStatus(user.username, item.movieId, WatchStatus.COMPLETED);
                                          setMovieWatchlist(prev => prev.map(m => m.id === item.id ? { ...m, status: WatchStatus.COMPLETED } : m));
                                        } catch (err) {
                                          alert('Failed to mark as completed');
                                        }
                                      }}
                                    >
                                      Mark as Completed
                                    </button>
                                  </div>
                                </div>
                              ) : null;
                            })}
                        </div>
                        
                        {/* Empty state */}
                        {tvShowWatchlist.filter(item => item.status === WatchStatus.CURRENTLY_WATCHING).length === 0 && 
                         movieWatchlist.filter(item => item.status === WatchStatus.CURRENTLY_WATCHING).length === 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                              <FaRegEye className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nothing currently watching</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              Start watching something by browsing movies and TV shows.
                            </p>
                            <div className="flex justify-center gap-3">
                              <Link href="/home?tab=movies">
                                <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                  Browse Movies
                                </span>
                              </Link>
                              <Link href="/home?tab=tv">
                                <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                  Browse TV Shows
                                </span>
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  {/* Plan to Watch Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaRegClock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Plan to Watch
                      </h3>
                    </div>

                    {(isLoadingMovieWatchlist || isLoadingTvShowWatchlist) ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {/* TV shows plan to watch */}
                          {tvShowWatchlist
                            .filter(item => item.status === WatchStatus.PLAN_TO_WATCH)
                            .map(item => {
                              const tvShow = watchlistTvShowDetails[item.tvShowId];
                              return tvShow ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeTvShowFromWatchlist(user.username, item.tvShowId);
                                        setTvShowWatchlist(prev => prev.filter(show => show.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <Link href={`/tvshow/${item.tvShowId}`}>
                                    <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700">
                                      {tvShow.poster_path ? (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                                          alt={tvShow.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FaTv className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded">
                                        TV
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{tvShow.name}</h4>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : ''}
                                      </span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        {tvShow.vote_average ? `${tvShow.vote_average.toFixed(1)}★` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                            
                          {/* Movies plan to watch */}
                          {movieWatchlist
                            .filter(item => item.status === WatchStatus.PLAN_TO_WATCH)
                            .map(item => {
                              const movie = watchlistMovieDetails[item.movieId];
                              return movie ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeMovieFromWatchlist(user.username, item.movieId);
                                        setMovieWatchlist(prev => prev.filter(m => m.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <Link href={`/movie/${item.movieId}`}>
                                    <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700">
                                      {movie.poster_path ? (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                          alt={movie.title}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FaFilm className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
                                        Movie
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{movie.title}</h4>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                      </span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        {movie.vote_average ? `${movie.vote_average.toFixed(1)}★` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                        </div>
                        
                        {/* Empty state */}
                        {tvShowWatchlist.filter(item => item.status === WatchStatus.PLAN_TO_WATCH).length === 0 && 
                         movieWatchlist.filter(item => item.status === WatchStatus.PLAN_TO_WATCH).length === 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                              <FaRegClock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your watch list is empty</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Start building your watchlist by adding movies and TV shows you want to watch in the future.
                            </p>
                            <div className="flex justify-center gap-3">
                              <Link href="/home">
                                <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                  Explore Content
                                </span>
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  {/* Completed Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaCheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Completed
                      </h3>
                    </div>

                    {(isLoadingMovieWatchlist || isLoadingTvShowWatchlist) ? (
                      <div className="flex justify-center py-6">
                        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {/* TV shows completed */}
                          {tvShowWatchlist
                            .filter(item => item.status === WatchStatus.COMPLETED)
                            .map(item => {
                              const tvShow = watchlistTvShowDetails[item.tvShowId];
                              return tvShow ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeTvShowFromWatchlist(user.username, item.tvShowId);
                                        setTvShowWatchlist(prev => prev.filter(show => show.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <Link href={`/tvshow/${item.tvShowId}`}>
                                    <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700">
                                      {tvShow.poster_path ? (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                                          alt={tvShow.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FaTv className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded">
                                        TV
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{tvShow.name}</h4>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : ''}
                                      </span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        {tvShow.vote_average ? `${tvShow.vote_average.toFixed(1)}★` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                            
                          {/* Movies completed */}
                          {movieWatchlist
                            .filter(item => item.status === WatchStatus.COMPLETED)
                            .map(item => {
                              const movie = watchlistMovieDetails[item.movieId];
                              return movie ? (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
                                  <button
                                    className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none"
                                    title="Remove from Watchlist"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!user || isGuest) return;
                                      try {
                                        await removeMovieFromWatchlist(user.username, item.movieId);
                                        setMovieWatchlist(prev => prev.filter(m => m.id !== item.id));
                                      } catch (err) {
                                        alert('Failed to remove from watchlist');
                                      }
                                    }}
                                  >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <Link href={`/movie/${item.movieId}`}>
                                    <div className="relative aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700">
                                      {movie.poster_path ? (
                                        <Image
                                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                          alt={movie.title}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FaFilm className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        </div>
                                      )}
                                      <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
                                        Movie
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{movie.title}</h4>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                      </span>
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                        {movie.vote_average ? `${movie.vote_average.toFixed(1)}★` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                        </div>
                        
                        {/* Empty state */}
                        {tvShowWatchlist.filter(item => item.status === WatchStatus.COMPLETED).length === 0 && 
                         movieWatchlist.filter(item => item.status === WatchStatus.COMPLETED).length === 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                              <FaCheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nothing completed yet</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Mark movies and TV shows as completed to track what you've watched.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </div>
              </div>
            )}

            {/* Movies Tab Content */}
            {activeTab === 'movies' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
<div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaFilm className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Movie Collection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the movie collection feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add Movies
                  </button>
                </div>
              </div>
            )}

            {/* TV Shows Tab Content */}
            {activeTab === 'tv' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaTv className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    TV Show Tracking
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the TV show tracking feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add TV Shows
                  </button>
                </div>
              </div>
            )}

            {/* Ratings Tab Content */}
            {activeTab === 'ratings' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaStar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Your Ratings & Reviews
                  </h2>
                  <p className="text-gray-600 dark:textgray-400 max-w-lg">
                    This is a placeholder for theratings feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Rate Content
                  </button>
                </div>
              </div>
            )}

            {/* Calendar Tab Content */}
            {activeTab === 'calendar' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaCalendarAlt className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Release Calendar
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the calendar feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add to Calendar
                  </button>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    View Calendar
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>      {/* Trailer Modal with Blurred Background */}
      {showTrailer && trendingItems[currentFeaturedIndex]?.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/40" onClick={closeTrailer}></div>
          <div className="relative w-full max-w-5xl z-10">
            <button
              onClick={closeTrailer}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
                           aria-label="Close trailer"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            {/* Improved aspect ratio container with proper sizing */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={getYoutubeEmbedUrl(trendingItems[currentFeaturedIndex].trailerUrl)}
                title={`${'title' in trendingItems[currentFeaturedIndex] ? trendingItems[currentFeaturedIndex].title : trendingItems[currentFeaturedIndex].name} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">
                {'title' in trendingItems[currentFeaturedIndex] ? trendingItems[currentFeaturedIndex].title : trendingItems[currentFeaturedIndex].name} - Official Trailer
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* TV Show Progress Update Dialog */}
      {showProgressDialog && editingTvShowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/40" onClick={() => setShowProgressDialog(false)}></div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md z-10 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Update Watching Progress</h3>
            
            {editingTvShowItem && watchlistTvShowDetails[editingTvShowItem.tvShowId] && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {watchlistTvShowDetails[editingTvShowItem.tvShowId].name}
              </p>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Season
                </label>
                <div className="relative">
                  <select 
                    value={currentSeasonInput} 
                    onChange={(e) => {
                      const season = parseInt(e.target.value);
                      setCurrentSeasonInput(season);
                      // Reset episode to 0 when changing seasons to avoid invalid episode numbers
                      setCurrentEpisodeInput(0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm appearance-none"
                  >                    {editingTvShowItem && watchlistTvShowDetails[editingTvShowItem.tvShowId] && 
                     watchlistTvShowDetails[editingTvShowItem.tvShowId].number_of_seasons && 
                     Array.from({ length: watchlistTvShowDetails[editingTvShowItem.tvShowId].number_of_seasons as number }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Season {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Episode
                </label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setCurrentEpisodeInput(prev => Math.max(0, prev - 1))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    -
                  </button>
                  <input 
                    type="number"                    
                    min="0"                    
                    max={editingTvShowItem && 
                         watchlistTvShowDetails[editingTvShowItem.tvShowId] && 
                         watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons && 
                         watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons?.[currentSeasonInput - 1] ? 
                         watchlistTvShowDetails[editingTvShowItem.tvShowId]?.seasons?.[currentSeasonInput - 1]?.episode_count ?? 999 : 
                         999}
                    value={currentEpisodeInput}                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      if (isNaN(newValue)) {
                        setCurrentEpisodeInput(0);
                        return;
                      }
                      const maxEpisodes = 
                        editingTvShowItem && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId] && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons?.[currentSeasonInput - 1] ? 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId]?.seasons?.[currentSeasonInput - 1]?.episode_count ?? 999 : 
                        999;
                      setCurrentEpisodeInput(Math.max(0, Math.min(newValue, maxEpisodes)));
                    }}
                    className="w-full px-3 py-2 border-y border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm text-center"
                  />                  <button 
                    onClick={() => {
                      const maxEpisodes = 
                        editingTvShowItem && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId] && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons && 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons?.[currentSeasonInput - 1] ? 
                        watchlistTvShowDetails[editingTvShowItem.tvShowId]?.seasons?.[currentSeasonInput - 1]?.episode_count ?? 999 : 
                        999;
                      setCurrentEpisodeInput(prev => Math.min(maxEpisodes, prev + 1));
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>                {editingTvShowItem && 
                 watchlistTvShowDetails[editingTvShowItem.tvShowId] && 
                 watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons && 
                 watchlistTvShowDetails[editingTvShowItem.tvShowId].seasons?.[currentSeasonInput - 1] && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Total episodes in season {currentSeasonInput}: {watchlistTvShowDetails[editingTvShowItem.tvShowId]?.seasons?.[currentSeasonInput - 1]?.episode_count ?? 'Unknown'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowProgressDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!user || isGuest || !editingTvShowItem) return;
                  
                  setIsUpdatingProgress(true);
                  try {
                    await updateTvShowWatchStatus(
                      user.username,
                      editingTvShowItem.tvShowId,
                      editingTvShowItem.status,
                      currentSeasonInput,
                      currentEpisodeInput
                    );
                    
                    // Update the local state
                    setTvShowWatchlist(prev => prev.map(show => 
                      show.id === editingTvShowItem.id 
                        ? {...show, currentSeason: currentSeasonInput, currentEpisode: currentEpisodeInput}
                        : show
                    ));
                    
                    setShowProgressDialog(false);
                  } catch (error) {
                    console.error('Error updating progress:', error);
                  } finally {
                    setIsUpdatingProgress(false);
                  }
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdatingProgress}
              >
                {isUpdatingProgress ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Save Progress'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

