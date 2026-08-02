"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import { login } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ username, password });
      localStorage.setItem("zjob_token", res.access_token);
      localStorage.setItem("zjob_role", res.role);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-surface-container-low">
      <section className="w-full max-w-[420px] bg-card rounded-xl p-8 shadow-card-hover">
        <header className="text-center mb-8">
          <div className="text-2xl font-bold text-foreground mb-2">真职 Zjob</div>
          <h1 className="text-xl font-semibold text-foreground">后台管理</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-dom-id="login-username"
                placeholder="运营账号"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-dom-id="login-password"
                placeholder="密码"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            data-dom-id="login-submit"
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <footer className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">仅内部运营人员使用</p>
        </footer>
      </section>
    </main>
  );
}
