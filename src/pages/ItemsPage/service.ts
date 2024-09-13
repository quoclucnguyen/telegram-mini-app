import { supabase } from "@/supabase";
import { QueryData } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CategoryEnum } from "./interface";

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
      category: CategoryEnum;
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

export const useGetItemsMutation = (category: CategoryEnum) => {
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
          `id, name, location, bucket, path, expired_at, description, note, status, category`,
        )
        .eq("category", category)
        .or(
          `name.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,description.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,note.ilike.%${keyword?.trim().toLocaleLowerCase() ?? ""}%`,
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

export const useAteItemCategoryFoodMutation = () => {
  return useMutation({
    mutationKey: ["ateItemCategoryFood"],

    mutationFn: async (id: number) => {
      const res = await supabase
        .from("item")
        .update({ status: "ate" })
        .eq("id", id);
      return res.data;
    },
  });
};

export const useCountItemsByCategoryQuery = (
  category: CategoryEnum,
  keyword?: string,
) => {
  return useQuery({
    queryKey: ["countItemsByCategory", category, keyword],
    queryFn: async () => {
      const result = await supabase
        .from("item")
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        .or(
          `name.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,description.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,note.ilike.%${keyword?.trim().toLocaleLowerCase() ?? ""}%`,
        );

      return result.count;
    },
  });
};

export const useCountItemsByCategoryByExpiredAtQuery = (
  category: CategoryEnum,
  expiredStatus: "expired" | "good" | "today" | "soon",
  keyword?: string,
) => {
  return useQuery({
    queryKey: [
      "countItemsByCategoryByExpiredAt",
      category,
      expiredStatus,
      keyword,
    ],
    queryFn: async () => {
      const query = supabase
        .from("item")
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        .or(
          `name.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,description.ilike.%${
            keyword?.trim().toLocaleLowerCase() ?? ""
          }%,note.ilike.%${keyword?.trim().toLocaleLowerCase() ?? ""}%`,
        );

      const threeDaysLater = dayjs()
        .add(3, "day")
        .set("hour", 23)
        .set("minutes", 59)
        .set("seconds", 59);

      const today = dayjs()
        .set("hour", 23)
        .set("minutes", 59)
        .set("seconds", 59);

      switch (expiredStatus) {
        case "good": {
          query.gte("expired_at", threeDaysLater.toISOString());
          break;
        }

        case "soon": {
          query.lte("expired_at", threeDaysLater.toISOString());
          query.gte("expired_at", today.subtract(1, "day").toISOString());
          break;
        }

        case "today": {
          query.gte("expired_at", today.toISOString());
          query.lte("expired_at", today.add(1, "day").toISOString());
          break;
        }

        case "expired": {
          query.lte("expired_at", today.toISOString());
          break;
        }
      }

      const result = await query;

      return result.count;
    },
  });
};
