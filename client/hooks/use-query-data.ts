import {
  type QueryFunction,
  type QueryKey,
  useQuery,
} from "@tanstack/react-query";

type UseQueryDataOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
};

function isUseQueryDataOptions(
  options: boolean | UseQueryDataOptions | undefined,
): options is UseQueryDataOptions {
  return (
    typeof options === "object" && options !== null && !Array.isArray(options)
  );
}

export const useQueryData = <TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData, QueryKey>,
  options?: boolean | UseQueryDataOptions,
) => {
  const normalizedOptions: UseQueryDataOptions = isUseQueryDataOptions(options)
    ? options
    : { enabled: options };

  const { data, isPending, isFetched, refetch, isFetching, isError } =
    useQuery<TData>({
      queryKey,
      queryFn,
      enabled: normalizedOptions.enabled,
      refetchInterval: normalizedOptions.refetchInterval,
      refetchIntervalInBackground:
        normalizedOptions.refetchIntervalInBackground,
    });

  return { data, isPending, isFetched, refetch, isFetching, isError };
};
