"use client";

/**
 * Login page for the admin panel.
 * Submits password to /api/auth/login, stores token on success, redirects to /admin.
 */
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json()) as { token?: string; error?: string };

      if (!res.ok || !data.token) {
        setError(data.error ?? "Invalid password");
        return;
      }

      saveToken(data.token);
      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-rose-400 mb-1 text-center">Shelf</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Admin access</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border border-rose-200 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-rose-300 hover:bg-rose-400 disabled:opacity-50 text-white rounded-xl py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
