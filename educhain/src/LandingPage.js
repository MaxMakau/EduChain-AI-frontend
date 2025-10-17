import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from './assets/logo.png';
import useThemeColor from "./hooks/useThemeColor";

const colors = {
  oceanBlue: '#2772A0',
  cloudySky: '#CCDDEA',
  white: '#FFFFFF',
  darkText: '#1E293B',
};

const EduChainLanding = () => {

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{
        background: 'linear-gradient(to bottom, #F7EEC9, #A3E2E4)',
        color: colors.darkText,
      }}
    >
      {/* Header (Translucent Navbar over Gradient) */}
      <header
        className="fixed top-0 left-0 w-full h-14 z-50 px-4 sm:px-8 flex justify-between items-center backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)', // translucent layer
          borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div className="flex items-center space-x-3">
          <img src={logo} alt="EduChainAI Logo" className="w-9 h-9" />
          <h1
            className="text-lg sm:text-xl font-bold"
            style={{ color: colors.oceanBlue }}
          >
            EduChainAI
          </h1>
        </div>

        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link
            to="/login"
            className="hidden sm:block hover:underline font-medium"
            style={{ color: colors.oceanBlue }}
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-full font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #2772A0, #1A8BBF)',
            }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col justify-center items-center text-center px-6 pt-20 pb-12 sm:pt-28">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl font-extrabold leading-snug max-w-3xl mb-6"
        >
          Transforming ECDE Management
          <br />
          Through{' '}
          <span style={{ color: colors.oceanBlue }}>AI & Blockchain</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl text-gray-700 mb-10 text-base sm:text-lg"
        >
          A next-generation data platform that digitizes and secures ECDE school
          management across the country. From manual and reactive to digital,
          proactive, and accountable.
        </motion.p>

        {/* Aesthetic Buttons */}
        <div className="flex flex-row flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full font-semibold text-white text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #2772A0, #1A8BBF)',
            }}
          >
            Sign Up
          </Link>

          <Link
            to="/login"
            className="px-8 py-3 rounded-full font-semibold border-2 border-[#2772A0] text-[#2772A0] bg-white/40 transition-all duration-300 hover:bg-[#2772A0] hover:text-white hover:shadow-lg hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-black text-center py-6 mt-auto text-sm"
        style={{
          background: 'transparent',
        }}
      >
        © {new Date().getFullYear()} EduChainAI
      </footer>
    </div>
  );
};

export default EduChainLanding;
