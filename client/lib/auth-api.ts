import { apiFetch, getApiUrl } from "@/lib/api";

type MagicLinkResponse = {
  message: string;
  magic_link?: string | null;
};

export type LoginPayload = {
  email: string;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
};

export const authApi = {
  login(payload: LoginPayload) {
    return apiFetch<MagicLinkResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return apiFetch<MagicLinkResponse>("/api/auth/signup", {
      method: "POST",
      body: payload,
    });
  },

  resendMagicLink(payload: LoginPayload) {
    return apiFetch<MagicLinkResponse>("/api/auth/resend", {
      method: "POST",
      body: payload,
    });
  },

  googleOAuthUrl() {
    return getApiUrl("/api/auth/oauth2/google");
  },
};
