import { supabase } from "@/supabase";
import { QueryData } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useItemsQuery = (take = 5, offset = 0) => {
  return useQuery({
    queryKey: ["items", take, offset],
    queryFn: async () => {
      const itemsQuery = supabase
        .from("item")
        .select(
          `id, name, location, bucket, path, expired_at, description, note, status`,
        )
        .order("expired_at", { ascending: true })
        .range(offset, offset + take - 1);
      type Item = QueryData<typeof itemsQuery>;

      const { data, error } = await itemsQuery;

      if (error) throw error;

      const items: Item = data;

      return items;
    },
  });
};

export const useCreateItemMutation = () => {
  return useMutation({
    mutationKey: ["createItem"],
    mutationFn: async (data: {
      name: string;
      location: "dry" | "wet" | "refrigerator" | "freezer";
      description?: string;
      note?: string;
      bucket?: string;
      path?: string;
      expired_at?: string;
    }) => {
      const res = await supabase.from("item").insert(data);
      return res.data;
    },
  });
};

export const useDeleteItemMutation = () => {
  return useMutation({
    mutationKey: ["deleteItem"],
    mutationFn: async (id: number) => {
      const res = await supabase.from("item").delete().eq("id", id);
      return res.data;
    },
  });
};

export const useGetItemsMutation = () => {
  return useMutation({
    mutationKey: ["items"],

    mutationFn: async ({
      take,
      offset,
      keyword,
    }: {
      take: number;
      offset: number;
      keyword?: string;
    }) => {
      const itemsQuery = supabase
        .from("item")
        .select(
          `id, name, location, bucket, path, expired_at, description, note, status`,
        )
        .or(
          `name.ilike.%${
            keyword?.toLocaleLowerCase() ?? ""
          }%,description.ilike.%${keyword ?? ""}%,note.ilike.%${
            keyword ?? ""
          }%`,
        )
        .order("expired_at", { ascending: true })
        .range(offset, offset + take - 1);
      type Item = QueryData<typeof itemsQuery>;

      const { data, error } = await itemsQuery;

      if (error) throw error;

      const items: Item = data;

      return items;
    },
  });
};
