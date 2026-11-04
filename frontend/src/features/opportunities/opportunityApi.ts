import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface OpportunityItem {
  id: string;
  title: string;
  type: 'Hackathon' | 'Internship' | 'Workshop' | 'Scholarship' | 'Competition';
  organiser: string;
  description: string;
  deadline: string;
  eligibility: string;
  location?: string;
  link?: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'CLOSED' | 'ARCHIVED';
  accentColor: 'blue' | 'orange' | 'yellow' | 'pink' | 'purple';
  creator?: {
    id: string;
    fullName: string;
    role: string;
  } | null;
  createdAt: string;
}

export interface OpportunitiesListResponse {
  opportunities: OpportunityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOpportunityPayload {
  title: string;
  type: string;
  organiser: string;
  description: string;
  deadline: string;
  eligibility: string;
  location?: string;
  link?: string;
}

export const opportunityApi = {
  async getOpportunities(query: { type?: string; search?: string; upcomingOnly?: boolean } = {}): Promise<OpportunitiesListResponse> {
    const res = await apiClient.get<ApiResponse<OpportunitiesListResponse>>('/opportunities', {
      params: {
        ...query,
        upcomingOnly: query.upcomingOnly ? 'true' : undefined,
      },
    });
    return res.data.data!;
  },

  async getOpportunityById(id: string): Promise<OpportunityItem> {
    const res = await apiClient.get<ApiResponse<OpportunityItem>>(`/opportunities/${id}`);
    return res.data.data!;
  },

  async createOpportunity(payload: CreateOpportunityPayload): Promise<OpportunityItem> {
    const res = await apiClient.post<ApiResponse<OpportunityItem>>('/opportunities', payload);
    return res.data.data!;
  },

  async updateOpportunity(id: string, payload: Partial<CreateOpportunityPayload>): Promise<OpportunityItem> {
    const res = await apiClient.patch<ApiResponse<OpportunityItem>>(`/opportunities/${id}`, payload);
    return res.data.data!;
  },

  async deleteOpportunity(id: string): Promise<void> {
    await apiClient.delete(`/opportunities/${id}`);
  },
};

