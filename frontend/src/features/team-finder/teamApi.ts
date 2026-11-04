import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface TeamMember {
  id: string;
  fullName: string;
  college?: string;
  course: string;
  academicYear?: string;
  avatarUrl?: string;
}

export interface TeamRequestItem {
  id: string;
  title: string;
  context: string;
  category: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  openPositions: number;
  deadline?: string;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  creator: {
    id: string;
    fullName: string;
    college: string;
    course: string;
    academicYear: string;
    avatarUrl?: string;
  } | null;
  memberCount: number;
  isCreator: boolean;
  hasApplied: boolean;
  myApplicationStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  createdAt: string;
}

export interface TeamApplicationItem {
  id: string;
  message: string;
  skills: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  applicant: {
    id: string;
    fullName: string;
    college: string;
    course: string;
    branch?: string;
    academicYear: string;
    avatarUrl?: string;
    skills?: string[];
  } | null;
  createdAt: string;
}

export interface TeamDetailResponse extends TeamRequestItem {
  members: TeamMember[];
  applications: TeamApplicationItem[];
  myApplication?: {
    id: string;
    status: string;
    message: string;
    createdAt: string;
  } | null;
}

export interface TeamsListResponse {
  teams: TeamRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTeamPayload {
  title: string;
  context?: string;
  category: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  openPositions: number;
  deadline?: string;
}

export interface ApplyTeamPayload {
  message: string;
  skills?: string[];
}

export const teamApi = {
  async getTeams(params: { category?: string; status?: string; search?: string; skill?: string; page?: number } = {}): Promise<TeamsListResponse> {
    const res = await apiClient.get<ApiResponse<TeamsListResponse>>('/teams', { params });
    return res.data.data!;
  },

  async getTeamById(id: string): Promise<TeamDetailResponse> {
    const res = await apiClient.get<ApiResponse<TeamDetailResponse>>(`/teams/${id}`);
    return res.data.data!;
  },

  async createTeam(payload: CreateTeamPayload): Promise<TeamRequestItem> {
    const res = await apiClient.post<ApiResponse<TeamRequestItem>>('/teams', payload);
    return res.data.data!;
  },

  async updateTeam(id: string, payload: Partial<CreateTeamPayload & { status: string }>): Promise<TeamRequestItem> {
    const res = await apiClient.patch<ApiResponse<TeamRequestItem>>(`/teams/${id}`, payload);
    return res.data.data!;
  },

  async deleteTeam(id: string): Promise<void> {
    await apiClient.delete(`/teams/${id}`);
  },

  async applyToTeam(id: string, payload: ApplyTeamPayload): Promise<{ id: string; status: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string; status: string }>>(`/teams/${id}/apply`, payload);
    return res.data.data!;
  },

  async getApplications(teamId: string): Promise<TeamApplicationItem[]> {
    const res = await apiClient.get<ApiResponse<TeamApplicationItem[]>>(`/teams/${teamId}/applications`);
    return res.data.data!;
  },

  async updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{ id: string; status: string }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/teams/applications/${applicationId}`, { status });
    return res.data.data!;
  },
};

