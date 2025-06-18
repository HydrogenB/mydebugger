/**
 * © 2025 MyDebugger Contributors – MIT License
 */
/* eslint react/require-default-props: 0 */
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingParticleProps { delay?: number; }

function FloatingParticle({ delay = 0 }: FloatingParticleProps) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white/20 rounded-full"
      initial={{ x: `${Math.random() * 100}%`, y: '110%' }}
      animate={{ y: '-10%', x: `${Math.random() * 100}%` }}
      transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, delay, ease: 'linear' }}
    />
  );
}

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[...Array(30)].map(
        // eslint-disable-next-line react/no-array-index-key
        (_, i) => <FloatingParticle key={i} delay={i * 0.5} />
      )}

    </div>
  );
}
