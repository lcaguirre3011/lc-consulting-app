"use client";

import { StoreProvider, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  Menu,
  NotebookTabs,
  Settings,
  Target,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Target },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/diagnosticos", label: "Diagnosticos", icon: FileText },
  { href: "/recetario", label: "Recetario", icon: NotebookTabs },
  { href: "/proyectos", label: "Proyectos", icon: BriefcaseBusiness },
  { href: "/gantt", label: "Gantt", icon: Activity },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/kpis", label: "KPIs", icon: BarChart3 },
  { href: "/consultores", label: "Consultores", icon: CalendarDays },
  { href: "/reportes", label: "Reportes", icon: FileText },
  { href: "/configuracion", label: "Configuracion", icon: Settings },
];

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isReady } = useStore();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isReady && !user && pathname !== "/login") router.replace("/login");
  }, [isReady, pathname, router, user]);

  if (!isReady) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (pathname === "/login") return <>{children}</>;
  if (!user) return <div className="min-h-screen bg-slate-50" />;

  const sidebar = (
    <aside className={cn("flex h-full flex-col border-r border-brand-charcoal/10 bg-white transition-all", collapsed ? "w-20" : "w-72")}>
      <div className="border-b border-brand-charcoal/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-md border border-brand-mist bg-white">
            <Image
              src="/brand/isologo-color.png"
              alt="Leading Connections"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div className={cn(collapsed && "hidden")}>
            <p className="text-sm font-semibold text-brand-charcoal">Leading Connections</p>
            <p className="text-xs text-brand-charcoal/55">Business Consulting</p>
          </div>
          <button
            aria-label={collapsed ? "Mostrar barra" : "Ocultar barra"}
            className="ml-auto hidden h-8 w-8 items-center justify-center rounded-md border border-brand-mist text-brand-charcoal/70 hover:bg-brand-mist/60 lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-brand-charcoal/70 transition hover:bg-brand-mist/70 hover:text-brand-charcoal",
                collapsed && "justify-center px-0",
                active && "bg-brand-navy text-white shadow-sm hover:bg-brand-navy hover:text-white",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4", active && "text-brand-gold")} />
              <span className={cn(collapsed && "hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t border-brand-charcoal/10 p-4", collapsed && "px-2")}>
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
      <main className={cn("px-4 py-6 transition-all sm:px-6 lg:px-8 lg:py-8", collapsed ? "lg:ml-20" : "lg:ml-72")}>{children}</main>
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
