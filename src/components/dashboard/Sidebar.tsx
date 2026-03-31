"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Puzzle, FileEdit, Settings, LogOut, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle },
  { href: "/dashboard/page-editor", label: "Page Editor", icon: FileEdit },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    const loadPlan = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setPlan(profile?.plan ?? "free");
    };
    loadPlan();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold">
          OnePager
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 space-y-2">
        {plan === "pro" ? (
          <Link
            href="/dashboard/upgrade"
            className="flex w-full items-center gap-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-100"
          >
            <Crown className="h-5 w-5 text-yellow-500" />
            Pro Plan
          </Link>
        ) : (
          <Link
            href="/dashboard/upgrade"
            className="flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:from-yellow-100 hover:to-orange-100"
          >
            <Crown className="h-5 w-5 text-orange-500" />
            Upgrade to Pro
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
