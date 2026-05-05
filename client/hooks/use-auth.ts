"use client";

import type { ApiResponse } from "@/lib/api";
import type {
  LoginPayload,
  LoginResponse,
  OtpVerifyPayload,
  RegisterPayload,
} from "@/lib/auth-api";
import { authApi } from "@/lib/auth-api";
import { useMutationData } from "./use-mutate-data";

export function useLoginMutation(
  onSuccess?: (
    data: ApiResponse<LoginResponse>,
    variables: LoginPayload,
  ) => void,
  onError?: (error: unknown, variables: LoginPayload) => void,
) {
  return useMutationData<ApiResponse<LoginResponse>, LoginPayload>(
    ["auth", "login"],
    authApi.login,
    undefined,
    onSuccess,
    onError,
  );
}

export function useVerifyOtpMutation(
  onSuccess?: (data: ApiResponse<null>, variables: OtpVerifyPayload) => void,
  onError?: (error: unknown, variables: OtpVerifyPayload) => void,
) {
  return useMutationData<ApiResponse<null>, OtpVerifyPayload>(
    ["auth", "otp-verify"],
    authApi.verifyOtp,
    undefined,
    onSuccess,
    onError,
  );
}

export function useRegisterMutation(
  onSuccess?: (data: ApiResponse<unknown>, variables: RegisterPayload) => void,
  onError?: (error: unknown, variables: RegisterPayload) => void,
) {
  return useMutationData<ApiResponse<unknown>, RegisterPayload>(
    ["auth", "register"],
    authApi.register,
    undefined,
    onSuccess,
    onError,
  );
}

export function useResendMagicLinkMutation(
  onSuccess?: (data: ApiResponse<unknown>, variables: LoginPayload) => void,
  onError?: (error: unknown, variables: LoginPayload) => void,
) {
  return useMutationData<ApiResponse<unknown>, LoginPayload>(
    ["auth", "resend-magic-link"],
    authApi.resendMagicLink,
    undefined,
    onSuccess,
    onError,
  );
}
