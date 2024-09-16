export interface FormFields {
  name: string;
  location?: LocationEnum[];
  type?: ItemTypeEnum[];
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
