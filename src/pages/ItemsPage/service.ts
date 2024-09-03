import { supabase } from "@/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useItemsQuery = () => {
  return useQuery({
    queryKey: ["items"],
    queryFn: () => supabase.from("item").select(),
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
    }) => {
      const res = await supabase.from("item").insert(data);
      return res.data;
    },
  });
};
