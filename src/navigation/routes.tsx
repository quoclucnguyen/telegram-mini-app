import type { ComponentType, JSX } from "react";

import ItemsPage from "@/pages/ItemsPage/ItemsPage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  {
    path: "/items",
    Component: ItemsPage,
    title: "Items",
  },
];
