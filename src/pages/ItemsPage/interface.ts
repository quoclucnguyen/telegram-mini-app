export interface FormFields {
  name: string;
  location?: ("dry" | "wet" | "refrigerator" | "freezer")[];
  description: string;
  note: string;
  expiredAt: string;
  file?: File;
}
