import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, BarChart3 } from 'lucide-react';
import logo from './assets/logo.png';

const colors = {
  oceanBlue: '#2772A0',
  cloudySky: '#CCDDEA',
  white: '#FFFFFF',
  darkText: '#1E293B',
};

const EduChainLanding = () => {
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: colors.cloudySky, color: colors.darkText }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-14 bg-white shadow-sm z-50 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="EduChainAI Logo" className="w-10 h-10" />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: colors.oceanBlue }}
            >
              EduChainAI
            </h1>
          </div>
        </div>

        <nav className="flex items-center space-x-6">
          <Link
            to="/login"
            className="hover:underline font-medium"
            style={{ color: colors.oceanBlue }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: colors.oceanBlue }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
<section className="flex flex-col justify-center items-center text-center mt-24 md:mt-24 px-6 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-extrabold leading-snug max-w-3xl mb-6"
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
          className="max-w-2xl text-gray-700 mb-10 text-lg"
        >
          A next-generation data platform that digitizes and secures ECDE school
          management across the Country. From manual and reactive to digital,
          proactive, and accountable.
        </motion.p>

        <div className="flex gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: colors.oceanBlue }}
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="border-2 px-6 py-3 rounded-xl font-semibold hover:text-white hover:opacity-90 transition"
            style={{
              borderColor: colors.oceanBlue,
              color: colors.oceanBlue,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.oceanBlue;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = colors.oceanBlue;
            }}
          >
            Sign In
          </Link>
        </div>
      </section>

     

      {/* Footer */}
      <footer
        className="text-black text-center py-6 mt-auto"
        style={{ backgroundColor: colors.cloudySky }}
      >
        <p className="text-sm">
          © {new Date().getFullYear()} EduChainAI — Empowering ECDE with Trust &
          Technology.
        </p>
      </footer>
    </div>
  );
};

export default EduChainLanding;
