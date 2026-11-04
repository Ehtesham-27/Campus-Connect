import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface DiscoverQuery {
  search?: string;
  course?: string;
  branch?: string;
  academicYear?: string;
  skill?: string;
  interest?: string;
  page?: number;
  limit?: number;
}

export interface DiscoveredStudent {
  id: string;
  fullName: string;
  college: string;
  course: string;
  branch: string;
  academicYear: string;
  semester: string;
  yearOrSemester: string;
  interests: string[];
  skills: string[];
  bio: string;
  profileImage?: string;
  profileImageUrl?: string;
  createdAt: string;
}

export interface DiscoverResponse {
  students: DiscoveredStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const discoverApi = {
  async getStudents(query: DiscoverQuery = {}): Promise<DiscoverResponse> {
    const res = await apiClient.get<ApiResponse<DiscoverResponse>>('/discover/students', {
      params: query,
    });
    return res.data.data!;
  },

  async getStudentById(id: string): Promise<DiscoveredStudent> {
    const res = await apiClient.get<ApiResponse<DiscoveredStudent>>(`/discover/students/${id}`);
    return res.data.data!;
  },
};

