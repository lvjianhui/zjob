"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check, User as UserIcon } from "lucide-react";
import { getMe, updateProfile } from "@/lib/api";

export default function MobileProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((profile) => {
        setUsername(profile.username);
        setNickname(profile.nickname || profile.username);
        if (profile.bio) setBio(profile.bio);
      })
      .catch(() => {
        // 未登录或接口不可用，回退到 localStorage
        const role = localStorage.getItem("zjob_role");
        const name = role === "admin" ? "运营同学" : "真职用户";
        setUsername(name);
        setNickname(name);
      })
      .finally(() => setLoading(false));
    // 读取已保存的头像
    const savedAvatar = localStorage.getItem("zjob_avatar");
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 限制 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("图片大小不能超过 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      localStorage.setItem("zjob_avatar", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ nickname, bio });
      setSaved(true);
      setTimeout(() => router.push("/m/profile"), 800);
    } catch {
      // 后端不可用时回退到 localStorage
      localStorage.setItem("zjob_nickname", nickname);
      localStorage.setItem("zjob_bio", bio);
      setSaved(true);
      setTimeout(() => router.push("/m/profile"), 800);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">编辑资料</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-[430px] mx-auto">
        {/* 头像区 */}
        <section className="px-4 pt-8 pb-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emote-mint-100 overflow-hidden flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-emote-mint-700" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center shadow-card"
              aria-label="更换头像"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">点击更换头像</p>
        </section>

        {/* 表单区 */}
        <form onSubmit={handleSave} className="px-4 space-y-5">
          {/* 用户名 */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 px-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent"
            />
          </div>

          {/* 昵称 */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 px-1">
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="设置一个昵称"
              className="w-full h-12 px-4 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent"
            />
          </div>

          {/* 简介 */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 px-1">
              个人简介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="一句话介绍自己"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emote-sky-400 focus:border-transparent resize-none"
            />
          </div>

          {/* 保存按钮 */}
          <button
            type="submit"
            disabled={saved}
            className="w-full h-12 rounded-lg bg-emote-sky-600 text-white text-sm font-semibold hover:bg-emote-sky-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              "保存"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
