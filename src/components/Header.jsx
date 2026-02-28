import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export function Header({ title, onBack }) {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
      {onBack ? (
        <button
          onClick={onBack}
          className="p-2 -ml-2 flex items-center justify-center active:bg-blue-800 rounded transition-colors"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>
      ) : (
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 flex items-center justify-center active:bg-blue-800 rounded transition-colors"
          aria-label="Home"
        >
          <Home size={24} />
        </button>
      )}

      <div className="flex-1">
        <img src="/logo.svg" alt="Logo" className="h-10" />
      </div>

      {title && (
        <div className="text-right">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      )}
    </header>
  );
}
