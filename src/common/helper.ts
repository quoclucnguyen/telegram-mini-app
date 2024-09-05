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

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  console.log(seconds);
  console.log(hours);
  console.log(minutes);
  console.log(secs);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
};
