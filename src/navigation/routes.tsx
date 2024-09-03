import type { ComponentType, JSX } from "react";

import { IndexPage } from "@/pages/IndexPage/IndexPage";
import { InitDataPage } from "@/pages/InitDataPage/InitDataPage";
import { ItemsPage } from "@/pages/ItemsPage/ItemsPage";
import { LaunchParamsPage } from "@/pages/LaunchParamsPage/LaunchParamsPage";
import { ThemeParamsPage } from "@/pages/ThemeParamsPage/ThemeParamsPage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/init-data", Component: InitDataPage, title: "Init Data" },
  { path: "/theme-params", Component: ThemeParamsPage, title: "Theme Params" },
  {
    path: "/launch-params",
    Component: LaunchParamsPage,
    title: "Launch Params",
  },
  {
    path: "/items",
    Component: ItemsPage,
    title: "Items",
  },
];