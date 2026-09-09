import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

export default function Tooltip({ message, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
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
      className="relative inline-flex items-center cursor-help"
      ref={tooltipRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}
      {message && (
        <Info className="w-4 h-4 ml-1.5 text-slate-400" />
      )}
      {message && (
        <div className={`absolute bottom-full left-0 mb-2 w-max max-w-xs px-3 py-2 text-sm font-medium text-slate-100 bg-slate-800 rounded-lg shadow-sm transition-opacity z-10 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {message}
          <div className="absolute -bottom-1 left-4 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
}
