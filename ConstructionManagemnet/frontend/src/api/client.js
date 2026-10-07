const API_BASE_URL = 'http://localhost:8080/api';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Request failed with status ${response.status}` };
      }
      throw new Error(errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : 'An unexpected error occurred'));
    }

    // Check if response has content
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}
