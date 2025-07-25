'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset, error, isLoading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    await requestPasswordReset(email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl"
          animate={{
            x: ['-20%', '10%', '-5%', '15%', '-20%'],
            y: ['15%', '-20%', '10%', '-15%', '15%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ top: '10%', left: '40%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"
          animate={{
            x: ['10%', '-15%', '5%', '-10%', '10%'],
            y: ['-15%', '10%', '-15%', '5%', '-15%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ bottom: '20%', right: '30%' }}
        />
      </div>

      {/* Back button */}
      <motion.div 
        className="absolute top-6 left-6 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/login" className="flex items-center text-white hover:text-indigo-300 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Back to login</span>
        </Link>
      </motion.div>

      {/* Container */}
      <motion.div 
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-white">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-2">Forgot Password</h2>
            <p className="text-blue-100">Enter your email to reset your password</p>
          </motion.div>
        </div>
        
        {/* Form */}
        <div className="p-8">
          {!isSubmitted ? (
            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

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
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg 
                  className="h-6 w-6 text-green-600" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Check your inbox</h3>
              <p className="mt-2 text-sm text-gray-500">
                We've sent a password reset link to {email}.
                Please check your inbox and follow the instructions.
              </p>
              <div className="mt-6">
                <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Return to login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}