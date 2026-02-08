import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { LoginRequest, RegisterRequest, CreateProblemRequest, UpdateProblemRequest, BulkCreateProblemsRequest, CreateContestRequest, UpdateContestRequest } from '../../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser'
};

const mockToken = 'mock-jwt-token';

const mockProblems = [
  {
    _id: 'problem-1',
    userId: 'user-123',
    platform: 'leetcode',
    title: 'Two Sum',
    problemId: 'two-sum',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum/',
    dateSolved: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    notes: 'Hash table solution',
    isReview: false,
    repetition: 0,
    interval: 0,
    nextReviewDate: null,
    topics: ['Array', 'Hash Table'],
    status: 'active',
    companies: ['Google']
  },
  {
    _id: 'problem-2',
    userId: 'user-123',
    platform: 'codeforces',
    title: 'A+B Problem',
    problemId: 'a-plus-b',
    difficulty: '800',
    url: 'https://codeforces.com/problem/1/A',
    dateSolved: '2024-01-02T00:00:00.000Z',
    createdAt: '2024-01-02T00:00:00.000Z',
    notes: 'Simple addition',
    isReview: true,
    repetition: 1,
    interval: 2,
    nextReviewDate: '2024-01-04T00:00:00.000Z',
    topics: ['Math'],
    status: 'active',
    companies: []
  }
];

const mockContests = [
  {
    _id: 'contest-1',
    userId: 'user-123',
    name: 'Weekly Contest 123',
    platform: 'leetcode',
    startTime: '2024-01-07T10:30:00.000Z',
    duration: 90,
    url: 'https://leetcode.com/contest/weekly-contest-123/',
    status: 'scheduled',
    problemsSolved: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    return HttpResponse.json({
      success: true,
      data: {
        token: mockToken,
        user: { ...mockUser, email: body.email, username: body.username }
      },
      message: 'User registered successfully'
    }, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as LoginRequest;
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          token: mockToken,
          user: mockUser
        },
        message: 'Login successful'
      });
    }
    return HttpResponse.json({
      success: false,
      error: 'Invalid credentials'
    }, { status: 401 });
  }),

  http.get(`${API_BASE_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader === `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: true,
        data: {
          ...mockUser,
          settings: {
            reviewIntervals: [2, 4, 7],
            theme: 'system',
            timezone: 'UTC'
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      });
    }
    return HttpResponse.json({
      success: false,
      error: 'Access token required'
    }, { status: 401 });
  }),

  // Problems endpoints
  http.get(`${API_BASE_URL}/problems`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const platform = url.searchParams.get('platform');
    const status = url.searchParams.get('status');

    let filteredProblems = [...mockProblems];
    if (platform) {
      filteredProblems = filteredProblems.filter(p => p.platform === platform);
    }
    if (status) {
      filteredProblems = filteredProblems.filter(p => p.status === status);
    }

    return HttpResponse.json({
      success: true,
      data: filteredProblems
    });
  }),

  http.post(`${API_BASE_URL}/problems`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const body = await request.json() as CreateProblemRequest;
    const newProblem = {
      _id: 'problem-new',
      userId: 'user-123',
      ...body,
      createdAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newProblem,
      message: 'Problem created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/problems/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const body = await request.json() as UpdateProblemRequest;
    const problemId = params.id as string;
    const existingProblem = mockProblems.find(p => p._id === problemId);

    if (!existingProblem) {
      return HttpResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    const updatedProblem = { ...existingProblem, ...body };
    return HttpResponse.json({
      success: true,
      data: updatedProblem,
      message: 'Problem updated successfully'
    });
  }),

  http.delete(`${API_BASE_URL}/problems/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const problemId = params.id as string;
    const existingProblem = mockProblems.find(p => p._id === problemId);

    if (!existingProblem) {
      return HttpResponse.json({
        success: false,
        error: 'Problem not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  }),

  // Bulk operations
  http.post(`${API_BASE_URL}/problems/bulk`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const { problems } = await request.json() as BulkCreateProblemsRequest;
    return HttpResponse.json({
      success: true,
      data: { created: problems.length, skipped: 0 },
      message: `${problems.length} problems created successfully`
    }, { status: 201 });
  }),

  // Contests endpoints
  http.get(`${API_BASE_URL}/contests`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: mockContests
    });
  }),

  http.post(`${API_BASE_URL}/contests`, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const body = await request.json() as CreateContestRequest;
    const newContest = {
      _id: 'contest-new',
      userId: 'user-123',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newContest,
      message: 'Contest created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/contests/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const body = await request.json() as UpdateContestRequest;
    const contestId = params.id as string;
    const existingContest = mockContests.find(c => c._id === contestId);

    if (!existingContest) {
      return HttpResponse.json({
        success: false,
        error: 'Contest not found'
      }, { status: 404 });
    }

    const updatedContest = { ...existingContest, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({
      success: true,
      data: updatedContest,
      message: 'Contest updated successfully'
    });
  }),

  http.delete(`${API_BASE_URL}/contests/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${mockToken}`) {
      return HttpResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 401 });
    }

    const contestId = params.id as string;
    const existingContest = mockContests.find(c => c._id === contestId);

    if (!existingContest) {
      return HttpResponse.json({
        success: false,
        error: 'Contest not found'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: 'Contest deleted successfully'
    });
  }),

  // Health check
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({
      success: true,
      message: 'LeetCode CF Tracker API is running',
      timestamp: new Date().toISOString()
    });
  })
];

export const server = setupServer(...handlers);
