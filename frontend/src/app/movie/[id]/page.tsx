'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft, FaPlay, FaStar, FaCalendarAlt, FaClock, FaGlobe, FaMoneyBillWave, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCircle, FaUserCircle, FaSearch, FaLanguage, FaMapMarkerAlt, FaFilm, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { WatchStatus, DetailedMovie as DetailedMovieType } from '@/types';
import { 
  getMovieWatchlist,
  addMovieToWatchlist,
  updateMovieWatchStatus,
  removeMovieFromWatchlist
} from '@/utils/watchlistApi';

// Extended Movie interface with additional details
interface DetailedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime?: number;
  budget?: number | null;
  revenue?: number | null;
  genres?: { id: number; name: string }[];
  production_companies?: { 
    id: number; 
    name: string; 
    logo_path?: string | null;
    origin_country?: string;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  homepage?: string;
  tagline?: string;
  status?: string;
  trailerUrl?: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      imdbId?: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
      imdbId?: string;
    }[];
  };
  similar?: {
    results: {
      id: number;
      title: string;
      poster_path: string | null;
      vote_average: number;
    }[];
  };
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
}

// Define route params interface
interface MoviePageProps {
  params: {
    id: string;
  };
}

export default function MovieDetails({ params }: MoviePageProps) {
  // Access the ID from params properly for Next.js App Router
  const movieId = params.id;

  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<DetailedMovie | null>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchStatus, setWatchStatus] = useState<WatchStatus | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // For mobile view tabs
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);
  
  // Refs for dropdown menu functionality
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const watchlistMenuRef = useRef<HTMLDivElement>(null);
  const watchlistButtonRef = useRef<HTMLButtonElement>(null);

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Toggle watchlist menu dropdown
  const toggleWatchlistMenu = () => {
    setShowWatchlistMenu(!showWatchlistMenu);
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
      
      if (
        showWatchlistMenu &&
        watchlistMenuRef.current &&
        watchlistButtonRef.current &&
        !watchlistMenuRef.current.contains(event.target as Node) &&
        !watchlistButtonRef.current.contains(event.target as Node)
      ) {
        setShowWatchlistMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showWatchlistMenu]);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
  // Fetch detailed movie info
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;
      
      try {
        setIsLoadingMovie(true);
        // Get detailed movie info from our enhanced endpoint
        const response = await fetch(`/api/catalog/movies/${movieId}`);
        if (!response.ok) {
          throw new Error('Movie not found');
        }
        const movieData = await response.json();

        setMovie(movieData);
        setIsLoadingMovie(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setIsLoadingMovie(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);
  
  // Check if movie is in watchlist when page loads
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user || isGuest || !movieId) return;
      
      try {
        const watchlist = await getMovieWatchlist(user.username);
        const movieInWatchlist = watchlist.find(item => item.movieId === movieId);
        
        if (movieInWatchlist) {
          setIsInWatchlist(true);
          setWatchStatus(movieInWatchlist.status);
        } else {
          setIsInWatchlist(false);
          setWatchStatus(null);
        }
      } catch (error) {
        console.error('Error checking watchlist status:', error);
      }
    };
    
    if (!isLoading) {
      checkWatchlistStatus();
    }
  }, [user, isGuest, movieId, isLoading]);

  // Watch trailer functionality
  const openTrailer = () => {
    if (movie?.trailerUrl) {
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
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  // Watchlist functionality
  const addToWatchlist = async (status: WatchStatus) => {
    if (!user || isGuest || !movie) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await addMovieToWatchlist(user.username, movieId, status);
      setIsInWatchlist(true);
      setWatchStatus(status);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error adding movie to watchlist:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const updateWatchlistStatus = async (status: WatchStatus) => {
    if (!user || isGuest || !movie) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await updateMovieWatchStatus(user.username, movieId, status);
      setWatchStatus(status);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error updating movie watchlist status:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const removeFromWatchlist = async () => {
    if (!user || isGuest || !movie) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await removeMovieFromWatchlist(user.username, movieId);
      setIsInWatchlist(false);
      setWatchStatus(null);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would call your API to update the user's favorites
  };

  // Helper function to format runtime
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function for number formatting
  const formatCurrency = (amount?: number | null) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to get movie poster URL
  const getMoviePosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  // Function to get movie backdrop URL
  const getMovieBackdropUrl = (backdropPath: string | null) => {
    if (!backdropPath) return '';
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  };

  // Function to get profile image URL
  const getProfileImageUrl = (profilePath: string | null) => {
    if (!profilePath) return '';
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  };

  // Loading state
  if (isLoading || isLoadingMovie) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xl font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Movie not found
  if (!movie) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Movie Not Found</h1>
        <p className="mb-8 text-xl text-gray-300">
          We couldn't find the movie you're looking for.
        </p>
        <Link href="/home">
          <div className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-indigo-700">
            <FaArrowLeft />
            <span>Back to Home</span>
          </div>
        </Link>
      </div>
    );
  }

  // Extract directing, producing, writing credits for easy display
  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const producer = movie.credits?.crew?.find(person => person.job === 'Producer');
  const writer = movie.credits?.crew?.find(person => 
    person.job === 'Screenplay' || person.job === 'Writer' || person.job === 'Story'
  );
  const cinematographer = movie.credits?.crew?.find(person => 
    person.job === 'Director of Photography' || person.job === 'Cinematography'
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header/Navigation Bar */}
      <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo - Made bigger and positioned at top left */}
          <div className="relative">
            <Link href="/home">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer">
                <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
              </h1>
            </Link>
            
            {/* Profile dropdown menu positioned below the logo */}
            {showProfileMenu && (
              <div
                ref={profileMenuRef}
                className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
              >
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.username || 'Guest'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'Guest User'}</p>
                </div>
                <Link href="/home">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                    <FaBookmark className="mr-2 h-4 w-4" />
                    My Watchlist
                  </div>
                </Link>
                <Link href="/home/profile">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                    <FaCircle className="mr-2 h-4 w-4" />
                    Account Settings
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies & shows..."
                className="w-64 py-2 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:text-white"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
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
                {user?.username}
              </span>
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
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

      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full">
        {/* Backdrop Image */}
        {movie.backdrop_path && (
          <div className="absolute inset-0">
            <Image
              src={getMovieBackdropUrl(movie.backdrop_path)}
              alt={movie.title}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50"></div>
          </div>
        )}

        {/* Navigation and content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Back button */}
          <div className="p-6">
            <Link href="/home">
              <div className="inline-flex items-center space-x-2 rounded-lg bg-black/30 px-4 py-2 font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50">
                <FaArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </div>
            </Link>
          </div>

          {/* Movie info */}
          <div className="mt-auto flex flex-col md:flex-row items-end space-y-6 md:space-y-0 md:space-x-8 p-6 md:p-12">
            {/* Poster */}
            <div className="hidden md:block relative h-72 w-48 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
              {movie.poster_path ? (
                <Image
                  src={getMoviePosterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800">
                  <span className="text-gray-400">No Poster</span>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="w-full">
              {/* Title and Tagline */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mb-4 text-xl text-gray-300 italic">
                  {movie.tagline}
                </p>
              )}

              {/* Basic Info Row */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                {movie.release_date && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1 h-4 w-4 text-gray-400" />
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center">
                    <FaClock className="mr-1 h-4 w-4 text-gray-400" />
                    {formatRuntime(movie.runtime)}
                  </div>
                )}

                {movie.vote_average && (
                  <div className="flex items-center">
                    <FaStar className="mr-1 h-4 w-4 text-yellow-500" />
                    {movie.vote_average.toFixed(1)}/10 {movie.vote_count && `(${movie.vote_count.toLocaleString()} votes)`}
                  </div>
                )}

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {movie.trailerUrl && (
                  <button
                    onClick={openTrailer}
                    className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <FaPlay className="h-4 w-4" />
                    <span>Watch Trailer</span>
                  </button>
                )}                <div className="relative">
                  <button
                    ref={watchlistButtonRef}
                    onClick={toggleWatchlistMenu}
                    className="flex items-center gap-2 rounded-md bg-gray-700/80 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                    disabled={isUpdatingWatchlist || isGuest}
                  >
                    {isUpdatingWatchlist ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                    ) : (
                      isInWatchlist ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />
                    )}
                    <span>
                      {isInWatchlist 
                        ? watchStatus === WatchStatus.PLAN_TO_WATCH 
                          ? 'Want to Watch' 
                          : watchStatus === WatchStatus.CURRENTLY_WATCHING 
                            ? 'Watching' 
                            : 'Completed'
                        : 'Add to Watchlist'}
                    </span>
                  </button>

                  {/* Watchlist dropdown menu */}
                  {showWatchlistMenu && (
                    <div
                      ref={watchlistMenuRef}
                      className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => isInWatchlist ? updateWatchlistStatus(WatchStatus.PLAN_TO_WATCH) : addToWatchlist(WatchStatus.PLAN_TO_WATCH)}
                          className={`block w-full px-4 py-2 text-left text-sm ${watchStatus === WatchStatus.PLAN_TO_WATCH ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          Want to Watch
                        </button>
                        <button
                          onClick={() => isInWatchlist ? updateWatchlistStatus(WatchStatus.CURRENTLY_WATCHING) : addToWatchlist(WatchStatus.CURRENTLY_WATCHING)}
                          className={`block w-full px-4 py-2 text-left text-sm ${watchStatus === WatchStatus.CURRENTLY_WATCHING ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          Currently Watching
                        </button>
                        <button
                          onClick={() => isInWatchlist ? updateWatchlistStatus(WatchStatus.COMPLETED) : addToWatchlist(WatchStatus.COMPLETED)}
                          className={`block w-full px-4 py-2 text-left text-sm ${watchStatus === WatchStatus.COMPLETED ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          Completed
                        </button>
                        {isInWatchlist && (
                          <>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={removeFromWatchlist}
                              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Remove from Watchlist
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 rounded-md bg-gray-700/80 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {isFavorite ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
                  <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile tabs for navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 sticky top-0 z-40 border-b dark:border-gray-700">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 flex-1 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('cast')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 flex-1 ${
              activeTab === 'cast'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-300'
            }`}
          >
            Cast & Crew
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 flex-1 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-300'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Overview and Details */}
          <div className={`md:col-span-2 space-y-8 ${activeTab !== 'overview' && activeTab !== 'cast' ? 'hidden md:block' : ''}`}>
            {/* Overview - Show on mobile only when activeTab is 'overview' */}
            {(activeTab === 'overview' || !activeTab) && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Overview</h2>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {showFullOverview || movie.overview.length <= 400 
                      ? movie.overview 
                      : `${movie.overview.substring(0, 400)}...`}
                    {movie.overview.length > 400 && (
                      <button
                        onClick={() => setShowFullOverview(!showFullOverview)}
                        className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none"
                      >
                        {showFullOverview ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </p>
                </div>
              </section>
            )}

            {/* Cast Section - Show on mobile only when activeTab is 'cast' */}
            {(activeTab === 'cast' || activeTab === 'overview' || !activeTab) && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Cast</h2>
                
                {/* Cast members */}
                {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 ? (
                  <div className="mb-8">                    
                    {/* Top cast with images */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                      {movie.credits.cast.slice(0, 10).map((person) => (
                        <div key={person.id} className="flex flex-col items-center text-center">
                          {person.imdbId ? (
                            <a 
                              href={`https://www.imdb.com/name/${person.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group"
                              aria-label={`View ${person.name} on IMDb`}
                            >
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 relative group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                {person.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(person.profile_path)}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{person.name}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">{person.character}</p>
                            </a>
                          ) : (
                            <>
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 relative">
                                {person.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(person.profile_path)}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">{person.character}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Extended cast list - Horizontally scrollable */}
                    {movie.credits.cast.length > 10 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200">Additional Cast</h4>
                          <div className="flex space-x-2">
                            <button 
                              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={() => {
                                document.getElementById('cast-scroll-container')?.scrollBy({ left: -300, behavior: 'smooth' });
                              }}
                            >
                              <FaChevronLeft className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={() => {
                                document.getElementById('cast-scroll-container')?.scrollBy({ left: 300, behavior: 'smooth' });
                              }}
                            >
                              <FaChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <div id="cast-scroll-container" className="flex overflow-x-auto pb-3 snap-x scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {movie.credits.cast.slice(10, 30).map((person) => (
                              <div key={person.id} className="flex-none w-48 mr-4 snap-start">
                                {person.imdbId ? (
                                  <a 
                                    href={`https://www.imdb.com/name/${person.imdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`View ${person.name} on IMDb`}
                                  >
                                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 h-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                      <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                                        {person.profile_path ? (
                                          <Image
                                            src={getProfileImageUrl(person.profile_path)}
                                            alt={person.name}
                                            width={56}
                                            height={56}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center">
                                            <FaUserCircle className="h-6 w-6 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                                        <p className="text-gray-500 dark:text-gray-300 text-xs">{person.character}</p>
                                      </div>
                                    </div>
                                  </a>
                                ) : (
                                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 h-full">
                                    <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                                      {person.profile_path ? (
                                        <Image
                                          src={getProfileImageUrl(person.profile_path)}
                                          alt={person.name}
                                          width={56}
                                          height={56}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                          <FaUserCircle className="h-6 w-6 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                                      <p className="text-gray-500 dark:text-gray-300 text-xs">{person.character}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {movie.credits.cast.length > 30 && (
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                            +{movie.credits.cast.length - 30} more cast members
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-300">No cast information available</p>
                  </div>
                )}
                
                {/* Crew Section */}
                {movie.credits && movie.credits.crew && movie.credits.crew.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Crew</h3>
                    
                    {/* Key crew members with photos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {/* Director */}
                      {director && (
                        <div className="flex flex-col items-center text-center p-3">
                          {director.imdbId ? (
                            <a 
                              href={`https://www.imdb.com/name/${director.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center"
                              aria-label={`View ${director.name} on IMDb`}
                            >
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                {director.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(director.profile_path)}
                                    alt={director.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{director.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Director</p>
                            </a>
                          ) : (
                            <>
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
                                {director.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(director.profile_path)}
                                    alt={director.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{director.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Director</p>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Producer */}
                      {producer && (
                        <div className="flex flex-col items-center text-center p-3">
                          {producer.imdbId ? (
                            <a 
                              href={`https://www.imdb.com/name/${producer.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center"
                              aria-label={`View ${producer.name} on IMDb`}
                            >
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                {producer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(producer.profile_path)}
                                    alt={producer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{producer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Producer</p>
                            </a>
                          ) : (
                            <>
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
                                {producer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(producer.profile_path)}
                                    alt={producer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{producer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Producer</p>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Writer */}
                      {writer && (
                        <div className="flex flex-col items-center text-center p-3">
                          {writer.imdbId ? (
                            <a 
                              href={`https://www.imdb.com/name/${writer.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center"
                              aria-label={`View ${writer.name} on IMDb`}
                            >
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                {writer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(writer.profile_path)}
                                    alt={writer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{writer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Writer</p>
                            </a>
                          ) : (
                            <>
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
                                {writer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(writer.profile_path)}
                                    alt={writer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{writer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Writer</p>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Cinematographer */}
                      {cinematographer && (
                        <div className="flex flex-col items-center text-center p-3">
                          {cinematographer.imdbId ? (
                            <a 
                              href={`https://www.imdb.com/name/${cinematographer.imdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center"
                              aria-label={`View ${cinematographer.name} on IMDb`}
                            >
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                {cinematographer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(cinematographer.profile_path)}
                                    alt={cinematographer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{cinematographer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Cinematographer</p>
                            </a>
                          ) : (
                            <>
                              <div className="h-32 w-32 rounded-full overflow-hidden mb-3 bg-gray-200 dark:bg-gray-700">
                                {cinematographer.profile_path ? (
                                  <Image
                                    src={getProfileImageUrl(cinematographer.profile_path)}
                                    alt={cinematographer.name}
                                    width={128}
                                    height={128}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaUserCircle className="h-16 w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{cinematographer.name}</p>
                              <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Cinematographer</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Other crew members by department - Horizontally scrollable */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200">Other Crew</h4>
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={() => {
                              document.getElementById('crew-scroll-container')?.scrollBy({ left: -300, behavior: 'smooth' });
                            }}
                          >
                            <FaChevronLeft className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={() => {
                              document.getElementById('crew-scroll-container')?.scrollBy({ left: 300, behavior: 'smooth' });
                            }}
                          >
                            <FaChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div id="crew-scroll-container" className="flex overflow-x-auto pb-3 snap-x scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {(() => {
                            const departments: { [key: string]: typeof movie.credits.crew } = {};
                            movie.credits?.crew?.forEach(person => {
                              if (!departments[person.job]) {
                                departments[person.job] = [];
                              }
                              departments[person.job].push(person);
                            });
                            
                            // Return departments with their crew members
                            return (
                              Object.entries(departments)
                                .filter(([job]) => 
                                  job !== 'Director' && 
                                  job !== 'Producer' && 
                                  job !== 'Writer' && 
                                  job !== 'Screenplay' && 
                                  job !== 'Story' &&
                                  job !== 'Director of Photography' && 
                                  job !== 'Cinematography'
                                )
                                .sort(([a], [b]) => a.localeCompare(b))
                                .slice(0, 10)
                                .map(([job, people]) => (
                                  <div key={job} className="flex-none w-72 mr-4 snap-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-full">
                                      <h4 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-200">{job}</h4>
                                      <div className="space-y-2">
                                        {people.slice(0, 3).map(person => (
                                          <div key={`${job}-${person.id}`} className="flex items-center space-x-3">
                                            {person.imdbId ? (
                                              <a 
                                                href={`https://www.imdb.com/name/${person.imdbId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                                aria-label={`View ${person.name} on IMDb`}
                                              >
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                                                  {person.profile_path ? (
                                                    <Image
                                                      src={getProfileImageUrl(person.profile_path)}
                                                      alt={person.name}
                                                      width={40}
                                                      height={40}
                                                      className="h-full w-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                      <FaUserCircle className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                  )}
                                                </div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                                              </a>
                                            ) : (
                                              <>
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                                                  {person.profile_path ? (
                                                    <Image
                                                      src={getProfileImageUrl(person.profile_path)}
                                                      alt={person.name}
                                                      width={40}
                                                      height={40}
                                                      className="h-full w-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                      <FaUserCircle className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                  )}
                                                </div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-300">No crew information available</p>
                  </div>
                )}
              </section>
            )}

            {/* Collection Section - if movie belongs to a collection */}
            {movie.belongs_to_collection && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Part of {movie.belongs_to_collection.name}</h2>
                <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden">
                  {movie.belongs_to_collection.backdrop_path ? (
                    <Image
                      src={getMovieBackdropUrl(movie.belongs_to_collection.backdrop_path)}
                      alt={movie.belongs_to_collection.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <FaFilm className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{movie.belongs_to_collection.name}</h3>
                      <button className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium">
                        View Collection
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Similar Movies */}
            {movie.similar?.results && movie.similar.results.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Similar Movies</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.similar.results.slice(0, 4).map((similarMovie) => (
                    <Link key={similarMovie.id} href={`/movie/${similarMovie.id}`}>
                      <div className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                        <div className="relative aspect-[2/3]">
                          {similarMovie.poster_path ? (
                            <Image
                              src={getMoviePosterUrl(similarMovie.poster_path)}
                              alt={similarMovie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <span className="text-gray-400 text-sm">No Poster</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {similarMovie.vote_average.toFixed(1)}
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800">
                          <h3 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                            {similarMovie.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Movie Info */}
          <div className={`space-y-6 ${activeTab !== 'details' ? 'hidden md:block' : ''}`}>
            {/* Movie Poster (Mobile Only) */}
            <div className="md:hidden relative aspect-[2/3] max-w-xs mx-auto rounded-lg overflow-hidden shadow-lg">
              {movie.poster_path ? (
                <Image
                  src={getMoviePosterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-400">No Poster</span>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Movie Details</h2>

              <div className="space-y-4">
                {movie.status && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className="text-gray-800 dark:text-white">{movie.status}</p>
                  </div>
                )}

                {movie.release_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Release Date</h3>
                    <p className="text-gray-800 dark:text-white">
                      {new Date(movie.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {movie.budget !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h3>
                    <p className="text-gray-800 dark:text-white">{formatCurrency(movie.budget)}</p>
                  </div>
                )}

                {movie.revenue !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                    <p className="text-gray-800 dark:text-white">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}

                {movie.popularity !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Popularity</h3>
                    <p className="text-gray-800 dark:text-white">{movie.popularity.toFixed(1)}</p>
                  </div>
                )}

                {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <FaLanguage className="mr-1" /> Languages
                    </h3>
                    <p className="text-gray-800 dark:text-white">
                      {movie.spoken_languages.map(lang => lang.english_name).join(', ')}
                    </p>
                  </div>
                )}

                {movie.production_countries && movie.production_countries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <FaMapMarkerAlt className="mr-1" /> Production Countries
                    </h3>
                    <p className="text-gray-800 dark:text-white">
                      {movie.production_countries.map(country => country.name).join(', ')}
                    </p>
                  </div>
                )}

                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Production Companies</h3>
                    <div className="space-y-2 mt-2">
                      {movie.production_companies.map(company => (
                        <div key={company.id} className="flex items-center space-x-2">
                          <FaCircle className="h-1.5 w-1.5 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {movie.homepage && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <FaGlobe className="h-3.5 w-3.5" />
                      <span>Official Website</span>
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Stats & Metrics */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Stats & Metrics</h2>
              
              <div className="space-y-4">
                {/* Visual rating */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">User Rating</h3>
                  <div className="mt-2 flex items-center">
                    <div className="relative h-2 w-full bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-yellow-500" 
                        style={{ width: `${(movie.vote_average || 0) * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-bold text-yellow-500">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{movie.vote_count?.toLocaleString()} votes</p>
                </div>

                {/* Budget vs Revenue comparison if both exist */}
                {movie.budget && movie.revenue && movie.budget > 0 && movie.revenue > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget vs Revenue</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-gray-800 dark:text-white font-semibold">{formatCurrency(movie.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className={`font-semibold ${
                          movie.revenue > movie.budget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(movie.revenue)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {movie.revenue > movie.budget
                          ? `Profit: ${formatCurrency(movie.revenue - movie.budget)} (+${((movie.revenue / movie.budget - 1) * 100).toFixed(0)}%)`
                          : `Loss: ${formatCurrency(movie.budget - movie.revenue)} (-${((1 - movie.revenue / movie.budget) * 100).toFixed(0)}%)`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Production Companies with Logos */}
            {movie.production_companies && movie.production_companies.some(company => company.logo_path) && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Production Companies</h2>
                <div className="space-y-4">
                  {movie.production_companies
                    .filter(company => company.logo_path)
                    .slice(0, 4)
                    .map(company => (
                      <div key={company.id} className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center p-1">
                          {company.logo_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                              alt={company.name}
                              width={60}
                              height={40}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No logo</span>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-white text-sm font-medium">{company.name}</p>
                          {company.origin_country && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{company.origin_country}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal with Blurred Background */}
      {showTrailer && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred background instead of black */}
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

            {/* Video container with proper aspect ratio */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={getYoutubeEmbedUrl(movie.trailerUrl)}
                title={`${movie.title} Trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>

            {/* Movie title below video */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{movie.title} - Official Trailer</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}