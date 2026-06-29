import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import { useAuthInit } from "@/hooks/useAuth";

export function App() {
  useAuthInit();

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
