import MainLayout from "@/layouts/MainLayout/MainLayout";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import { miniApp, useLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ConfigProvider, Skeleton } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import React, { type FC, lazy, useLayoutEffect } from "react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";

const ItemsPage = lazy(() => import("@/pages/ItemsPage/ItemsPage"));

export const App: FC = () => {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-prefers-color-scheme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  const router = createHashRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "items",
          element: <ItemsPage />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ]);

  return (
    <AppRoot
      appearance={isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
    >
      <ConfigProvider locale={enUS}>
        <React.Suspense
          fallback={
            <>
              <Skeleton.Title animated />
              <Skeleton.Paragraph animated />
            </>
          }
        >
          <RouterProvider router={router} />
        </React.Suspense>
      </ConfigProvider>
      <SpeedInsights />
    </AppRoot>
  );
};
