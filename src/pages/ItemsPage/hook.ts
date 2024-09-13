import { create } from "zustand";

type CategoryTabStore = {
  filter: string;
  setFilter: (filterText: string) => void;
};

export const useCategoryTabFilterStore = create<CategoryTabStore>()((set) => ({
  filter: "",

  setFilter: (filterText) => set(() => ({ filter: filterText })),
}));
