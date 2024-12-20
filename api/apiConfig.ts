const API_BASE_URL = "http://172.20.10.4:5000";

export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;
