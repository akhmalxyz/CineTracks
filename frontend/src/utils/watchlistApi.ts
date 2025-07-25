// Watchlist Service API functions
import { WatchStatus } from '../types';

// Movie Watchlist API functions
export async function getMovieWatchlist(username: string): Promise<any[]> {
  try {
    // Use credentials: 'include' to make sure cookies are sent with the request
    const response = await fetch(`/api/watchlist/movies/${username}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie watchlist');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie watchlist:', error);
    return [];
  }
}

export async function addMovieToWatchlist(username: string, movieId: string, status: WatchStatus): Promise<any> {
  try {
    const response = await fetch('/api/watchlist/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        movieId,
        status,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add movie to watchlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding movie to watchlist:', error);
    throw error;
  }
}

export async function updateMovieWatchStatus(username: string, movieId: string, status: WatchStatus): Promise<any> {
  try {
    const response = await fetch(`/api/watchlist/movies/${username}/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update movie watch status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating movie watch status:', error);
    throw error;
  }
}

export async function removeMovieFromWatchlist(username: string, movieId: string): Promise<void> {
  try {
    const response = await fetch(`/api/watchlist/movies/${username}/${movieId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove movie from watchlist');
    }
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    throw error;
  }
}

// TV Show Watchlist API functions
export async function getTvShowWatchlist(username: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/watchlist/tvshows/${username}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch TV show watchlist');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV show watchlist:', error);
    return [];
  }
}

export async function addTvShowToWatchlist(
  username: string, 
  tvShowId: string, 
  status: WatchStatus,
  currentSeason: number = 1,
  currentEpisode: number = 0
): Promise<any> {
  try {
    const response = await fetch('/api/watchlist/tvshows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        tvShowId,
        currentSeason,
        currentEpisode,
        status,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add TV show to watchlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding TV show to watchlist:', error);
    throw error;
  }
}

export async function updateTvShowWatchStatus(
  username: string, 
  tvShowId: string, 
  status: WatchStatus,
  currentSeason?: number,
  currentEpisode?: number
): Promise<any> {
  try {
    const payload: any = { status };
    if (currentSeason !== undefined) payload.currentSeason = currentSeason;
    if (currentEpisode !== undefined) payload.currentEpisode = currentEpisode;

    const response = await fetch(`/api/watchlist/tvshows/${username}/${tvShowId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update TV show watch status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating TV show watch status:', error);
    throw error;
  }
}

export async function removeTvShowFromWatchlist(username: string, tvShowId: string): Promise<void> {
  try {
    const response = await fetch(`/api/watchlist/tvshows/${username}/${tvShowId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove TV show from watchlist');
    }
  } catch (error) {
    console.error('Error removing TV show from watchlist:', error);
    throw error;
  }
}
