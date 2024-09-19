export interface FormFields {
  name: string;
  location?: LocationEnum[];
  type: ItemTypeEnum[] | undefined;
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

export enum ItemTypeEnum {
  VEGETABLE_FRUIT = "vegetable_fruit",
  FRESH_MEAT = "fresh_meat",
}

export enum LocationEnum {
  DRY = "dry",
  WET = "wet",
  REFRIGERATOR = "refrigerator",
  FREEZER = "freezer",
}

export interface ItemInterface {
  description: string | null;
  name: string;
  bucket: string | null;
  path: string | null;
  id: number;
  status: "out_date" | "ate" | null;
  location?: LocationEnum;
  note: string | null;
  expired_at: string | null;
  category: CategoryEnum | null;
  type: ItemTypeEnum | null;
}

export enum QUICK_DATE_ENUM {
  "1d" = "1d",
  "3d" = "3d",
  "1w" = "1w",
  "1m" = "1m",
  "3m" = "3m",
  "6m" = "6m",
  "1y" = "1y",
  "2y" = "2y",
}
