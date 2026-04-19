const base = "";

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  isLoggedIn: () => request("/api/user/isLoggedIn"),
  login: (body) =>
    request("/api/user/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) =>
    request("/api/user/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => request("/api/user/logout", { method: "POST" }),
  listGames: () => request("/api/sudoku"),
  createGame: (body) =>
    request("/api/sudoku", { method: "POST", body: JSON.stringify(body) }),
  getGame: (gameId) => request(`/api/sudoku/${gameId}`),
  updateGame: (gameId, body) =>
    request(`/api/sudoku/${gameId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteGame: (gameId) =>
    request(`/api/sudoku/${gameId}`, { method: "DELETE" }),
  listHighscores: () => request("/api/highscore"),
  postHighscore: (body) =>
    request("/api/highscore", { method: "POST", body: JSON.stringify(body) }),
  getHighscoreForGame: (gameId) => request(`/api/highscore/${gameId}`),
};
