import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { ConditionSelector } from '../components/ConditionSelector.jsx';
import { PhotoCapture } from '../components/PhotoCapture.jsx';
import { useInspection } from '../context/InspectionContext.jsx';
import { ChevronRight, ChevronDown, Plus, X } from 'lucide-react';

export function RoomWalkthrough() {
  const navigate = useNavigate();
  const { state, setStep, updateRoom, addRoom, removeRoom } = useInspection();
  const [expandedRooms, setExpandedRooms] = useState(new Set([state.rooms[0]?.id]));
  const [newRoomName, setNewRoomName] = useState('');
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const toggleRoom = (roomId) => {
    const newSet = new Set(expandedRooms);
    if (newSet.has(roomId)) {
      newSet.delete(roomId);
    } else {
      newSet.add(roomId);
    }
    setExpandedRooms(newSet);
  };

  const handleAddRoom = () => {
    if (newRoomName.trim()) {
      addRoom(newRoomName);
      setNewRoomName('');
      setShowNewRoomInput(false);
    }
  };

  const handleNext = () => {
    const allAssessed = state.rooms.every(room => room.condition);
    if (!allAssessed) {
      alert('Please assess all rooms before continuing');
      return;
    }
    setStep(4);
    navigate('/inspection/utilities');
  };

  const completedRooms = state.rooms.filter(r => r.condition).length;
  const totalRooms = state.rooms.length;

  const getConditionColor = (condition) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      na: 'bg-gray-100 text-gray-800',
    };
    return colors[condition] || '';
  };

  const getConditionLabel = (condition) => {
    const labels = {
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      na: 'N/A',
    };
    return labels[condition] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header
        title="Room Walkthrough"
        onBack={() => navigate('/inspection/details')}
      />
      <ProgressBar currentStep={3} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Progress */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-blue-900">
            {completedRooms} of {totalRooms} rooms assessed
          </p>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${totalRooms ? (completedRooms / totalRooms) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          {state.rooms.map((room) => {
            const isExpanded = expandedRooms.has(room.id);
            return (
              <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => toggleRoom(room.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{room.name}</h3>
                    {room.condition && (
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-1 ${getConditionColor(room.condition)}`}>
                        {getConditionLabel(room.condition)}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                    {/* Condition selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Condition
                      </label>
                      <ConditionSelector
                        value={room.condition}
                        onChange={(condition) => updateRoom(room.id, { condition })}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={room.notes}
                        onChange={(e) => updateRoom(room.id, { notes: e.target.value })}
                        placeholder="Any issues or observations..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none text-sm"
                      />
                    </div>

                    {/* Photos */}
                    <PhotoCapture
                      photos={room.photos}
                      onChange={(photos) => updateRoom(room.id, { photos })}
                    />

                    {/* Remove button (only for custom rooms) */}
                    {room.id.startsWith('custom-') && (
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="w-full bg-red-50 text-red-700 font-semibold py-2 px-4 rounded-lg active:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Remove Area
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Area */}
        {!showNewRoomInput && (
          <button
            onClick={() => setShowNewRoomInput(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-lg active:border-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Area
          </button>
        )}

        {showNewRoomInput && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="e.g. Garden, Patio, Exterior"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddRoom}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg active:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewRoomInput(false);
                  setNewRoomName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg active:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
