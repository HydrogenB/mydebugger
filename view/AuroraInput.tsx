/**
 * © 2025 MyDebugger Contributors – MIT License
 */
/* eslint react/require-default-props: 0 */
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function AuroraInput({ label, name, value, onChange, placeholder, icon }: Props) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={name} className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
          autoComplete="off"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}
AuroraInput.defaultProps = { placeholder: "", icon: null };
