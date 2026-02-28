import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { searchListings, getListing, getListingRooms, getTenancy } from '../utils/api.js';
import { Search, AlertCircle, Loader } from 'lucide-react';

export function PropertySearch() {
  const navigate = useNavigate();
  const { setStep, setListing, setTenancy } = useInspection();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (term.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const listings = await searchListings(term);
        setResults(Array.isArray(listings) ? listings : []);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search properties');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelectProperty = async (searchResult) => {
    try {
      setLoading(true);
      // Fetch full listing, rooms and tenancy in parallel
      const [fullListing, rooms, tenancy] = await Promise.all([
        getListing(searchResult.id),
        getListingRooms(searchResult.id),
        getTenancy(searchResult.id),
      ]);

      setListing({ ...fullListing, rooms: Array.isArray(rooms) ? rooms : [] });
      if (tenancy) setTenancy(tenancy);
      setStep(2);
      navigate('/inspection/details');
    } catch (err) {
      console.error('Failed to load property details:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Select Property"
        onBack={() => navigate('/')}
      />
      <ProgressBar currentStep={1} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by address or reference..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Hint */}
        {searchTerm.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            Minimum 3 characters to search
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader className="animate-spin text-blue-600" size={20} />
            <span className="text-gray-600">Searching...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectProperty(result)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-400 active:bg-blue-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{result.text}</h3>
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag.text}
                      </span>
                    ))}
                  </div>
                )}
                {result.branchName && (
                  <p className="text-xs text-gray-500 mt-1">{result.branchName}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searchTerm.length >= 3 && results.length === 0 && !error && (
          <div className="bg-white rounded-lg p-8 text-center">
            <Search className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}
