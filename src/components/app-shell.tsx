"use client";

import { StoreProvider, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  NotebookTabs,
  Settings,
  Target,
  Users,
  X,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui";


const navSections: { label?: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  { items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    items: [
      { href: "/crm", label: "CRM", icon: Target },
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/recetario", label: "Recetario", icon: NotebookTabs },
    ],
  },
  { items: [{ href: "/configuracion", label: "Configuracion", icon: Settings }] },
];

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isReady, data } = useStore();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isPublicLeadForm = pathname.startsWith("/formularios/lead/");
  const isSessionMode = pathname.startsWith("/sesion/");
  const activeSessionLead = data.leads.find((lead) => lead.stage === "sesion inicial agendada");

  useEffect(() => {
    if (isReady && !user && pathname !== "/login" && !isPublicLeadForm) router.replace("/login");
  }, [isReady, isPublicLeadForm, pathname, router, user]);

  if (!isReady) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (pathname === "/login") return <>{children}</>;
  if (isPublicLeadForm) return <>{children}</>;
  if (!user) return <div className="min-h-screen bg-slate-50" />;
  if (isSessionMode) return <>{children}</>;

  const sidebar = (
    <aside className={cn("flex h-full flex-col border-r border-brand-charcoal/10 bg-white/95 shadow-sm shadow-brand-charcoal/5 backdrop-blur transition-all", collapsed ? "w-[4.5rem]" : "w-64")}>
      <div className="border-b border-brand-charcoal/10 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-md border border-brand-mist bg-white shadow-sm">
            <Image
              src="/brand/isologo-color.png"
              alt="Leading Connections"
              width={42}
              height={42}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div className={cn(collapsed && "hidden")}>
            <p className="text-sm font-semibold text-brand-charcoal">Leading Connections</p>
            <p className="text-xs text-brand-charcoal/55">Business Consulting</p>
          </div>
          <button
            aria-label={collapsed ? "Mostrar barra" : "Ocultar barra"}
            className="ml-auto hidden h-8 w-8 items-center justify-center rounded-md border border-brand-mist text-brand-charcoal/60 transition hover:border-brand-gold hover:bg-brand-paper hover:text-brand-charcoal lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {navSections.map((section, sectionIndex) => (
          <div
            key={section.label ?? `section-${sectionIndex}`}
            className={cn(sectionIndex > 0 && "mt-3 border-t border-brand-charcoal/10 pt-3")}
          >
            {section.label ? (
              <p className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal/35", collapsed && "hidden")}>
                {section.label}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-brand-charcoal/62 transition hover:bg-brand-paper hover:text-brand-charcoal",
                      collapsed && "justify-center px-0",
                      active && "bg-brand-navy text-white shadow-sm shadow-brand-navy/15 hover:bg-brand-navy hover:text-white",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4", active && "text-brand-gold")} />
                    <span className={cn(collapsed && "hidden")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className={cn("border-t border-brand-charcoal/10 p-3", collapsed && "px-2")}>
        {!collapsed ? (
          <>
        <p className="text-sm font-medium text-brand-charcoal">{user.name}</p>
        <p className="text-xs capitalize text-brand-charcoal/55">{user.role}</p>
        <Button className="mt-3 w-full" variant="secondary" onClick={logout}>
          Salir
        </Button>
          </>
        ) : (
          <Button className="w-full px-0" variant="secondary" onClick={logout} title="Salir">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-paper text-brand-charcoal">
      <div className="hidden fixed inset-y-0 left-0 z-30 lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-40 bg-brand-charcoal/50 lg:hidden">
          <div className="h-full w-72">{sidebar}</div>
          <button
            aria-label="Cerrar menu"
            className="absolute right-4 top-4 rounded-md bg-white p-2"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}
      <header className="sticky top-0 z-20 border-b border-brand-charcoal/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          aria-label="Abrir menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-mist"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>
      <main className={cn("px-4 py-6 transition-all sm:px-6 lg:px-8 lg:py-8", collapsed ? "lg:ml-[4.5rem]" : "lg:ml-64")}>{children}</main>
      {activeSessionLead ? (
        <Link
          href={`/sesion/lead/${activeSessionLead.id}`}
          className="fixed bottom-4 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-brand-gold shadow-lg shadow-brand-navy/25 md:hidden"
          aria-label="Iniciar modo sesión"
          title={`Sesión con ${activeSessionLead.company}`}
        >
          <Video className="h-5 w-5" />
        </Link>
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ShellContent>{children}</ShellContent>
    </StoreProvider>
  );
}
