import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";

export function AppLayout() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
