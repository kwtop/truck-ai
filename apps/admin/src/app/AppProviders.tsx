import { App as AntApp, ConfigProvider } from "antd";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0f766e",
            borderRadius: 6,
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
          },
          components: {
            Button: {
              controlHeight: 40
            },
            Input: {
              controlHeight: 40
            }
          }
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
