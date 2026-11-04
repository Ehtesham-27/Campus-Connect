import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  suspendedStudents: number;
  totalCommunities: number;
  totalPosts: number;
  totalOpportunities: number;
  pendingOpportunities: number;
  totalTeams: number;
  totalStudyCircles: number;
  totalReports: number;
  pendingReports: number;
}

export interface AdminOverviewResponse {
  stats: AdminStats;
  recentReports: {
    id: string;
    targetType: string;
    targetTitle: string;
    reason: string;
    reporter: string;
    createdAt: string;
  }[];
}

export interface AdminStudentItem {
  id: string;
  fullName: string;
  email: string;
  college: string;
  course: string;
  branch?: string;
  academicYear?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  role: string;
  createdAt: string;
}

export interface AdminCommunityItem {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  accentColor: string;
  creator?: { id: string; fullName: string; email: string } | null;
  createdAt: string;
}

export interface AdminFeedPostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  status: string;
  author?: { id: string; fullName: string; email: string; role: string } | null;
  createdAt: string;
}

export interface AdminOpportunityItem {
  id: string;
  title: string;
  type: string;
  organiser: string;
  deadline: string;
  eligibility: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLOSED' | 'ARCHIVED';
  creator?: { id: string; fullName: string; email: string } | null;
  createdAt: string;
}

export interface AdminReportItem {
  id: string;
  targetType: 'STUDENT' | 'POST' | 'COMMUNITY' | 'OPPORTUNITY';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes: string;
  reporter?: { id: string; fullName: string; email: string } | null;
  reviewedBy?: { id: string; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  async getOverview(): Promise<AdminOverviewResponse> {
    const res = await apiClient.get<ApiResponse<AdminOverviewResponse>>('/admin/dashboard');
    return res.data.data!;
  },

  async getStudents(params: { search?: string; status?: string; page?: number } = {}): Promise<{ students: AdminStudentItem[]; total: number }> {
    const res = await apiClient.get<ApiResponse<{ students: AdminStudentItem[]; total: number }>>('/admin/students', { params });
    return res.data.data!;
  },

  async updateStudentStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminStudentItem> {
    const res = await apiClient.patch<ApiResponse<AdminStudentItem>>(`/admin/students/${id}/status`, { status });
    return res.data.data!;
  },

  async getCommunities(params: { search?: string } = {}): Promise<AdminCommunityItem[]> {
    const res = await apiClient.get<ApiResponse<AdminCommunityItem[]>>('/admin/communities', { params });
    return res.data.data!;
  },

  async deleteCommunity(id: string): Promise<void> {
    await apiClient.delete(`/admin/communities/${id}`);
  },

  async getFeedPosts(params: { search?: string } = {}): Promise<AdminFeedPostItem[]> {
    const res = await apiClient.get<ApiResponse<AdminFeedPostItem[]>>('/admin/feed', { params });
    return res.data.data!;
  },

  async deleteFeedPost(id: string): Promise<void> {
    await apiClient.delete(`/admin/feed/${id}`);
  },

  async togglePinPost(id: string): Promise<{ id: string; isPinned: boolean }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; isPinned: boolean }>>(`/admin/feed/${id}/pin`);
    return res.data.data!;
  },

  async getOpportunities(params: { status?: string } = {}): Promise<AdminOpportunityItem[]> {
    const res = await apiClient.get<ApiResponse<AdminOpportunityItem[]>>('/admin/opportunities', { params });
    return res.data.data!;
  },

  async verifyOpportunity(id: string): Promise<{ id: string; status: string }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/admin/opportunities/${id}/verify`);
    return res.data.data!;
  },

  async deleteOpportunity(id: string): Promise<void> {
    await apiClient.delete(`/admin/opportunities/${id}`);
  },

  async getReports(params: { status?: string; targetType?: string } = {}): Promise<AdminReportItem[]> {
    const res = await apiClient.get<ApiResponse<AdminReportItem[]>>('/admin/reports', { params });
    return res.data.data!;
  },

  async updateReport(id: string, payload: { status: 'RESOLVED' | 'DISMISSED'; resolutionNotes?: string }): Promise<AdminReportItem> {
    const res = await apiClient.patch<ApiResponse<AdminReportItem>>(`/admin/reports/${id}`, payload);
    return res.data.data!;
  },

  async submitReport(payload: { targetType: string; targetId: string; targetTitle?: string; reason: string; details?: string }): Promise<{ id: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string }>>('/reports', payload);
    return res.data.data!;
  },
};

