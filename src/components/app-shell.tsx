"use client";

import { StoreProvider, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Columns3,
  FileBarChart2,
  FileCheck2,
  GanttChart,
  Home,
  LayoutGrid,
  LineChart,
  Menu,
  NotebookTabs,
  Settings,
  Table2,
  Target,
  Users,
  X,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Button } from "./ui";


const moduleItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Inicio", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/crm", label: "CRM", icon: Target },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proyectos", label: "Proyectos", icon: BriefcaseBusiness },
  { href: "/gantt", label: "Proyectos", icon: GanttChart },
  { href: "/tareas", label: "Proyectos", icon: CheckCircle2 },
  { href: "/recetario", label: "Recetario", icon: NotebookTabs },
  { href: "/finanzas", label: "Finanzas", icon: CircleDollarSign },
  { href: "/reportes", label: "Reportes", icon: FileBarChart2 },
  { href: "/kpis", label: "Medicion", icon: LineChart },
  { href: "/diagnosticos", label: "Medicion", icon: ClipboardCheck },
  { href: "/diagnostico", label: "Medicion", icon: ClipboardCheck },
  { href: "/reuniones", label: "Sesiones", icon: Video },
  { href: "/consultores", label: "Equipo", icon: Users },
  { href: "/configuracion", label: "Configuracion", icon: Settings },
];

const moduleNavItems: Record<string, { href: string; label: string; icon: LucideIcon }[]> = {
  "/crm": [
    { href: "/crm?tab=tablero", label: "Tablero", icon: LayoutGrid },
    { href: "/crm?tab=pipeline", label: "Pipeline", icon: Target },
    { href: "/crm?tab=leads", label: "Lead", icon: Users },
    { href: "/crm?tab=reportes", label: "Reportes", icon: FileBarChart2 },
  ],
  "/clientes": [
    { href: "/clientes?section=empresas", label: "Empresas", icon: BriefcaseBusiness },
    { href: "/clientes?section=contactos", label: "Contactos", icon: Users },
  ],
  "/proyectos": [
    { href: "/proyectos?view=modulos", label: "Modulos", icon: BriefcaseBusiness },
    { href: "/proyectos?view=tabla", label: "Tabla", icon: Table2 },
    { href: "/proyectos?view=gantt", label: "Gantt", icon: GanttChart },
    { href: "/proyectos?view=tareas", label: "Tareas", icon: CheckCircle2 },
  ],
  "/gantt": [
    { href: "/proyectos?view=modulos", label: "Modulos", icon: BriefcaseBusiness },
    { href: "/proyectos?view=tabla", label: "Tabla", icon: Table2 },
    { href: "/proyectos?view=gantt", label: "Gantt", icon: GanttChart },
    { href: "/proyectos?view=tareas", label: "Tareas", icon: CheckCircle2 },
  ],
  "/tareas": [
    { href: "/proyectos?view=modulos", label: "Modulos", icon: BriefcaseBusiness },
    { href: "/proyectos?view=tabla", label: "Tabla", icon: Table2 },
    { href: "/proyectos?view=gantt", label: "Gantt", icon: GanttChart },
    { href: "/proyectos?view=tareas", label: "Tareas", icon: CheckCircle2 },
  ],
  "/recetario": [
    { href: "/recetario", label: "Recetas", icon: NotebookTabs },
    { href: "/recetario?action=nueva", label: "Nueva receta", icon: FileCheck2 },
  ],
  "/finanzas": [
    { href: "/finanzas?view=resumen", label: "Resumen", icon: CircleDollarSign },
    { href: "/finanzas?view=facturas", label: "Facturas", icon: FileCheck2 },
    { href: "/finanzas?view=gastos", label: "Gastos", icon: FileBarChart2 },
  ],
  "/reportes": [
    { href: "/reportes?view=generador", label: "Generador", icon: FileBarChart2 },
    { href: "/reportes?view=historial", label: "Historial", icon: NotebookTabs },
  ],
  "/kpis": [
    { href: "/kpis", label: "KPIs", icon: LineChart },
    { href: "/reportes?view=historial", label: "Reportes", icon: FileBarChart2 },
    { href: "/diagnosticos", label: "Diagnosticos", icon: ClipboardCheck },
  ],
  "/diagnosticos": [
    { href: "/diagnosticos", label: "Diagnosticos", icon: ClipboardCheck },
    { href: "/kpis", label: "KPIs", icon: LineChart },
    { href: "/reportes?view=historial", label: "Reportes", icon: FileBarChart2 },
  ],
  "/diagnostico": [
    { href: "/diagnostico", label: "Formulario", icon: ClipboardCheck },
    { href: "/diagnosticos", label: "Diagnosticos", icon: ClipboardCheck },
  ],
  "/reuniones": [
    { href: "/reuniones", label: "Sesiones", icon: Video },
    { href: "/proyectos?view=tareas", label: "Tareas", icon: CheckCircle2 },
  ],
  "/consultores": [
    { href: "/consultores?view=kanban", label: "Kanban", icon: Columns3 },
    { href: "/consultores?view=lista", label: "Lista", icon: Table2 },
  ],
  "/configuracion": [
    { href: "/configuracion?tab=sistema", label: "Sistema", icon: Settings },
    { href: "/configuracion?tab=equipo", label: "Equipo", icon: Users },
    { href: "/configuracion?tab=paquetes", label: "Paquetes", icon: NotebookTabs },
    { href: "/configuracion?tab=finanzas", label: "Finanzas", icon: CircleDollarSign },
  ],
  "/dashboard": [
    { href: "/dashboard", label: "Resumen gerencial", icon: LayoutGrid },
    { href: "/crm?tab=pipeline", label: "Comercial", icon: Target },
    { href: "/proyectos?view=modulos", label: "Ejecucion", icon: BriefcaseBusiness },
    { href: "/finanzas?view=resumen", label: "Finanzas", icon: CircleDollarSign },
  ],
};

const defaultModuleHref: Record<string, string> = {
  "/crm": "/crm?tab=tablero",
  "/clientes": "/clientes?section=empresas",
  "/proyectos": "/proyectos?view=modulos",
  "/gantt": "/proyectos?view=gantt",
  "/tareas": "/proyectos?view=tareas",
  "/consultores": "/consultores?view=kanban",
  "/finanzas": "/finanzas?view=resumen",
  "/reportes": "/reportes?view=generador",
  "/configuracion": "/configuracion?tab=sistema",
};

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout, isReady, data } = useStore();
  const [open, setOpen] = useState(false);
  const isPublicLeadForm = pathname.startsWith("/formularios/lead/");
  const isSessionMode = pathname.startsWith("/sesion/");
  const isLauncher = pathname === "/app";
  const activeSessionLead = data.leads.find((lead) => lead.stage === "sesion inicial agendada");
  const currentModule = moduleItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const contextualItems = currentModule ? (moduleNavItems[currentModule.href] ?? []) : [];
  const currentHref = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

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
  if (isLauncher) return <>{children}</>;

  const navigation = (
    <nav className="flex items-center gap-1">
      {contextualItems.map((item) => {
        const Icon = item.icon;
        const [itemPath, itemQuery] = item.href.split("?");
        const defaultHref = currentModule ? defaultModuleHref[currentModule.href] : undefined;
        const defaultActive = !searchParams.toString() && item.href === defaultHref && (pathname === currentModule?.href || pathname.startsWith(`${currentModule?.href}/`));
        const active =
          currentHref === item.href ||
          (!itemQuery && pathname === itemPath) ||
          (itemQuery ? pathname === itemPath && searchParams.toString() === itemQuery : false) ||
          defaultActive;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-brand-charcoal/65 transition hover:bg-brand-paper hover:text-brand-charcoal",
              active && "bg-brand-navy text-white shadow-sm shadow-brand-navy/15 hover:bg-brand-navy hover:text-white",
            )}
          >
            <Icon className={cn("h-4 w-4", active && "text-brand-gold")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const goHome = () => {
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-transparent text-brand-charcoal">
      <header className="sticky top-0 z-30 border-b border-brand-charcoal/10 bg-white/92 px-4 py-3 shadow-sm shadow-brand-charcoal/5 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4">
          <Link href="/app" className="flex shrink-0 items-center gap-3">
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
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-brand-charcoal">Leading Connections</p>
              <p className="mt-1 text-xs leading-none text-brand-charcoal/55">{currentModule?.label ?? "OS"}</p>
            </div>
          </Link>
          <Button variant="secondary" onClick={goHome} className="hidden shrink-0 sm:inline-flex">
            <Home className="h-4 w-4" />
            Inicio
          </Button>
          <div className="hidden flex-1 overflow-x-auto lg:block">{navigation}</div>
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-3 rounded-md border border-brand-mist bg-white px-3 py-2 shadow-sm">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-brand-charcoal">{user.name}</p>
                <p className="mt-1 text-xs capitalize leading-none text-brand-charcoal/45">{user.role}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={logout}>Salir</Button>
          </div>
          <button
            aria-label="Abrir menu"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-mist bg-white lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <div className="mt-3 grid gap-2 border-t border-brand-mist pt-3 lg:hidden">
            <Button variant="secondary" onClick={goHome} className="justify-center">
              <Home className="h-4 w-4" />
              Inicio
            </Button>
            {navigation}
            <Button variant="secondary" onClick={logout}>Salir</Button>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-6 transition-all sm:px-6 lg:px-8 lg:py-8">{children}</main>
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
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <ShellContent>{children}</ShellContent>
      </Suspense>
    </StoreProvider>
  );
}
