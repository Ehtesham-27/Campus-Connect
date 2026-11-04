import { apiClient } from '../../lib/api/client';
import type { ApiResponse } from '../../types';

export interface ConnectionPeer {
  id: string;
  fullName: string;
  college: string;
  course: string;
  branch?: string;
  academicYear: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
}

export interface AcceptedConnectionItem {
  id: string;
  connectedAt: string;
  peer: ConnectionPeer;
}

export interface AcceptedConnectionsResponse {
  connections: AcceptedConnectionItem[];
  total: number;
}

export interface ConnectionRequestItem {
  id: string;
  message: string;
  createdAt: string;
  sender?: ConnectionPeer;
  recipient?: ConnectionPeer;
}

export interface ConnectionRequestsResponse {
  incoming: ConnectionRequestItem[];
  outgoing: ConnectionRequestItem[];
  totalPending: number;
}

export interface ConnectionStatusResponse {
  status: 'CONNECTED' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'NONE';
  id?: string;
}

export const connectionApi = {
  async getAcceptedConnections(): Promise<AcceptedConnectionsResponse> {
    const res = await apiClient.get<ApiResponse<AcceptedConnectionsResponse>>('/connections');
    return res.data.data!;
  },

  async getConnectionRequests(): Promise<ConnectionRequestsResponse> {
    const res = await apiClient.get<ApiResponse<ConnectionRequestsResponse>>('/connections/requests');
    return res.data.data!;
  },

  async sendRequest(recipientId: string, message = ''): Promise<{ id: string; status: string }> {
    const res = await apiClient.post<ApiResponse<{ id: string; status: string }>>('/connections/requests', {
      recipientId,
      message,
    });
    return res.data.data!;
  },

  async acceptRequest(requestId: string): Promise<{ id: string; status: string }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/connections/requests/${requestId}/accept`);
    return res.data.data!;
  },

  async rejectRequest(requestId: string): Promise<{ id: string; status: string }> {
    const res = await apiClient.patch<ApiResponse<{ id: string; status: string }>>(`/connections/requests/${requestId}/reject`);
    return res.data.data!;
  },

  async cancelRequest(requestId: string): Promise<void> {
    await apiClient.delete(`/connections/requests/${requestId}`);
  },

  async removeConnection(connectionIdOrPeerId: string): Promise<void> {
    await apiClient.delete(`/connections/${connectionIdOrPeerId}`);
  },

  async getConnectionStatus(targetUserId: string): Promise<ConnectionStatusResponse> {
    const res = await apiClient.get<ApiResponse<ConnectionStatusResponse>>(`/connections/status/${targetUserId}`);
    return res.data.data!;
  },
};

