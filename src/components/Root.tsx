import { type FC } from "react";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function ErrorBoundaryError({ error }: { readonly error: unknown }) {
  const errorString = typeof error === "string" ? error : JSON.stringify(error);

  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>{error instanceof Error ? error.message : errorString}</code>
      </blockquote>
    </div>
  );
}

const queryClient = new QueryClient();

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
