import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface FeedPostItem {
  id: string;
  title: string;
  content: string;
  category: 'ANNOUNCEMENT' | 'SOCIETY_UPDATE' | 'CAMPUS_EVENT' | 'GENERAL';
  badgeVariant: 'yellow' | 'orange' | 'blue' | 'pink' | 'purple';
  isPinned?: boolean;
  author?: {
    id: string;
    fullName: string;
    role: string;
    profileImage?: string;
  } | null;
  community?: {
    id: string;
    name: string;
    accentColor: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedListResponse {
  posts: FeedPostItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  category: string;
  communityId?: string;
}

export const feedApi = {
  async getPosts(query: { category?: string; search?: string } = {}): Promise<FeedListResponse> {
    const res = await apiClient.get<ApiResponse<FeedListResponse>>('/feed', {
      params: query,
    });
    return res.data.data!;
  },

  async createPost(payload: CreatePostPayload): Promise<FeedPostItem> {
    const res = await apiClient.post<ApiResponse<FeedPostItem>>('/feed', payload);
    return res.data.data!;
  },

  async updatePost(id: string, payload: Partial<CreatePostPayload>): Promise<FeedPostItem> {
    const res = await apiClient.patch<ApiResponse<FeedPostItem>>(`/feed/${id}`, payload);
    return res.data.data!;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/feed/${id}`);
  },
};

