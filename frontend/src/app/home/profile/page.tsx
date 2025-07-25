'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaTrash, FaArrowLeft, FaFilm, FaTv, FaList, FaSignOutAlt, FaStar, FaCalendarAlt, FaCog, FaUserCircle, FaSearch, FaPlay } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmittingProfileUpdate, setIsSubmittingProfileUpdate] = useState(false);
  const [isSubmittingPasswordChange, setIsSubmittingPasswordChange] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { user, updateUser, changePassword, deleteUser, isLoading, error, clearError, isGuest, logout } = useAuth();
  const router = useRouter();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
    }
    clearError();
  }, [user, clearError]);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    if (username.trim() === '') {
      setValidationError('Username cannot be empty');
      return;
    }
    
    if (email && !validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Prevent multiple submissions
    if (isSubmittingProfileUpdate) return;
    setIsSubmittingProfileUpdate(true);

    try {
      await updateUser(username, email);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmittingProfileUpdate(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmittingPasswordChange) return;
    setIsSubmittingPasswordChange(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setSuccessMessage('Password changed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsSubmittingPasswordChange(false);
    }
  };

  const handleAccountDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteUser();
        // Deletion handled by AuthContext (logs out and redirects)
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    } else {
      setConfirmDelete(true);
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 5000);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

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
          
          <div className="flex items-center space-x-4">
            {/* Username display and profile menu */}
            <div className="relative flex items-center space-x-3">
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
              <button 
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Profile dropdown menu positioned correctly under profile icon */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'Guest User'}</p>
                  </div>
                  <Link href="/home">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaPlay className="mr-2 h-4 w-4" />
                      Home
                    </div>
                  </Link>
                  <Link href="/home?tab=watchlist">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaList className="mr-2 h-4 w-4" />
                      My Watchlist
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
                    false // Not active in profile page
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div
                className="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors 
                  bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 cursor-pointer mt-4"
              >
                <FaCog className="h-5 w-5" />
                <span>Account Settings</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Profile content */}
          <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
              </div>
              
              {successMessage && (
                <motion.div 
                  className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-200 rounded-md shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center">
                    <FaCheck className="mr-2" />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded-md shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>{error}</p>
                </motion.div>
              )}

              {/* Profile Settings Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Profile Information</h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Form fields for profile info */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing || isGuest}
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder={isGuest ? "Email not available for guest users" : ""}
                        />
                      </div>
                    </div>
                    
                    {validationError && (
                      <div className="text-sm text-red-600 dark:text-red-400">{validationError}</div>
                    )}
                    
                    <div className="flex justify-between">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isSubmittingProfileUpdate}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            {isSubmittingProfileUpdate ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              if (user) {
                                setUsername(user.username);
                                setEmail(user.email || '');
                              }
                              setValidationError('');
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Password Change Form */}
              {!isGuest && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">Password</h2>
                  </div>
                  <div className="p-6">
                    {!isChangingPassword ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Change your password to keep your account secure.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          Change Password
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="password"
                              id="current-password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              placeholder="Your current password"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="password"
                              id="new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              placeholder="New password (min 8 characters)"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm New Password
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="password"
                              id="confirm-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        
                        {validationError && (
                          <div className="text-sm text-red-600 dark:text-red-400">{validationError}</div>
                        )}
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingPassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                              setValidationError('');
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingPasswordChange}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            {isSubmittingPasswordChange ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
              
              {/* Account Deletion Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Delete Account</h2>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isGuest ? 
                          "Guest accounts are automatically deleted after 24 hours of inactivity." : 
                          "Once you delete your account, there is no going back. This action cannot be undone."}
                      </p>
                    </div>
                    {!isGuest && (
                      <button
                        onClick={handleAccountDelete}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none ${
                          confirmDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        {confirmDelete ? 'Click again to confirm' : 'Delete Account'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}