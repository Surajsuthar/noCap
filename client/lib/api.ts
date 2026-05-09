import { env } from "@/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: string | null;
};

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");

function formatApiDetail(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          "msg" in item &&
          typeof item.msg === "string"
        ) {
          return item.msg;
        }

        return null;
      })
      .filter(Boolean)
      .join(" ");
  }

  return null;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if (
    "message" in payload &&
    typeof payload.message === "string" &&
    payload.message
  ) {
    return payload.message;
  }

  if (
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error
  ) {
    return payload.error;
  }

  if ("detail" in payload) {
    return formatApiDetail(payload.detail) ?? fallback;
  }

  return fallback;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch<T>(
  path: string,
  { body, headers, ...options }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(getApiUrl(path), {
    ...options,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, "Something went wrong. Try again."),
      response.status,
    );
  }

  if (!payload || !("success" in payload)) {
    throw new ApiError("Unexpected server response.", response.status);
  }

  if (!payload.success) {
    throw new ApiError(
      getErrorMessage(payload, "Something went wrong. Try again."),
      response.status,
    );
  }

  return payload as ApiResponse<T>;
}

export type { ApiResponse };
