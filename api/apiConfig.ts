const BASE_URL = "http://172.20.10.4:5000";  //change to your ip

export const getApiUrl = (endpoint: string): string => `${BASE_URL}${endpoint}`;
