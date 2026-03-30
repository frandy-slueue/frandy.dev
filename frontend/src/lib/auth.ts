const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}
