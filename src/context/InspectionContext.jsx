import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveDraft, loadDraft, loadAgentName } from '../utils/storage.js';

const InspectionContext = createContext();

const initialState = {
  step: 1,
  listing: null,
  tenancy: null,
  details: {
    agentName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionType: 'routine',
    notes: '',
    notifyTenants: false,
  },
  rooms: [],
  utilities: {
    gas: { reading: '', photo: null },
    electric: { reading: '', photo: null },
    water: { reading: '', photo: null },
    smokeAlarm: null,
    coAlarm: null,
    keysPresent: '',
  },
  issues: [],
  submitted: false,
  submissionResult: null,
};

function inspectionReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'SET_LISTING':
      return {
        ...state,
        listing: action.payload,
        rooms: action.payload?.rooms ? action.payload.rooms.map(room => ({
          id: room.id,
          name: room.name,
          condition: null,
          notes: '',
          photos: [],
        })) : [],
      };

    case 'SET_TENANCY':
      return { ...state, tenancy: action.payload };

    case 'SET_DETAILS':
      return { ...state, details: { ...state.details, ...action.payload } };

    case 'UPDATE_ROOM': {
      const { roomId, updates } = action.payload;
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === roomId ? { ...room, ...updates } : room
        ),
      };
    }

    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [
          ...state.rooms,
          {
            id: `custom-${Date.now()}`,
            name: action.payload,
            condition: null,
            notes: '',
            photos: [],
          },
        ],
      };

    case 'REMOVE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
      };

    case 'SET_UTILITIES':
      return { ...state, utilities: { ...state.utilities, ...action.payload } };

    case 'ADD_ISSUE':
      return {
        ...state,
        issues: [
          ...state.issues,
          {
            id: `issue-${Date.now()}`,
            room: '',
            description: '',
            priority: 'medium',
            photos: [],
          },
        ],
      };

    case 'UPDATE_ISSUE': {
      const { issueId, updates } = action.payload;
      return {
        ...state,
        issues: state.issues.map(issue =>
          issue.id === issueId ? { ...issue, ...updates } : issue
        ),
      };
    }

    case 'REMOVE_ISSUE':
      return {
        ...state,
        issues: state.issues.filter(issue => issue.id !== action.payload),
      };

    case 'SET_SUBMITTED':
      return { ...state, submitted: true, submissionResult: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function InspectionProvider({ children }) {
  const [state, dispatch] = useReducer(inspectionReducer, initialState);

  // Load agent name on mount
  useEffect(() => {
    const agentName = loadAgentName();
    if (agentName) {
      dispatch({ type: 'SET_DETAILS', payload: { agentName } });
    }
  }, []);

  // Auto-save draft on state changes
  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const value = {
    state,
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    setListing: (listing) => dispatch({ type: 'SET_LISTING', payload: listing }),
    setTenancy: (tenancy) => dispatch({ type: 'SET_TENANCY', payload: tenancy }),
    setDetails: (details) => dispatch({ type: 'SET_DETAILS', payload: details }),
    updateRoom: (roomId, updates) =>
      dispatch({ type: 'UPDATE_ROOM', payload: { roomId, updates } }),
    addRoom: (name) => dispatch({ type: 'ADD_ROOM', payload: name }),
    removeRoom: (roomId) => dispatch({ type: 'REMOVE_ROOM', payload: roomId }),
    setUtilities: (utilities) =>
      dispatch({ type: 'SET_UTILITIES', payload: utilities }),
    addIssue: () => dispatch({ type: 'ADD_ISSUE' }),
    updateIssue: (issueId, updates) =>
      dispatch({ type: 'UPDATE_ISSUE', payload: { issueId, updates } }),
    removeIssue: (issueId) =>
      dispatch({ type: 'REMOVE_ISSUE', payload: issueId }),
    setSubmitted: (result) => dispatch({ type: 'SET_SUBMITTED', payload: result }),
    resetInspection: () => dispatch({ type: 'RESET' }),
  };

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within InspectionProvider');
  }
  return context;
}
