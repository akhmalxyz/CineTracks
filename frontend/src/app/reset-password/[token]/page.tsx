'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLock, FaCheck } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, error, isLoading, clearError } = useAuth();
  
  const router = useRouter();
  const params = useParams();
  const { token } = params;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (!newPassword || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    
    await resetPassword(token as string, newPassword);
    if (!error) {
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-indigo-100">Create a new password for your account</p>
        </div>
        
        <div className="p-8">
          {isSuccess ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Password Reset Successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <div className="mt-6">
                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Go to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              {validationError && (
                <div className="text-white text-sm bg-red-500 p-3 rounded-md">
                  {validationError}
                </div>
              )}
              
              {error && (
                <div className="text-white text-sm bg-red-500 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
              
              <div className="text-center">
                <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Return to Login
                </Link>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}