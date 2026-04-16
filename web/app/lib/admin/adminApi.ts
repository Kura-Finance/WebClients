'use client';

export class AdminApiErrorClass extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  tier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllUsersResponse {
  users: User[];
  total: number;
}

/**
 * Get all users with pagination
 */
export const getAllUsers = async (
  token: string,
  limit: number = 10,
  offset: number = 0
): Promise<GetAllUsersResponse> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`/api/admin/users?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AdminApiErrorClass(error.error || error.message || 'Failed to fetch users');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AdminApiErrorClass) {
      throw error;
    }
    console.error('Get users error:', error);
    throw new AdminApiErrorClass('An error occurred while fetching users');
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (token: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AdminApiErrorClass(error.error || error.message || 'Failed to delete user');
    }
  } catch (error) {
    if (error instanceof AdminApiErrorClass) {
      throw error;
    }
    console.error('Delete user error:', error);
    throw new AdminApiErrorClass('An error occurred while deleting the user');
  }
};

/**
 * Update user tier
 */
export const updateUserTier = async (
  token: string,
  userId: string,
  data: { tier: string }
): Promise<User> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AdminApiErrorClass(error.error || error.message || 'Failed to update user tier');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof AdminApiErrorClass) {
      throw error;
    }
    console.error('Update user tier error:', error);
    throw new AdminApiErrorClass('An error occurred while updating the user tier');
  }
};
