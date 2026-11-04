import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface CommunityItem {
  id: string;
  name: string;
  description: string;
  category: string;
  accentColor: 'blue' | 'orange' | 'yellow' | 'pink' | 'purple';
  bannerImage?: string;
  avatarImage?: string;
  memberCount: number;
  rules?: string[];
  creator?: {
    id: string;
    fullName: string;
  };
  isMember?: boolean;
  userRole?: string | null;
  createdAt: string;
}

export interface CommunityMember {
  id: string;
  fullName: string;
  college?: string;
  course?: string;
  branch?: string;
  academicYear?: string;
  profileImage?: string;
  membershipRole: string;
  joinedAt: string;
}

export interface CommunitiesListResponse {
  communities: CommunityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommunityPayload {
  name: string;
  description: string;
  category: string;
  accentColor?: string;
  rules?: string[];
}

export const communityApi = {
  async getCommunities(query: { search?: string; category?: string } = {}): Promise<CommunitiesListResponse> {
    const res = await apiClient.get<ApiResponse<CommunitiesListResponse>>('/communities', {
      params: query,
    });
    return res.data.data!;
  },

  async getCommunityById(id: string): Promise<CommunityItem> {
    const res = await apiClient.get<ApiResponse<CommunityItem>>(`/communities/${id}`);
    return res.data.data!;
  },

  async createCommunity(payload: CreateCommunityPayload): Promise<CommunityItem> {
    const res = await apiClient.post<ApiResponse<CommunityItem>>('/communities', payload);
    return res.data.data!;
  },

  async joinCommunity(id: string): Promise<{ communityId: string; isMember: boolean }> {
    const res = await apiClient.post<ApiResponse<{ communityId: string; isMember: boolean }>>(
      `/communities/${id}/join`
    );
    return res.data.data!;
  },

  async leaveCommunity(id: string): Promise<{ communityId: string; isMember: boolean }> {
    const res = await apiClient.post<ApiResponse<{ communityId: string; isMember: boolean }>>(
      `/communities/${id}/leave`
    );
    return res.data.data!;
  },

  async getMembers(id: string): Promise<{ members: CommunityMember[]; total: number }> {
    const res = await apiClient.get<ApiResponse<{ members: CommunityMember[]; total: number }>>(
      `/communities/${id}/members`
    );
    return res.data.data!;
  },

  async uploadImage(id: string, file: File, type: 'avatar' | 'banner' = 'avatar'): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
      `/upload/community/${id}?type=${type}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data!;
  },
};

