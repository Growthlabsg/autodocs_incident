// lib/api/client.ts
// API Client for Backend Communication

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.client.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.client.post('/auth/logout', { refreshToken });
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Incidents
  async getIncidents(params?: { status?: string; severity?: string; limit?: number; offset?: number }) {
    return this.client.get('/incidents', { params });
  }

  async getIncident(id: string) {
    return this.client.get(`/incidents/${id}`);
  }

  async createIncident(data: any) {
    return this.client.post('/incidents', data);
  }

  async updateIncident(id: string, data: any) {
    return this.client.put(`/incidents/${id}`, data);
  }

  async deleteIncident(id: string) {
    return this.client.delete(`/incidents/${id}`);
  }

  async addIncidentUpdate(id: string, message: string, statusChange?: string) {
    return this.client.post(`/incidents/${id}/updates`, { message, statusChange });
  }

  async getIncidentStats() {
    return this.client.get('/incidents/stats/summary');
  }

  // On-call
  async getCurrentOnCall() {
    return this.client.get('/oncall/current');
  }

  async getSchedules() {
    return this.client.get('/oncall/schedules');
  }

  async getScheduleShifts(scheduleId: string) {
    return this.client.get(`/oncall/schedules/${scheduleId}/shifts`);
  }

  async createShift(data: any) {
    return this.client.post('/oncall/shifts', data);
  }

  // Services
  async getServices() {
    return this.client.get('/services');
  }

  async getService(id: string) {
    return this.client.get(`/services/${id}`);
  }

  async createService(data: any) {
    return this.client.post('/services', data);
  }

  async updateService(id: string, data: any) {
    return this.client.put(`/services/${id}`, data);
  }

  // Status Pages
  async getStatusPages() {
    return this.client.get('/status-pages');
  }

  async createStatusPage(data: any) {
    return this.client.post('/status-pages', data);
  }

  // Post-mortems
  async getPostmortems() {
    return this.client.get('/postmortems');
  }

  async createPostmortem(data: any) {
    return this.client.post('/postmortems', data);
  }

  // Documentation
  async getProjects() {
    return this.client.get('/documentation/projects');
  }

  async getProjectPages(projectId: string) {
    return this.client.get(`/documentation/projects/${projectId}/pages`);
  }

  async createPage(data: any) {
    return this.client.post('/documentation/pages', data);
  }

  // Analytics
  async getPageViews() {
    return this.client.get('/analytics/page-views');
  }

  async getSearches() {
    return this.client.get('/analytics/searches');
  }

  // Teams
  async getTeams() {
    return this.client.get('/teams');
  }

  async getTeamMembers(teamId: string) {
    return this.client.get(`/teams/${teamId}/members`);
  }

  async createTeam(data: any) {
    return this.client.post('/teams', data);
  }

  // Users
  async getUsers() {
    return this.client.get('/users');
  }

  async getUser(id: string) {
    return this.client.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.client.put(`/users/${id}`, data);
  }
}

export const api = new APIClient();
export default api;
