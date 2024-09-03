import { supabase } from "@/supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (file: File, bucket: string, path: string) => {
  const fileExt = file.name.split(".").pop();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${path}/${uuidv4()}.${fileExt}`, file, {
      upsert: false,
    });

  if (data?.id) {
    return {
      bucket: bucket,
      path: data.path,
      id: data.id,
    };
  }

  throw new Error(error?.message);
};
