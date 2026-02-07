import type { Problem, Contest, User, AuthResponse, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private static token: string | null = localStorage.getItem('auth_token');

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth methods
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  static async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  static async getProfile(): Promise<User> {
    const response = await this.request<User>('/auth/profile');
    return response.data!;
  }

  static logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    // Always check localStorage for the most current token
    const currentToken = localStorage.getItem('auth_token');
    this.token = currentToken; // Update the cached token
    return !!currentToken;
  }

  static setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  static getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Problem methods
  static async getProblems(filters?: {
    platform?: string;
    status?: string;
    isReview?: boolean;
    company?: string;
    topic?: string;
    limit?: number;
    offset?: number;
  }): Promise<Problem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Problem[]>(`/problems?${params}`);
    return response.data!;
  }

  static async createProblem(problem: Omit<Problem, '_id' | 'userId' | 'createdAt'>): Promise<Problem> {
    const response = await this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
    return response.data!;
  }

  static async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const response = await this.request<Problem>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  static async deleteProblem(id: string): Promise<void> {
    await this.request(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  static async bulkCreateProblems(problems: Partial<Problem>[]): Promise<{ created: number; skipped: number }> {
    const response = await this.request<{ created: number; skipped: number }>('/problems/bulk', {
      method: 'POST',
      body: JSON.stringify({ problems }),
    });
    return response.data!;
  }

  // Contest methods
  static async getContests(filters?: {
    platform?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Contest[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await this.request<Contest[]>(`/contests?${params}`);
    return response.data!;
  }

  static async createContest(contest: Omit<Contest, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Contest> {
    const response = await this.request<Contest>('/contests', {
      method: 'POST',
      body: JSON.stringify(contest),
    });
    return response.data!;
  }

  static async updateContest(id: string, updates: Partial<Contest>): Promise<Contest> {
    const response = await this.request<Contest>(`/contests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  static async deleteContest(id: string): Promise<void> {
    await this.request(`/contests/${id}`, {
      method: 'DELETE',
    });
  }

  // Code execution
  static async executeCppCode(code: string, input: string = '', signal?: AbortSignal): Promise<{ output: string; success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/execute-cpp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
      },
      body: JSON.stringify({ code, input }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default ApiService;
