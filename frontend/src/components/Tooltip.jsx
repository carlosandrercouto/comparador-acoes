import React from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ message, children }) {
  return (
    <div className="relative group inline-flex items-center">
      {children}
      {message && (
        <Info className="w-4 h-4 ml-1.5 text-slate-400 cursor-help" />
      )}
      {message && (
        <div className="absolute bottom-full left-0 mb-2 w-max max-w-xs px-3 py-2 text-sm font-medium text-slate-100 bg-slate-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {message}
          <div className="tooltip-arrow absolute -bottom-1 left-4 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
}
