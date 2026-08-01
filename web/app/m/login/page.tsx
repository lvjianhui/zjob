"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react";
import { login, register } from "@/lib/api";

type Mode = "login" | "register";

export default function MobileLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await login({ username, password })
          : await register({ username, password });
      localStorage.setItem("zjob_token", res.access_token);
      localStorage.setItem("zjob_role", res.role);
      router.push("/m/profile");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "操作失败";
      if (msg.includes("409")) {
        setError("该用户名已被注册");
      } else if (msg.includes("401")) {
        setError("用户名或密码错误");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* 顶栏 */}
      <header className="px-4 pt-12 pb-4">
        <Link
          href="/m"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
      </header>

      {/* 品牌区 */}
      <section className="px-6 pt-4 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emote-mint-500 mb-4 shadow-float">
          <span className="text-3xl font-bold text-white">Z</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">真职 Zjob</h1>
        <p className="text-sm text-muted-foreground">
          入职前，先看清楚这家公司
        </p>
      </section>

      {/* 表单区 */}
      <section className="flex-1 px-6">
        {/* Tab 切换 */}
        <div className="flex bg-secondary rounded-full p-1 mb-6">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 h-9 rounded-full text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 h-9 rounded-full text-sm font-semibold transition-all ${
              mode === "register"
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground"
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* 用户名 */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                autoComplete="username"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "密码（至少 6 位）" : "密码"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                className="w-full h-12 pl-10 pr-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 确认密码（仅注册） */}
          {mode === "register" && (
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认密码"
                  autoComplete="new-password"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-emote-rose-600" role="alert">
              {error}
            </p>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-emote-charcoal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "login"
                ? "登录中..."
                : "注册中..."
              : mode === "login"
                ? "登录"
                : "注册"}
          </button>
        </form>

        {/* 辅助链接 */}
        <div className="mt-6 text-center">
          {mode === "login" ? (
            <p className="text-sm text-muted-foreground">
              还没有账号？{" "}
              <button
                onClick={() => switchMode("register")}
                className="text-emote-sky-600 font-medium hover:underline"
              >
                立即注册
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              已有账号？{" "}
              <button
                onClick={() => switchMode("login")}
                className="text-emote-sky-600 font-medium hover:underline"
              >
                去登录
              </button>
            </p>
          )}
        </div>
      </section>

      {/* 底部：随便看看 */}
      <footer className="px-6 pt-4 pb-8 text-center">
        <Link
          href="/m"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          先随便看看 →
        </Link>
        <p className="text-[11px] text-muted-foreground mt-4">
          注册即代表同意《用户协议》和《隐私政策》
        </p>
      </footer>
    </div>
  );
}
