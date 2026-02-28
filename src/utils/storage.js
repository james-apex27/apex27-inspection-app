const DRAFT_KEY = 'inspection_draft';
const AGENT_NAME_KEY = 'agent_name';

export const saveDraft = (inspection) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(inspection));
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
};

export const loadDraft = () => {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (e) {
    console.error('Failed to load draft:', e);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error('Failed to clear draft:', e);
  }
};

export const saveAgentName = (name) => {
  try {
    localStorage.setItem(AGENT_NAME_KEY, name);
  } catch (e) {
    console.error('Failed to save agent name:', e);
  }
};

export const loadAgentName = () => {
  try {
    return localStorage.getItem(AGENT_NAME_KEY) || '';
  } catch (e) {
    console.error('Failed to load agent name:', e);
    return '';
  }
};
