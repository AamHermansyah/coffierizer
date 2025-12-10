// --- TYPES ---
export type CoffeeClass = "Dark" | "Green" | "Light" | "Medium";
export type SortStatus = "queued" | "scanning" | "traveling" | "dropping" | "sorted" | "error";

export interface CoffeeImage {
  id: string;
  file: File;
  previewUrl: string;
  status: SortStatus;
  label?: CoffeeClass;
  confidence?: number;
  isError?: boolean;
}