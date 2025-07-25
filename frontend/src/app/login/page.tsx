'use client';

import LoginForm from './form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl"
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
        <Link href="/" className="flex items-center text-white hover:text-indigo-300 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Back to home</span>
        </Link>
      </motion.div>

      {/* Login container */}
      <motion.div 
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Login header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-indigo-100">Sign in to your CineTracks account</p>
          </motion.div>
        </div>
        
        {/* Login form */}
        <div className="p-8">
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}
