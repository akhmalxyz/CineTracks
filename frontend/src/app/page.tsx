'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaFilm, FaTv, FaListAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isGuest } = useAuth();

  useEffect(() => {
    // If user is logged in (not as guest), redirect to home
    if (!isLoading && user && !isGuest) {
      router.push('/home');
    }
  }, [isLoading, user, isGuest, router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };
  
  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <motion.header 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 z-0 bg-[url('/hero-background.svg')] bg-cover bg-center opacity-30" />
        
        <div className="container mx-auto px-6 z-10">
          <motion.div
            className="flex flex-col items-center text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8"
              variants={itemVariants}
            >
              <span className="text-indigo-400">Cine</span>Tracks
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 max-w-2xl"
              variants={itemVariants}
            >
              Your personal movie and series watchlist tracker. Never lose track of what you're watching again.
            </motion.p>
            
            <motion.div 
              className="flex flex-col md:flex-row gap-4"
              variants={itemVariants}
            >
              {isGuest ? (
                <Link href="/home" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                  <span>Continue as Guest</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : (
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                  <span>Get Started</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
              <Link href="/login" className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to keep track of your entertainment</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="text-indigo-400 mb-4">
                <FaListAlt size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Watchlist</h3>
              <p className="text-gray-400">Organize your content into watched, watching, and plan-to-watch categories.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-indigo-400 mb-4">
                <FaFilm size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Movie Details</h3>
              <p className="text-gray-400">Access titles, ratings, summaries, and genres in real-time.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-indigo-400 mb-4">
                <FaTv size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Episode Tracking</h3>
              <p className="text-gray-400">Track your progress through series and anime episodes.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-indigo-400 mb-4">
                <FaUserCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Reviews</h3>
              <p className="text-gray-400">Rate and review the content you've watched.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-indigo-900">
        <motion.div 
          className="container mx-auto px-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl font-bold mb-8">Ready to start tracking?</h2>
          <Link href={isGuest ? "/home" : "/register"} className="bg-white text-indigo-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
            {isGuest ? "Continue to Home" : "Create Your Account"}
          </Link>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-10 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-xl font-bold"><span className="text-indigo-400">Cine</span>Tracks</p>
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors">About</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
