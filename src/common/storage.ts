import { supabase } from "@/supabase";

export const createBucket = async (name: string) => {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: false,
    allowedMimeTypes: ["image/png"],
    fileSizeLimit: 1024,
  });

  return {
    data,
    error,
  };
};

export const retrieveBucket = async (name: string) => {
  const { data, error } = await supabase.storage.getBucket(name);

  return {
    data,
    error,
  };
};

export const getBucket = async (name: string) => {
  const { data, error } = await retrieveBucket(name);

  if (error) {
    return createBucket(name);
  }

  return { data, error };
};

export const createSignedUrl = async (bucket: string, path: string) => {
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  return data?.signedUrl ?? "";
};
