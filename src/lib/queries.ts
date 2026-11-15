import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getSettings } from "./catalog.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 60_000,
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: () => getSettings(),
  staleTime: 60_000,
});
