import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface StudyCircleItem {
  id: string;
  subject: string;
  topic: string;
  course: string;
  description: string;
  schedule: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Core Exam Prep' | 'Interview Prep' | string;
  memberCount: number;
  status: string;
  creator: {
    id: string;
    fullName: string;
    college: string;
    course: string;
    academicYear: string;
    avatarUrl?: string;
  } | null;
  isCreator: boolean;
  isMember: boolean;
  createdAt: string;
}

export interface StudyCircleMember {
  id: string;
  role: 'MEMBER' | 'MODERATOR' | 'LEAD';
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    college: string;
    course: string;
    branch?: string;
    academicYear: string;
    avatarUrl?: string;
    skills?: string[];
  } | null;
}

export interface StudyCirclesListResponse {
  circles: StudyCircleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStudyCirclePayload {
  subject: string;
  topic: string;
  course?: string;
  description: string;
  schedule?: string;
  level: string;
}

export const studyCircleApi = {
  async getCircles(params: { level?: string; course?: string; search?: string; page?: number } = {}): Promise<StudyCirclesListResponse> {
    const res = await apiClient.get<ApiResponse<StudyCirclesListResponse>>('/study-circles', { params });
    return res.data.data!;
  },

  async getCircleById(id: string): Promise<StudyCircleItem> {
    const res = await apiClient.get<ApiResponse<StudyCircleItem>>(`/study-circles/${id}`);
    return res.data.data!;
  },

  async createCircle(payload: CreateStudyCirclePayload): Promise<StudyCircleItem> {
    const res = await apiClient.post<ApiResponse<StudyCircleItem>>('/study-circles', payload);
    return res.data.data!;
  },

  async updateCircle(id: string, payload: Partial<CreateStudyCirclePayload>): Promise<StudyCircleItem> {
    const res = await apiClient.patch<ApiResponse<StudyCircleItem>>(`/study-circles/${id}`, payload);
    return res.data.data!;
  },

  async deleteCircle(id: string): Promise<void> {
    await apiClient.delete(`/study-circles/${id}`);
  },

  async joinCircle(id: string): Promise<{ id: string; isMember: boolean; memberCount: number }> {
    const res = await apiClient.post<ApiResponse<{ id: string; isMember: boolean; memberCount: number }>>(`/study-circles/${id}/join`);
    return res.data.data!;
  },

  async leaveCircle(id: string): Promise<{ id: string; isMember: boolean; memberCount: number }> {
    const res = await apiClient.post<ApiResponse<{ id: string; isMember: boolean; memberCount: number }>>(`/study-circles/${id}/leave`);
    return res.data.data!;
  },

  async getMembers(id: string): Promise<StudyCircleMember[]> {
    const res = await apiClient.get<ApiResponse<StudyCircleMember[]>>(`/study-circles/${id}/members`);
    return res.data.data!;
  },
};

