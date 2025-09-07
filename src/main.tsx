import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AddItem from "./pages/AddItem.tsx";
import ItemDetail from "./pages/ItemDetail.tsx";
import Chat from "./pages/Chat.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function PoweredByVercel() {
  if (!import.meta.env.PROD) return null;
  return (
    <a
      href="https://vercel.com/?utm_source=vly&utm_campaign=powered-by"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white"
      aria-label="Powered by Vercel"
    >
      Powered by Vercel
    </a>
  );
}

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

function Root() {
  return (
    <>
      <RouteSyncer />
      <Outlet />
      {import.meta.env.PROD && <PoweredByVercel />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/auth", element: <AuthPage redirectAfterAuth="/dashboard" /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/add-item", element: <AddItem /> },
      { path: "/item/:itemId", element: <ItemDetail /> },
      { path: "/chat/:requestId", element: <Chat /> },
      { path: "/profile", element: <Profile /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
        {/* ... rest of the code remains unchanged ... */}
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>
);