const API_BASE = '/.netlify/functions/apex27';

async function apiFetch(path, options = {}) {
  const { method = 'GET', body, ...rest } = options;

  const fetchOptions = {
    method,
    ...rest,
  };

  let url = `${API_BASE}?path=${encodeURIComponent(path)}`;

  // Add query params to URL if they exist
  if (options.params) {
    const queryParams = new URLSearchParams(options.params);
    url += '&' + queryParams.toString();
  }

  // Handle body
  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
      // FormData will set Content-Type header automatically
    } else if (typeof body === 'object') {
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };
      fetchOptions.body = JSON.stringify(body);
    } else {
      fetchOptions.body = body;
    }
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  // Always try JSON first — Apex27 returns JSON regardless of what the
  // Content-Type header says (e.g. global-search may return text/plain).
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const searchListings = async (searchTerm) => {
  // Use global search endpoint — the /listings endpoint has no free-text search
  const result = await apiFetch('/global-search', {
    params: {
      term: searchTerm,
      searchListings: 1,
    },
  });
  // Filter to listing-type results only
  return (result.results || []).filter((r) => r.type === 'listing');
};

export const getListing = async (id) => {
  return apiFetch(`/listings/${id}`);
};

export const getListingRooms = async (listingId) => {
  return apiFetch(`/listings/${listingId}/rooms`);
};

export const getTenancy = async (listingId) => {
  const response = await apiFetch('/tenancies', {
    params: { listingId, activeOnly: 1 },
  });
  // Return first result or empty object
  if (Array.isArray(response) && response.length > 0) {
    return response[0];
  }
  return null;
};

export const getInspections = async (params = {}) => {
  return apiFetch('/inspections', { params });
};

export const createInspection = async (listingId, data) => {
  return apiFetch(`/listings/${listingId}/inspections`, {
    method: 'POST',
    body: data,
  });
};

export const updateInspection = async (listingId, inspectionId, data) => {
  return apiFetch(`/listings/${listingId}/inspections/${inspectionId}`, {
    method: 'PUT',
    body: data,
  });
};

export const uploadInspectionMedia = async (listingId, inspectionId, file) => {
  const formData = new FormData();

  // If it's a data URL, convert to blob
  if (typeof file === 'string' && file.startsWith('data:')) {
    const [header, data] = file.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    formData.append('media', blob, `photo-${Date.now()}.jpg`);
  } else {
    formData.append('media', file);
  }

  return apiFetch(`/listings/${listingId}/inspections/${inspectionId}/media`, {
    method: 'POST',
    body: formData,
  });
};

export const createIssue = async (listingId, data) => {
  return apiFetch(`/listings/${listingId}/issues`, {
    method: 'POST',
    body: data,
  });
};

export const uploadIssueMedia = async (listingId, issueId, file) => {
  const formData = new FormData();

  // If it's a data URL, convert to blob
  if (typeof file === 'string' && file.startsWith('data:')) {
    const [header, data] = file.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    formData.append('media', blob, `photo-${Date.now()}.jpg`);
  } else {
    formData.append('media', file);
  }

  return apiFetch(`/listings/${listingId}/issues/${issueId}/media`, {
    method: 'POST',
    body: formData,
  });
};

export const sendNotification = async (data) => {
  return apiFetch('/notifications', {
    method: 'POST',
    body: data,
  });
};
