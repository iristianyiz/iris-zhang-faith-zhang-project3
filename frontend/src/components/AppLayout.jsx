import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Navbar } from "./Navbar.jsx";

export function AppLayout() {
  const { refresh } = useAuth();

  useEffect(() => {
    function syncSession() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }
    document.addEventListener("visibilitychange", syncSession);
    window.addEventListener("focus", syncSession);
    return () => {
      document.removeEventListener("visibilitychange", syncSession);
      window.removeEventListener("focus", syncSession);
    };
  }, [refresh]);

  return (
    <>
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
    </>
  );
}
