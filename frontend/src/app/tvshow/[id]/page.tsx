'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft, FaPlay, FaStar, FaCalendarAlt, FaClock, FaGlobe, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCircle, FaUserCircle, FaSearch, FaFilm, FaTv, FaListUl, FaChevronRight, FaChevronLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { WatchStatus, DetailedTvShow as DetailedTvShowType } from '@/types';
import { 
  getTvShowWatchlist,
  addTvShowToWatchlist,
  updateTvShowWatchStatus,
  removeTvShowFromWatchlist
} from '@/utils/watchlistApi';

// Interface for detailed TV show/anime data
interface DetailedTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  last_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  number_of_seasons: number;
  number_of_episodes: number;
  in_production?: boolean;
  status?: string;
  tagline?: string;
  homepage?: string;
  origin_country?: string[];
  original_language?: string;
  episode_run_time?: number[];
  type?: string;
  genres?: { id: number; name: string }[];
  seasons?: {
    id: number;
    season_number: number;
    episode_count: number;
    air_date?: string;
    name: string;
    overview?: string;
    poster_path?: string;
  }[];
  created_by?: {
    id: number;
    name: string;
    profile_path?: string;
    imdbId?: string;
  }[];
  networks?: {
    id: number;
    name: string;
    logo_path?: string;
    origin_country?: string;
  }[];
  production_companies?: {
    id: number;
    name: string;
    logo_path?: string;
    origin_country?: string;
  }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path?: string;
      imdbId?: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path?: string;
      imdbId?: string;
    }[];
  };
  similar?: {
    results: {
      id: number;
      name: string;
      poster_path?: string;
      vote_average: number;
    }[];
  };
  trailerUrl?: string;
}

// Define route params interface
interface TvShowPageProps {
  params: {
    id: string;
    type?: string; // Optional type parameter to distinguish between regular TV shows and anime
  };
}

export default function TvShowDetails({ params }: TvShowPageProps) {
  // Access the ID from params
  const tvShowId = params.id;
  const contentType = params.type || 'tvshow'; // Default to 'tvshow' if not specified
  const isAnime = contentType === 'anime';

  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [tvShow, setTvShow] = useState<DetailedTvShow | null>(null);
  const [isLoadingTvShow, setIsLoadingTvShow] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchStatus, setWatchStatus] = useState<WatchStatus | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number | undefined>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number | undefined>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // For mobile view tabs
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  
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

  // Toggle progress dialog
  const toggleProgressDialog = () => {
    setShowProgressDialog(!showProgressDialog);
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

  // Fetch detailed TV show info
  useEffect(() => {
    const fetchTvShowDetails = async () => {
      if (!tvShowId) return;
      
      try {
        setIsLoadingTvShow(true);
        
        // Different endpoint for anime vs regular TV shows
        const endpoint = isAnime 
          ? `/api/catalog/tvshows/anime/${tvShowId}`
          : `/api/catalog/tvshows/${tvShowId}`;
          
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('TV show not found');
        }
        const tvShowData = await response.json();

        setTvShow(tvShowData);
        setIsLoadingTvShow(false);
      } catch (error) {
        console.error('Error fetching TV show details:', error);
        setIsLoadingTvShow(false);
      }
    };

    if (tvShowId) {
      fetchTvShowDetails();
    }
  }, [tvShowId, isAnime]);

  // Check if TV show is in user's watchlist
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user || !tvShowId) return;
      
      try {
        const watchlist = await getTvShowWatchlist(user.username);
        const tvShowInWatchlist = watchlist.find(item => item.tvShowId === tvShowId);
        
        if (tvShowInWatchlist) {
          setIsInWatchlist(true);
          setWatchStatus(tvShowInWatchlist.status);
          setCurrentSeason(tvShowInWatchlist.currentSeason || 1);
          setCurrentEpisode(tvShowInWatchlist.currentEpisode || 0);
        } else {
          setIsInWatchlist(false);
          setWatchStatus(null);
          setCurrentSeason(1);
          setCurrentEpisode(0);
        }
      } catch (error) {
        console.error("Error checking watchlist status:", error);
      }
    };

    if (user && !isGuest) {
      checkWatchlistStatus();
    }
  }, [user, tvShowId, isGuest]);

  // Watch trailer functionality
  const openTrailer = () => {
    if (tvShow?.trailerUrl) {
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
    if (!user || isGuest || !tvShowId) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await addTvShowToWatchlist(
        user.username, 
        tvShowId, 
        status, 
        currentSeason, 
        currentEpisode
      );
      setIsInWatchlist(true);
      setWatchStatus(status);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error adding TV show to watchlist:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const updateWatchlistStatus = async (status: WatchStatus) => {
    if (!user || isGuest || !tvShowId) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await updateTvShowWatchStatus(
        user.username, 
        tvShowId, 
        status,
        currentSeason,
        currentEpisode
      );
      setWatchStatus(status);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error updating TV show watchlist status:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const updateWatchProgress = async () => {
    if (!user || isGuest || !tvShowId || !isInWatchlist) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await updateTvShowWatchStatus(
        user.username,
        tvShowId,
        watchStatus || WatchStatus.CURRENTLY_WATCHING,
        currentSeason,
        currentEpisode
      );
      setShowProgressDialog(false);
    } catch (error) {
      console.error('Error updating TV show progress:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const removeFromWatchlist = async () => {
    if (!user || isGuest || !tvShowId) return;
    
    setIsUpdatingWatchlist(true);
    try {
      await removeTvShowFromWatchlist(user.username, tvShowId);
      setIsInWatchlist(false);
      setWatchStatus(null);
      setShowWatchlistMenu(false);
    } catch (error) {
      console.error('Error removing TV show from watchlist:', error);
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

  // Function to get average episode runtime
  const getAverageEpisodeRuntime = (runtimes?: number[]) => {
    if (!runtimes || runtimes.length === 0) return 'Unknown';
    const total = runtimes.reduce((acc, time) => acc + time, 0);
    return formatRuntime(Math.floor(total / runtimes.length));
  };

  // Function to get TV show poster URL
  const getPosterUrl = (posterPath: string | null | undefined) => {
    if (!posterPath) return '';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  // Function to get TV show backdrop URL
  const getBackdropUrl = (backdropPath: string | null | undefined) => {
    if (!backdropPath) return '';
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  };

  // Function to get profile image URL
  const getProfileImageUrl = (profilePath: string | null | undefined) => {
    if (!profilePath) return '';
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  };

  // Loading state
  if (isLoading || isLoadingTvShow) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xl font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // TV show not found
  if (!tvShow) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">{isAnime ? 'Anime' : 'TV Show'} Not Found</h1>
        <p className="mb-8 text-xl text-gray-300">
          We couldn't find the {isAnime ? 'anime' : 'TV show'} you're looking for.
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

  // Extract key crew members
  const creators = tvShow.created_by || [];
  const director = tvShow.credits?.crew?.find(person => 
    person.job === 'Director' || person.job === 'Series Director');
  const producer = tvShow.credits?.crew?.find(person => 
    person.job === 'Executive Producer' || person.job === 'Producer');
  const writer = tvShow.credits?.crew?.find(person => 
    person.job === 'Writer' || person.job === 'Screenplay' || person.job === 'Story');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header/Navigation Bar */}
      <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo - Made bigger and positioned at top left */}
          <Link href="/home">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer">
              <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies & shows..."
                className="w-64 py-2 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:text-white"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
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
          </div>
        </div>
      </header>

      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full">
        {/* Backdrop Image */}
        {tvShow.backdrop_path && (
          <div className="absolute inset-0">
            <Image
              src={getBackdropUrl(tvShow.backdrop_path)}
              alt={tvShow.name}
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
              <button className="flex items-center space-x-2 rounded-lg bg-black/30 backdrop-blur-sm px-4 py-2 text-white transition-colors hover:bg-black/50">
                <FaArrowLeft />
                <span>Back</span>
              </button>
            </Link>
          </div>

          {/* TV Show info */}
          <div className="mt-auto flex flex-col md:flex-row items-end space-y-6 md:space-y-0 md:space-x-8 p-6 md:p-12">
            {/* Poster - Only show on larger screens, mobile will show it in the main content area */}
            <div className="hidden md:block relative h-72 w-48 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
              <Image
                src={getPosterUrl(tvShow.poster_path)}
                alt={tvShow.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="w-full">
              {/* Title and Year */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {tvShow.name}{' '}
                <span className="text-gray-300">
                  ({tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A'})
                </span>
              </h1>

              {/* Type badge for Anime */}
              {isAnime && (
                <span className="inline-block bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                  Anime
                </span>
              )}
              
              {/* Type badge for TV Show */}
              {!isAnime && tvShow.type && (
                <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold mb-2 ml-2">
                  {tvShow.type}
                </span>
              )}

              {/* Tagline */}
              {tvShow.tagline && (
                <p className="italic text-gray-300 mb-3">{tvShow.tagline}</p>
              )}

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tvShow.genres?.map(genre => (
                  <span
                    key={genre.id}
                    className="inline-block bg-gray-800 text-gray-200 rounded-full px-3 py-1 text-xs"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>              {/* Watch Status & Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* Watch Trailer */}
                {tvShow.trailerUrl && (
                  <button
                    onClick={openTrailer}
                    className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <FaPlay className="h-4 w-4" />
                    <span>Watch Trailer</span>
                  </button>
                )}                {/* Add to Watchlist Button */}
                <div className="relative">
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
                      className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-50"
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

                        {watchStatus === WatchStatus.CURRENTLY_WATCHING && (
                          <button
                            onClick={toggleProgressDialog}
                            className="block w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Update Progress
                          </button>
                        )}
                        
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

                {/* Add to Favorites Button */}
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 rounded-md bg-gray-700/80 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {isFavorite ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
                  <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>

              {/* Stats like ratings, runtime, etc. */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
                {/* Rating */}
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span>{tvShow.vote_average.toFixed(1)}/10</span>
                  <span className="text-gray-400 ml-1">({tvShow.vote_count.toLocaleString()} votes)</span>
                </div>

                {/* Number of Seasons/Episodes */}
                <div>
                  <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                  <span className="mx-1">·</span>
                  <span>{tvShow.number_of_episodes} Episode{tvShow.number_of_episodes !== 1 ? 's' : ''}</span>
                </div>

                {/* Episode Runtime */}
                {tvShow.episode_run_time && tvShow.episode_run_time.length > 0 && (
                  <div>
                    <span>~ {getAverageEpisodeRuntime(tvShow.episode_run_time)} per episode</span>
                  </div>
                )}

                {/* First Air Date */}
                {tvShow.first_air_date && (
                  <div>
                    <span>First aired: {new Date(tvShow.first_air_date).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Status */}
                {tvShow.status && (
                  <div className={`${tvShow.status === 'Ended' ? 'text-red-400' : tvShow.status === 'Returning Series' ? 'text-green-400' : ''}`}>
                    <span>{tvShow.status}</span>
                  </div>
                )}
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
            {/* Overview Section */}
            {(activeTab === 'overview' || !activeTab) && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Overview</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <p className={`text-gray-700 dark:text-gray-300 ${!showFullOverview && tvShow.overview && tvShow.overview.length > 400 ? 'line-clamp-6' : ''}`}>
                    {tvShow.overview || 'No overview available.'}
                  </p>
                  {tvShow.overview && tvShow.overview.length > 400 && (
                    <button
                      onClick={() => setShowFullOverview(!showFullOverview)}
                      className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      {showFullOverview ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </section>
            )}            {/* Cast & Crew Section */}
            {(activeTab === 'cast' || activeTab === 'overview' || !activeTab) && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Cast</h2>
                {/* Cast members */}
                {tvShow.credits && tvShow.credits.cast && tvShow.credits.cast.length > 0 ? (
                  <div className="mb-8">
                    {/* Top cast with images */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                      {tvShow.credits.cast.slice(0, 10).map((person) => (
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
                    {tvShow.credits.cast.length > 10 && (
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
                            {tvShow.credits.cast.slice(10, 30).map((person) => (
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
                        {tvShow.credits.cast.length > 30 && (
                          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                            +{tvShow.credits.cast.length - 30} more cast members
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
                {tvShow.credits && tvShow.credits.crew && tvShow.credits.crew.length > 0 ? (
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
                            const departments: { [key: string]: typeof tvShow.credits.crew } = {};
                            tvShow.credits?.crew?.forEach(person => {
                              if (!departments[person.job]) {
                                departments[person.job] = [];
                              }
                              departments[person.job].push(person);
                            });
                            return (
                              Object.entries(departments)
                                .filter(([job]) => 
                                  job !== 'Director' && 
                                  job !== 'Producer' && 
                                  job !== 'Writer' && 
                                  job !== 'Screenplay' && 
                                  job !== 'Story'
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

            {/* Seasons Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Seasons</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                {tvShow.seasons && tvShow.seasons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tvShow.seasons.map(season => (
                      <div key={season.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                        <div className="relative aspect-[2/3] w-full">
                          <Image
                            src={season.poster_path ? getPosterUrl(season.poster_path) : getPosterUrl(tvShow.poster_path)}
                            alt={season.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{season.name}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span>{season.episode_count} Episodes</span>
                            {season.air_date && (
                              <span>{new Date(season.air_date).getFullYear()}</span>
                            )}
                          </div>
                          {season.overview && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">{season.overview}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No season information available.</p>
                )}
              </div>
            </section>

            {/* Similar Shows Section */}
            {tvShow.similar?.results && tvShow.similar.results.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Similar {isAnime ? 'Anime' : 'TV Shows'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {tvShow.similar.results.slice(0, 8).map(show => (
                    <Link href={`/tvshow/${show.id}`} key={show.id}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                        <div className="relative aspect-[2/3] w-full">                          {show.poster_path ? (
                            <Image
                              src={getPosterUrl(show.poster_path)}
                              alt={show.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <FaTv className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                          {/* Rating Badge */}
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold rounded px-1 py-0.5 flex items-center">
                            <FaStar className="text-yellow-500 mr-1 text-xs" />
                            {show.vote_average.toFixed(1)}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {show.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - TV Show Info */}
          <div className={`space-y-6 ${activeTab !== 'details' ? 'hidden md:block' : ''}`}>
            {/* Mobile Poster */}
            <div className="md:hidden relative aspect-[2/3] max-w-xs mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image
                src={getPosterUrl(tvShow.poster_path)}
                alt={tvShow.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Status and air dates */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Status</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    tvShow.status === 'Ended' ? 'text-red-600 dark:text-red-400' : 
                    tvShow.status === 'Returning Series' ? 'text-green-600 dark:text-green-400' : 
                    'text-gray-900 dark:text-white'
                  }`}>{tvShow.status || 'Unknown'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">First Aired:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tvShow.first_air_date ? new Date(tvShow.first_air_date).toLocaleDateString() : 'Unknown'}
                  </span>
                </li>
                {tvShow.last_air_date && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Aired:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(tvShow.last_air_date).toLocaleDateString()}
                    </span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Seasons:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tvShow.number_of_seasons}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Episodes:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tvShow.number_of_episodes}</span>
                </li>
                {tvShow.episode_run_time && tvShow.episode_run_time.length > 0 && (
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Episode Runtime:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getAverageEpisodeRuntime(tvShow.episode_run_time)}
                    </span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {isAnime ? 'Anime' : tvShow.type || 'TV Show'}
                  </span>
                </li>
              </ul>
            </section>

            {/* Networks and Production */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Networks & Production</h3>
              
              {/* Networks with logos */}
              {tvShow.networks && tvShow.networks.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Networks:</h4>
                  <div className="flex flex-wrap gap-4">
                    {tvShow.networks.map(network => (
                      <div key={network.id} className="flex items-center space-x-2">
                        {network.logo_path && (
                          <div className="relative h-8 w-16 bg-white rounded p-1">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                              alt={network.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-gray-900 dark:text-white text-sm">
                          {network.name}
                          {network.origin_country && ` (${network.origin_country})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Origin Country */}
              {tvShow.origin_country && tvShow.origin_country.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Origin Country:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tvShow.origin_country.map(country => (
                      <span key={country} className="text-gray-900 dark:text-white">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Original Language */}
              {tvShow.original_language && (
                <div className="mb-4">
                  <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Original Language:</h4>
                  <span className="text-gray-900 dark:text-white">
                    {tvShow.original_language === 'ja' ? 'Japanese' : 
                      tvShow.original_language === 'en' ? 'English' : 
                      tvShow.original_language === 'ko' ? 'Korean' : 
                      tvShow.original_language}
                  </span>
                </div>
              )}
              
              {/* Production Companies */}
              {tvShow.production_companies && tvShow.production_companies.length > 0 && (
                <div>
                  <h4 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Production Companies:</h4>
                  <ul className="space-y-2">
                    {tvShow.production_companies.map(company => (
                      <li key={company.id} className="flex items-center space-x-2">
                        {company.logo_path && (
                          <div className="relative h-6 w-12 bg-white rounded p-0.5">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                              alt={company.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-gray-900 dark:text-white text-sm">
                          {company.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* External Links */}
            {tvShow.homepage && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">External Links</h3>
                <a 
                  href={tvShow.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <FaExternalLinkAlt />
                  <span>Official Website</span>
                </a>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal with Blurred Background */}
      {showTrailer && tvShow.trailerUrl && (
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
                src={getYoutubeEmbedUrl(tvShow.trailerUrl)}
                title={`${tvShow.name} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>

            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{tvShow.name} - Official Trailer</h3>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Dialog */}
      {showProgressDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred background overlay */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/40" onClick={() => setShowProgressDialog(false)}></div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md z-10 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Watching Progress</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Track your progress for {tvShow.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Season
                </label>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    min="1"
                    max={tvShow.number_of_seasons} 
                    value={currentSeason} 
                    onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    of {tvShow.number_of_seasons}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Episode
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={currentEpisode} 
                  onChange={(e) => setCurrentEpisode(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowProgressDialog(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={updateWatchProgress}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdatingWatchlist}
              >
                {isUpdatingWatchlist ? (
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
