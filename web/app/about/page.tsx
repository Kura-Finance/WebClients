'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import TopNav from '@/components/TopNav';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      {/* TopNav */}
      <TopNav />

      {/* Breadcrumb / Back button */}
      <div className="px-6 py-3 border-b border-[#1A1A24] bg-[#0B0B0F]/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      {/* Main content - centered */}
      <motion.main
        className="flex-1 flex items-center justify-center px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="rounded-3xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-12 text-center">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent">
                Your Financial Nexus
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Kura is revolutionizing personal finance by providing a unified, read-only dashboard. Track your entire net worth across traditional and decentralized finance in one powerful, intuitive platform.
              </p>
            </div>
          </motion.section>

          {/* Mission Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-[#8B5CF6]">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  We believe that understanding your wealth shouldn&apos;t be complicated. Our mission is to create a unified ecosystem where you can seamlessly visualize and track your assets—whether it&apos;s fiat accounts, cryptocurrencies, or DeFi protocols—without ever compromising custody.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-[#A78BFA]">Our Vision</h3>
                <p className="text-gray-400 leading-relaxed">
                  We envision a future where financial clarity is accessible to everyone. By providing crystal-clear data visualization and insights, we empower you to take control of your financial journey with complete confidence and security.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <h3 className="text-3xl font-bold mb-8">Why Choose Kura?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Unified Dashboard',
                  description: 'View your scattered financial data in one place—strictly read-only and highly visual.',
                  icon: '📊',
                },
                {
                  title: 'Historical Analytics',
                  description: 'Understand your spending habits and net-worth trends with intuitive data charts.',
                  icon: '📈',
                },
                {
                  title: 'Cross-Chain Tracking',
                  description: 'Seamlessly track asset balances across multiple blockchains and fiat accounts.',
                  icon: '🔗',
                },
                {
                  title: 'Zero-Custody',
                  description: 'We never hold, transmit, or touch your funds. Your assets remain safely with you.',
                  icon: '🛡️',
                },
                {
                  title: 'Real-Time Updates',
                  description: 'Monitor your portfolio value and market movements in real-time.',
                  icon: '⚡',
                },
                {
                  title: 'Read-Only APIs',
                  description: 'Connect accounts securely using bank-grade read-only APIs and public blockchain addresses.',
                  icon: '🔌',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-6 hover:border-[#8B5CF6]/30 transition-colors"
                  variants={itemVariants}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Technology Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="rounded-2xl border border-[#1A1A24] bg-gradient-to-br from-[#1A1A24]/40 to-[#0B0B0F]/40 backdrop-blur-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-[#8B5CF6]">Built With Modern Tech</h3>
              <div className="grid md:grid-cols-2 gap-6 text-gray-400">
                <div>
                  <p className="font-semibold text-white mb-2">Frontend Architecture</p>
                  <p className="text-sm">Next.js 16, React 19, Tailwind CSS, Framer Motion for fluid UI experiences</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Backend & Data</p>
                  <p className="text-sm">Cloud Run, Plaid API for TradFi, Web3 APIs for read-only on-chain tracking</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="mb-20"
            variants={itemVariants}
          >
            <div className="rounded-3xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-[#0B0B0F]/40 backdrop-blur-xl p-12 text-center">
              <h3 className="text-3xl font-bold mb-4">Ready to See the Big Picture?</h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join users who are already tracking their complete financial portfolio safely with Kura.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-[#8B5CF6] text-white font-semibold rounded-xl hover:bg-[#A78BFA] transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3 bg-[#1A1A24] border border-white/5 text-gray-400 font-semibold rounded-xl hover:border-white/10 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Footer Info */}
          <motion.footer
            className="pt-12 border-t border-[#1A1A24] text-center text-gray-500 text-sm"
            variants={itemVariants}
          >
            <p>© 2026 Kura Finance LLC. The Ultimate Read-Only Personal Finance Dashboard.</p>
          </motion.footer>
        </div>
      </motion.main>
    </div>
  );
}
