"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (response.ok) {
      window.location.reload();
      return;
    }

    const body = await response.json().catch(() => ({})) as { error?: string };
    setError(body.error ?? "No pudimos iniciar sesión.");
  }

  return (
    <main className="admin-access-page">
      <form className="admin-access-card admin-login-card" onSubmit={submit}>
        <img src="/images/biobelle-lockup.png" alt="Bellabel Centro Médico Estético" />
        <p>ACCESO PRIVADO</p>
        <h1>Panel Bellabel.</h1>
        <span>Ingresa con el usuario administrativo del centro para gestionar agenda, pacientes y permisos.</span>
        <label>
          Usuario
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        </label>
        <label>
          Clave
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        {error && <strong>{error}</strong>}
        <button disabled={loading}>{loading ? "Ingresando..." : "Entrar al panel"}</button>
      </form>
    </main>
  );
}
