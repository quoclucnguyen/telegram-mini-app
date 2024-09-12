export interface FormFields {
  name: string;
  location?: ("dry" | "wet" | "refrigerator" | "freezer")[];
  description: string;
  note: string;
  expiredAt: string;
  file?: File;
}

export enum CategoryEnum {
  FOODS = "foods",
  COSMETICS = "cosmetics",
  OTHERS = "others",
}

export interface ItemInterface {
  description: string | null;
  name: string;
  bucket: string | null;
  path: string | null;
  id: number;
  status: "out_date" | "ate" | null;
  location?: "dry" | "wet" | "refrigerator" | "freezer";
  note: string | null;
  expired_at: string | null;
  category: CategoryEnum | null;
}
