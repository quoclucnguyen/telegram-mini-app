import { SDKProvider, useLaunchParams } from "@telegram-apps/sdk-react";
import { type FC } from "react";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => {
  const errorString = typeof error === "string" ? error : JSON.stringify(error);

  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>{error instanceof Error ? error.message : errorString}</code>
      </blockquote>
    </div>
  );
};

const queryClient = new QueryClient();

const Inner: FC = () => {
  const debug = useLaunchParams().startParam === "debug";

  return (
    <SDKProvider acceptCustomStyles debug={debug}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SDKProvider>
  );
};

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <Inner />
  </ErrorBoundary>
);
