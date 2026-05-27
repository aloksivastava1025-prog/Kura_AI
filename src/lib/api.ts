/**
 * API client for Aesthetic Blueprints frontend.
 */

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("pin_ai_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Handle API response
const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "An error occurred");
  }
  return data;
};

export const api = {
  // --- Auth ---
  login: async (credentials: any) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  loginWithGoogle: async (idToken: string, user?: any) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, user }),
    });
    return handleResponse(res);
  },

  signup: async (userData: any) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch("/api/auth/me", {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- Posts ---
  getPosts: async (params?: { contentType?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.contentType) query.append("contentType", params.contentType);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const res = await fetch(`/api/posts?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getPost: async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createPost: async (postData: any) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    });
    return handleResponse(res);
  },

  deletePost: async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  editPost: async (id: string, postData: any) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    });
    return handleResponse(res);
  },

  toggleLike: async (id: string) => {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- Comments ---
  getComments: async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`);
    return handleResponse(res);
  },

  addComment: async (postId: string, body: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ body }),
    });
    return handleResponse(res);
  },

  // --- Users ---
  getUserProfile: async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  editUserProfile: async (data: any) => {
    const res = await fetch(`/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  toggleFollow: async (id: string) => {
    const res = await fetch(`/api/users/${id}/follow`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- Upload ---
  uploadImage: async (base64Image: string) => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ image: base64Image }),
    });
    return handleResponse(res);
  },
};
