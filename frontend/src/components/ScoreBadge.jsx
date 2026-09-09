import React, { useState, useEffect, useRef } from 'react';

const COLORS = {
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  yellow: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  red: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  neutral: 'bg-slate-800/50 text-slate-300 border-slate-700'
};

export default function ScoreBadge({ status, value, tooltipMsg }) {
  const colorClass = COLORS[status] || COLORS.neutral;
  const [isVisible, setIsVisible] = useState(false);
  const badgeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (badgeRef.current && !badgeRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div 
      className={`relative inline-flex items-center justify-center px-2.5 py-1 text-sm font-medium rounded border cursor-help ${colorClass}`}
      ref={badgeRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {value}
      {tooltipMsg && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 text-xs text-slate-200 bg-slate-900 rounded shadow-lg z-20 whitespace-normal text-center transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {tooltipMsg}
        </div>
      )}
    </div>
  );
}
