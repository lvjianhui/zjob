"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Clock,
  Crown,
  Heart,
  Info,
  LogOut,
  Moon,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  User as UserIcon,
  Edit3,
} from "lucide-react";
import { getFavorites, getMe } from "@/lib/api";

// 移动端个人中心页面
export default function MobileProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [toast, setToast] = useState("");
  const [favCount, setFavCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // 读取本地存储的统计数量
  const loadLocalCounts = () => {
    try {
      const favs = JSON.parse(localStorage.getItem("zjob_favorites") || "[]");
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
    try {
      const history = JSON.parse(localStorage.getItem("zjob_view_history") || "[]");
      setHistoryCount(Array.isArray(history) ? history.length : 0);
    } catch {
      setHistoryCount(0);
    }
    try {
      const reviews = JSON.parse(localStorage.getItem("zjob_reviews") || "[]");
      setReviewCount(Array.isArray(reviews) ? reviews.length : 0);
    } catch {
      setReviewCount(0);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("zjob_token");
    setIsLoggedIn(!!token);
    if (!token) {
      loadLocalCounts();
      return;
    }
    const savedAvatar = localStorage.getItem("zjob_avatar");
    if (savedAvatar) setAvatar(savedAvatar);
    getMe()
      .then((profile) => {
        setUsername(profile.nickname || profile.username);
        if (profile.bio) setBio(profile.bio);
      })
      .catch(() => {
        const role = localStorage.getItem("zjob_role");
        const defaultName = role === "admin" ? "运营同学" : "真职用户";
        setUsername(localStorage.getItem("zjob_nickname") || defaultName);
        const savedBio = localStorage.getItem("zjob_bio");
        if (savedBio) setBio(savedBio);
      });
    // 收藏数：优先从后端获取
    getFavorites()
      .then((items) => setFavCount(Array.isArray(items) ? items.length : 0))
      .catch(() => {
        try {
          const favs = JSON.parse(localStorage.getItem("zjob_favorites") || "[]");
          setFavCount(Array.isArray(favs) ? favs.length : 0);
        } catch {
          setFavCount(0);
        }
      });
    // 浏览/评价数：从 localStorage 读取
    try {
      const history = JSON.parse(localStorage.getItem("zjob_view_history") || "[]");
      setHistoryCount(Array.isArray(history) ? history.length : 0);
    } catch {
      setHistoryCount(0);
    }
    try {
      const reviews = JSON.parse(localStorage.getItem("zjob_reviews") || "[]");
      setReviewCount(Array.isArray(reviews) ? reviews.length : 0);
    } catch {
      setReviewCount(0);
    }
  }, []);

  // 页面重新可见时刷新统计（从收藏列表等返回）
  useEffect(() => {
    const handler = () => loadLocalCounts();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zjob_token");
    localStorage.removeItem("zjob_role");
    setIsLoggedIn(false);
  };

  const showComingSoon = () => {
    setToast("功能即将上线，敬请期待");
    setTimeout(() => setToast(""), 2000);
  };

  // 快捷统计
  const stats = [
    {
      icon: Heart,
      label: "收藏",
      value: favCount,
      text: "text-emote-mint-700",
      badge: "bg-emote-mint-600 text-white",
      href: "/m/profile/favorites",
    },
    {
      icon: ScrollText,
      label: "对比",
      value: 0,
      text: "text-emote-sky-700",
      badge: "bg-emote-sky-600 text-white",
      href: "/m/compare",
    },
    {
      icon: Clock,
      label: "浏览",
      value: historyCount,
      text: "text-emote-cream-700",
      badge: "bg-emote-cream-600 text-white",
      href: "/m/profile/history",
    },
    {
      icon: Star,
      label: "评价",
      value: reviewCount,
      text: "text-emote-lavender-700",
      badge: "bg-emote-lavender-600 text-white",
      href: "/m/profile/reviews",
    },
  ];

  // 菜单组配置
  const menuGroups: {
    title: string;
    items: {
      icon: typeof UserIcon;
      label: string;
      value?: string;
      href?: string;
      onClick?: () => void;
      danger?: boolean;
      accentBg?: string;
      accentText?: string;
    }[];
  }[] = [
    {
      title: "账号",
      items: [
        {
          icon: Shield,
          label: "账号安全",
          value: "未绑定",
          onClick: showComingSoon,
          accentBg: "bg-emote-sky-100",
          accentText: "text-emote-sky-700",
        },
      ],
    },
    {
      title: "偏好与帮助",
      items: [
        {
          icon: Moon,
          label: "深色模式",
          value: "跟随系统",
          accentBg: "bg-emote-charcoal-100",
          accentText: "text-emote-charcoal-600",
        },
        {
          icon: Bell,
          label: "消息通知",
          value: "已开启",
          accentBg: "bg-emote-cream-100",
          accentText: "text-emote-cream-700",
        },
        {
          icon: Info,
          label: "关于真职",
          onClick: showComingSoon,
          accentBg: "bg-emote-mint-100",
          accentText: "text-emote-mint-700",
        },
        {
          icon: CircleHelp,
          label: "帮助与反馈",
          onClick: showComingSoon,
          accentBg: "bg-emote-lavender-100",
          accentText: "text-emote-lavender-700",
        },
      ],
    },
  ];

  return (
    <div className="bg-background min-h-screen pb-6">
      <div className="max-w-[430px] mx-auto">
        {/* 用户信息卡（含统计区） */}
        <section className="px-4 pt-5 pb-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            {/* 未登录态：引导登录 */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emote-lavender-100 flex items-center justify-center shrink-0">
                  <UserIcon className="w-8 h-8 text-emote-lavender-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">
                    开启你的求职决策
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    登录后同步收藏、对比与浏览记录
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emote-lavender-300 via-emote-lavender-500 to-emote-lavender-700 p-[2px]">
                      <div className="w-full h-full rounded-full bg-emote-mint-100 overflow-hidden flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-8 h-8 text-emote-mint-700" />
                        )}
                      </div>
                    </div>
                    <Link
                      href="/m/profile/edit"
                      className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-card"
                      aria-label="编辑头像"
                    >
                      <Edit3 className="w-3 h-3 text-muted-foreground" />
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-foreground truncate">
                        {username}
                      </h2>
                      <span className="inline-flex items-center gap-0.5 shrink-0 bg-gradient-to-r from-emote-lavender-500 to-emote-lavender-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        <Crown className="w-3 h-3" />
                        VIP 会员
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {bio || "欢迎回来 · 用好六维决策更聪明"}
                    </p>
                  </div>
                  <Link
                    href="/m/profile/edit"
                    className="shrink-0 p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                    aria-label="编辑资料"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                </div>

                {/* VIP 会员信息条 */}
                <button
                  onClick={showComingSoon}
                  className="mt-4 w-full rounded-lg bg-gradient-to-r from-emote-lavender-50 via-emote-lavender-100 to-emote-lavender-50 border border-emote-lavender-200/60 p-3 flex items-center gap-3 active:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emote-lavender-400 to-emote-lavender-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-emote-lavender-900">
                        VIP 会员
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emote-lavender-500/20 text-emote-lavender-700 font-medium">
                        畅享特权
                      </span>
                    </div>
                    <p className="text-[11px] text-emote-lavender-700/80 mt-0.5 truncate">
                      有效期至 2026-12-31 · 六维评估无限制
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emote-lavender-600/70 shrink-0" />
                </button>
              </>
            )}

            {/* 登录按钮（未登录态） */}
            {!isLoggedIn && (
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/m/login"
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-lg bg-emote-sky-600 text-white text-sm font-semibold hover:bg-emote-sky-700 transition-colors"
                >
                  登录 / 注册
                </Link>
                <Link
                  href="/m"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors shrink-0"
                >
                  随便看看
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 我的工具（登录态展示） */}
        {isLoggedIn && (
          <section className="px-4 mt-1">
            <h3 className="text-xs font-semibold text-muted-foreground px-1 mb-2 tracking-wide">
              我的工具
            </h3>
            <div className="bg-card border border-border rounded-xl shadow-card px-2 py-3 flex items-center justify-around">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="flex flex-col items-center gap-1 active:opacity-60 transition-opacity flex-1"
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${s.text}`} />
                      <span
                        className={`absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 rounded-full ${s.badge} text-[9px] font-bold flex items-center justify-center ring-2 ring-card`}
                      >
                        {s.value}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {s.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 菜单组 */}
        <div className="px-4 space-y-5 mt-4">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <h3 className="text-xs font-semibold text-muted-foreground px-1 mb-2 tracking-wide">
                {group.title}
              </h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  const content = (
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors ${
                        idx > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          item.danger
                            ? "bg-emote-rose-50 text-emote-rose-600"
                            : `${item.accentBg ?? "bg-secondary"} ${
                                item.accentText ?? "text-foreground"
                              }`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.value && (
                        <span className="text-xs text-muted-foreground mr-0.5">
                          {item.value}
                        </span>
                      )}
                      {item.href && !item.onClick && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  );
                  return item.href ? (
                    <Link key={item.label} href={item.href}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full text-left"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* 退出登录（仅登录态显示） */}
          {isLoggedIn && (
            <section>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-emote-rose-50 text-emote-rose-600 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-emote-rose-600">
                    退出登录
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-emote-charcoal-800 text-white text-sm shadow-modal">
          {toast}
        </div>
      )}
    </div>
  );
}
