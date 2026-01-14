import apiClient from "./axios";
import { LoginRequest, LoginResponse, LogoutResponse } from "@/types/auth";
import {
  RuasListResponse,
  RuasDetailResponse,
  RuasFormData,
} from "@/types/ruas";
import { UnitResponse } from "@/types/unit";

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/login", data);
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/logout");
    return response.data;
  },
};

// Ruas APIs
export const ruasApi = {
  getAll: async (
    page: number = 1,
    perPage: number = 10
  ): Promise<RuasListResponse> => {
    const response = await apiClient.get<RuasListResponse>(
      `/ruas?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  getOne: async (id: number): Promise<RuasDetailResponse> => {
    const response = await apiClient.get<RuasDetailResponse>(`/ruas/${id}`);
    return response.data;
  },

  create: async (data: RuasFormData): Promise<any> => {
    const response = await apiClient.post("/ruas", data);
    return response.data;
  },

  update: async (id: number, data: RuasFormData): Promise<any> => {
    const formData = { ...data, _method: "PUT" };
    const response = await apiClient.post(`/ruas/${id}`, formData);
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/ruas/${id}`);
    return response.data;
  },
};

// Unit APIs
export const unitApi = {
  getAll: async (): Promise<UnitResponse> => {
    const response = await apiClient.get<UnitResponse>("/unit");
    return response.data;
  },
};
