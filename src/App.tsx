import { ToastProvider } from "@heroui/toast";

import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <ToastProvider placement="top-center" />
    </>
  );
}

export default App;
