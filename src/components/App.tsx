import { miniApp, useLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import React, { type FC, lazy } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

const ItemsPage = lazy(() => import("@/pages/ItemsPage/ItemsPage"));

export const App: FC = () => {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
    >
      <ConfigProvider locale={enUS}>
        <HashRouter>
          <React.Suspense>
            <Routes>
              <Route path="/" element={<ItemsPage />} />
            </Routes>
          </React.Suspense>
        </HashRouter>
      </ConfigProvider>
      <SpeedInsights />
    </AppRoot>
  );
};
