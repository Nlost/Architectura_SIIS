const API_BASE = "";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Login status:", response.status);
    console.log("Login backend response:", text);
    throw new Error(text || "Login eșuat");
  }

  return text ? JSON.parse(text) : {};
}

export async function getUsers() {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Get users status:", response.status);
    console.log("Get users backend response:", text);
    throw new Error(text || "Nu s-au putut încărca utilizatorii");
  }

  return text ? JSON.parse(text) : [];
}

export async function createUser(email, password, role) {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email,
      password,
      role,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Create user status:", response.status);
    console.log("Create user backend response:", text);
    throw new Error(text || "Nu s-a putut crea utilizatorul");
  }

  return text ? JSON.parse(text) : {};
}