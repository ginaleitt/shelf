"use client";

/**
 * Admin layout — protects all /admin routes, provides header nav.
 */
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, clearToken, authHeaders } from "@/lib/session";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setVerified(true); return; }
    const token = getToken();
    if (!token) { router.replace("/admin/login"); return; }
    fetch("/api/admin/bookmarks", { headers: authHeaders() }).then((res) => {
      if (res.status === 401) { clearToken(); router.replace("/admin/login"); }
      else setVerified(true);
    }).catch(() => setVerified(true));
  }, [isLoginPage, router]);

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE", headers: authHeaders() }).catch(() => {});
    clearToken();
    router.push("/admin/login");
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4]">
        <div className="w-6 h-6 rounded-full border-2 border-[#f2d4cc] border-t-[#c9847a] animate-spin" />
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  const navLinks = [
    { href: "/admin", label: "Bookmarks" },
    { href: "/admin/tags", label: "Tags & Categories" },
    { href: "/", label: "🏠 Home", external: true },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      <header className="bg-white border-b border-[#ecddd8] flex items-center justify-between" style={{ padding: "12px 24px" }}>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-base font-semibold text-[#c9847a] font-serif shrink-0">
            Shelf Admin
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = !link.external && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#f9ede8] text-[#c9847a] font-medium"
                      : "text-[#9a7e7a] hover:text-[#c9847a] hover:bg-[#fdf8f4]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#9a7e7a] hover:text-[#c9847a] transition-colors shrink-0"
        >
          Log out
        </button>
      </header>
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>{children}</main>
    </div>
  );
}
