import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { GamesPage } from "./pages/GamesPage.jsx";
import { GamePage } from "./pages/GamePage.jsx";
import { RulesPage } from "./pages/RulesPage.jsx";
import { ScoresPage } from "./pages/ScoresPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
