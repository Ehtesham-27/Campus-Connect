/**
 * Core type definitions for Campus Connect
 */

export type UserRole = 'STUDENT' | 'ADMIN' | 'student' | 'admin';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  college?: string;
  course?: string;
  branch?: string;
  academicYear?: string;
  semester?: string;
  yearOrSemester?: string;
  bio?: string;
  profileImage?: string;
  profileImageUrl?: string;
  interests?: string[];
  skills?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}
