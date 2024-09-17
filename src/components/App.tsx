import { useIntegration } from "@telegram-apps/react-router-integration";
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import React, {
  type FC,
  lazy,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { Route, Router, Routes } from "react-router-dom";

const ItemsPage = lazy(() => import("@/pages/ItemsPage/ItemsPage"));

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  // Create a new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  const navigator = useMemo(() => initNavigator("app-navigation-state"), []);
  const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-prefers-color-scheme",
      miniApp.isDark ? "dark" : "light",
    );
  }, [miniApp.isDark]);

  return (
    <AppRoot
      appearance={miniApp.isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
    >
      <ConfigProvider locale={enUS}>
        <Router location={location} navigator={reactNavigator}>
          <React.Suspense>
            <Routes>
              <Route path="*" element={<ItemsPage />} />
            </Routes>
          </React.Suspense>
        </Router>
      </ConfigProvider>
      <SpeedInsights />
    </AppRoot>
  );
};
