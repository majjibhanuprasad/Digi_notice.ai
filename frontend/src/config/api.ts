const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const trimmedUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const API_URL = trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
