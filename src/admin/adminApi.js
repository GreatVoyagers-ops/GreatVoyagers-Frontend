import { api } from "../lib/api";

export const getSession = () => api("/auth/me");
export const login = (email, password) => api("/auth/login", { method: "POST", body: { email, password } });
export const logout = () => api("/auth/logout", { method: "POST" });

export const listPosts = () => api("/admin/posts");
export const getPost = (id) => api(`/admin/posts/${id}`);
export const createPost = (post) => api("/admin/posts", { method: "POST", body: post });
export const updatePost = (id, post) => api(`/admin/posts/${id}`, { method: "PUT", body: post });
export const deletePost = (id) => api(`/admin/posts/${id}`, { method: "DELETE" });
