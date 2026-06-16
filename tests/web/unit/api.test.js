import {
  loginUser,
  getPatients,
  logoutUser,
  createUser,
} from "../../../src/web/src/api";

function mockFetchOnce({ ok = true, status = 200, body = "" } = {}) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("api.loginUser", () => {
  test("apeleaza POST /api/auth/login si returneaza payload-ul parsat", async () => {
    mockFetchOnce({
      ok: true,
      body: { token: "jwt-abc", role: "MEDIC", email: "doc@example.com" },
    });

    const result = await loginUser("doc@example.com", "secret");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      email: "doc@example.com",
      password: "secret",
    });

    expect(result).toEqual({
      token: "jwt-abc",
      role: "MEDIC",
      email: "doc@example.com",
    });
  });

  test("arunca eroare cu mesajul backend-ului la status 4xx/5xx", async () => {
    mockFetchOnce({ ok: false, status: 401, body: "Credentiale invalide" });

    await expect(loginUser("x@y", "bad")).rejects.toThrow("Credentiale invalide");
  });

  test("intoarce obiect gol cand backend-ul nu trimite body", async () => {
    mockFetchOnce({ ok: true, body: "" });
    const result = await loginUser("a@b", "x");
    expect(result).toEqual({});
  });
});

describe("api.getPatients", () => {
  test("trimite Authorization Bearer cu token-ul din localStorage", async () => {
    localStorage.setItem("sw_token", "jwt-token-xyz");
    mockFetchOnce({ ok: true, body: [] });

    await getPatients();

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/patients");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer jwt-token-xyz");
  });

  test("arunca eroare cand backend-ul intoarce non-2xx", async () => {
    localStorage.setItem("sw_token", "jwt-token-xyz");
    mockFetchOnce({ ok: false, status: 500, body: "DB down" });

    await expect(getPatients()).rejects.toThrow("DB down");
  });
});

describe("api.createUser", () => {
  test("trimite payload-ul {email, password, role} ca JSON cu Authorization", async () => {
    localStorage.setItem("sw_token", "tk-1");
    mockFetchOnce({ ok: true, body: { id: 42 } });

    const result = await createUser("nou@ex.com", "Parola123!", "PACIENT");

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/users");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer tk-1");
    expect(JSON.parse(options.body)).toEqual({
      email: "nou@ex.com",
      password: "Parola123!",
      role: "PACIENT",
    });
    expect(result).toEqual({ id: 42 });
  });
});

describe("api.logoutUser", () => {
  test("curata cheile de sesiune din localStorage", () => {
    localStorage.setItem("sw_token", "x");
    localStorage.setItem("sw_role", "MEDIC");
    localStorage.setItem("sw_email", "a@b");

    logoutUser();

    expect(localStorage.getItem("sw_token")).toBeNull();
    expect(localStorage.getItem("sw_role")).toBeNull();
    expect(localStorage.getItem("sw_email")).toBeNull();
  });
});
