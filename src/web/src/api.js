const API_BASE =
  "";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Login status:", response.status);
    console.log("Login backend response:", text);
    throw new Error(text || "Login eșuat");
  }

  return text ? JSON.parse(text) : {};
}

export async function createUser(email, password, role) {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password, role }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Create user status:", response.status);
    console.log("Create user backend response:", text);
    throw new Error(text || "Nu s-a putut crea utilizatorul");
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

export async function getPatients() {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/patients`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Get patients status:", response.status);
    console.log("Get patients backend response:", text);
    throw new Error(text || "Nu s-au putut încărca pacienții");
  }

  return text ? JSON.parse(text) : [];
}

export async function createPatient(demographics) {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      demographics,
      password: "Senior123!",
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Create patient status:", response.status);
    console.log("Create patient backend response:", text);
    throw new Error(text || "Nu s-a putut crea pacientul");
  }

  return text ? JSON.parse(text) : {};
}

export async function updateUser(id, role) {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Nu s-a putut actualiza utilizatorul");
  }

  return text ? JSON.parse(text) : {};
}

export async function toggleUserActive(id, active) {
  const token = localStorage.getItem("sw_token");

  const response = await fetch(`${API_BASE}/api/users/${id}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ active }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Nu s-a putut schimba statusul utilizatorului");
  }

  return text ? JSON.parse(text) : {};
}