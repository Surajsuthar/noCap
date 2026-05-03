import {
  MutationKey,
  MutationFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type MutationResponse = {
  status?: number;
  data?: string;
  error?: {
    message?: string;
  };
};

export const useMutationData = <TData = MutationResponse, TVariables = unknown>(
  mutationKey: MutationKey,
  mutationFn: MutationFunction<TData, TVariables>,
  queryKey?: string,
  onSuccess?: (data: TData, variables: TVariables) => void,
  onError?: (error: unknown, variables: TVariables) => void,
) => {
  const client = useQueryClient();
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess(data, variables) {
      onSuccess?.(data, variables);

      const response = data as MutationResponse;
      const isSuccess =
        typeof response?.status === "number"
          ? response.status >= 200 && response.status < 300
          : true;

      return toast(isSuccess ? "Success" : "Error", {
        description:
          response?.data ??
          response?.error?.message ??
          (isSuccess ? "Request completed successfully." : "Request failed."),
      });
    },
    onError(error, variables) {
      onError?.(error, variables);

      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      return toast("Error", {
        description: message,
      });
    },
    onSettled: async () => {
      if (!queryKey) return;
      return await client.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return { mutate, mutateAsync, isPending, error };
};
