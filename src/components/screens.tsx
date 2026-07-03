"use client";

import { KpiTrend } from "@/components/charts";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PanelHeader,
  Select,
  Stat,
  TextArea,
  TextInput,
} from "@/components/ui";
import { consultingPackages, kpiTone, leadStages, taskStatuses } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import type { Diagnosis, DiscoveryForm, Health, IntakeForm, Lead, LeadStage, PackageType, Priority, ProjectStatus, Recipe, TaskStatus } from "@/lib/types";
import { cn, daysLate, money, pct, shortDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  CircleDollarSign,
  Columns3,
  Copy,
  Edit3,
  ExternalLink,
  FileBarChart2,
  FileCheck2,
  FileDown,
  FolderOpen,
  GanttChart,
  GripVertical,
  LayoutGrid,
  LineChart,
  NotebookTabs,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings,
  Table2,
  Target,
  Users,
  Video,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function healthTone(health: Health) {
  if (health === "verde") return "green";
  if (health === "amarillo") return "yellow";
  return "red";
}

function priorityTone(priority: Priority) {
  if (priority === "critica") return "red";
  if (priority === "alta") return "yellow";
  if (priority === "media") return "blue";
  return "neutral";
}

function statusTone(status: string) {
  if (["terminada", "completado", "aprobado", "bien", "cliente ganado"].includes(status)) {
    return "green";
  }
  if (["bloqueada", "critico", "perdido", "rechazado"].includes(status)) return "red";
  if (["en revision", "alerta", "pausado"].includes(status)) return "yellow";
  return "blue";
}

function IconToggle({
  active,
  label,
  children,
  onClick,
}: {
  active: boolean;
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border transition",
        active
          ? "border-brand-navy bg-brand-navy text-brand-gold"
          : "border-brand-mist bg-white text-brand-charcoal/70 hover:border-brand-gold hover:text-brand-charcoal",
      )}
    >
      {children}
    </button>
  );
}

function getLeadFormPath(leadId: string) {
  return `/formularios/lead/${leadId}`;
}

function getLeadFormUrl(leadId: string) {
  if (typeof window === "undefined") return getLeadFormPath(leadId);
  return `${window.location.origin}${getLeadFormPath(leadId)}`;
}

function yearsFromOperatingTime(value: string) {
  if (value.includes("Menos")) return 1;
  if (value.includes("1 y 3")) return 3;
  if (value.includes("3 y 5")) return 5;
  if (value.includes("MÃ¡s") || value.includes("Más")) return 6;
  return 0;
}

const warningSignalOptions = [
  "Expectativas de resultado irreales",
  "Baja disposicion a participar",
  "Presupuesto insuficiente o no confirmado",
  "Scope creep probable",
  "Decisor real no estaba en la sesion",
  "Dependencia excesiva de LC para resultados",
  "Ninguna senal de alerta",
];

function emptyDiscovery(): DiscoveryForm {
  return {
    businessModel: "",
    monthlyRevenue: "",
    employeeCount: 0,
    activeClients: 0,
    mainStrength: "",
    describedSymptom: "",
    rootProblem: "",
    previousAttempts: "",
    urgency: "media",
    urgencyImpact: "",
    commercialBaseline: "",
    operationalBaseline: "",
    digitalBaseline: "",
    successMetric: "",
    metricDeadline: "",
    recommendedPackage: "",
    packageJustification: "",
    weeklyHours: 0,
    durationMonths: 0,
    complexity: "3 - Media",
    warningSignals: [],
    sessionNotes: "",
    finalDecision: "evaluacion",
    decisionJustification: "",
  };
}

function isDiscoveryComplete(discovery: DiscoveryForm) {
  const required = [
    discovery.businessModel,
    discovery.describedSymptom,
    discovery.rootProblem,
    discovery.previousAttempts,
    discovery.urgencyImpact,
    discovery.commercialBaseline,
    discovery.operationalBaseline,
    discovery.digitalBaseline,
    discovery.successMetric,
    discovery.metricDeadline,
    discovery.recommendedPackage,
    discovery.packageJustification,
  ];
  return required.every((value) => String(value).trim().length > 0) && discovery.weeklyHours > 0 && discovery.durationMonths > 0;
}

export function LoginScreen() {
  const router = useRouter();
  const { login } = useStore();
  const [email, setEmail] = useState("admin@lcconsulting.mx");

  return (
    <main className="grid min-h-screen bg-brand-navy text-white lg:grid-cols-[1fr_440px]">
      <section className="relative flex min-h-[45vh] flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 lg:min-h-screen">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute bottom-16 left-10 h-px w-2/3 bg-gradient-to-r from-brand-gold/70 via-white/20 to-transparent" />
        <div className="flex items-center gap-3">
          <Image
            src="/brand/full-white.png"
            alt="Leading Connections Business Consulting"
            width={310}
            height={92}
            className="h-auto w-64 max-w-full object-contain"
            priority
          />
        </div>
        <div className="relative max-w-3xl py-12">
          <p className="text-sm font-semibold text-brand-gold">Control tower para consultores</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
            Opera clientes, proyectos y KPIs con la claridad de un faro.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-brand-mist">
            MVP funcional con datos demo, preparado para conectarse a Supabase con RLS,
            roles y relaciones de negocio.
          </p>
        </div>
        <div className="relative grid gap-3 text-sm text-brand-mist sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">CRM consultivo</p>
            <p className="mt-1 text-white/60">Pipeline y seguimiento</p>
          </div>
          <div>
            <p className="font-semibold text-white">Diagnosticos accionables</p>
            <p className="mt-1 text-white/60">Problemas, KPIs y recetas</p>
          </div>
          <div>
            <p className="font-semibold text-white">Ejecucion operativa</p>
            <p className="mt-1 text-white/60">Proyectos, Gantt y minutas</p>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-white px-6 py-10 text-brand-charcoal sm:px-10">
        <div className="w-full">
          <h2 className="text-2xl font-semibold">Entrar al workspace</h2>
          <p className="mt-2 text-sm text-brand-charcoal/60">
            Usa cualquier correo demo: admin@lcconsulting.mx, consultor@lcconsulting.mx o
            viewer@lcconsulting.mx.
          </p>
          <form
            className="mt-8 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              login(email);
              router.push("/app");
            }}
          >
            <Field label="Correo">
              <TextInput value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field label="Password">
              <TextInput type="password" value="demo-password" readOnly />
            </Field>
            <Button className="w-full">Entrar</Button>
          </form>
        </div>
      </section>
    </main>
  );
}

export function AppLauncherScreen() {
  const { user } = useStore();
  const modules = [
    { label: "CRM", href: "/crm", icon: Target, detail: "Pipeline comercial", tone: "bg-violet-100 text-violet-700" },
    { label: "Clientes", href: "/clientes", icon: Users, detail: "Expedientes empresariales", tone: "bg-emerald-100 text-emerald-700" },
    { label: "Proyectos", href: "/proyectos", icon: BriefcaseBusiness, detail: "Ejecucion LEAD", tone: "bg-sky-100 text-sky-700" },
    { label: "Recetario", href: "/recetario", icon: NotebookTabs, detail: "Memoria institucional", tone: "bg-amber-100 text-amber-700" },
    { label: "Finanzas", href: "/finanzas", icon: CircleDollarSign, detail: "Caja y cobranza", tone: "bg-lime-100 text-lime-700" },
    { label: "Reportes", href: "/reportes", icon: FileBarChart2, detail: "PDFs ejecutivos", tone: "bg-indigo-100 text-indigo-700" },
    { label: "Sesiones", href: "/reuniones", icon: Video, detail: "Bitacora consultiva", tone: "bg-rose-100 text-rose-700" },
    { label: "Configuracion", href: "/configuracion", icon: Settings, detail: "Usuarios y paquetes", tone: "bg-slate-100 text-slate-700" },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-6 text-brand-charcoal sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-brand-charcoal/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl border border-brand-charcoal/10 bg-white shadow-sm">
              <Image src="/brand/isologo-color.png" alt="Leading Connections" width={46} height={46} className="h-11 w-11 object-contain" priority />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-navy">LC Leading Connections OS</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Bienvenido, {user?.name.split(" ")[0] ?? "Luis Carlos"}</h1>
            </div>
          </div>
          <div className="rounded-lg border border-brand-charcoal/10 bg-white px-4 py-3 text-sm text-brand-charcoal/60 shadow-sm">
            Consultorio empresarial activo
          </div>
        </header>

        <section className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-xl border border-brand-charcoal/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-gold/70 hover:shadow-md"
              >
                <div className={cn("grid h-14 w-14 place-items-center rounded-xl", module.tone)}>
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-5 text-base font-semibold text-brand-charcoal">{module.label}</p>
                <p className="mt-1 text-sm text-brand-charcoal/55">{module.detail}</p>
              </Link>
            );
          })}
        </section>

      </div>
    </main>
  );
}

export function DashboardScreen() {
  const { data } = useStore();
  const activeProjects = data.projects.filter((project) => project.status === "en progreso");
  const overdueTasks = data.tasks.filter((task) => daysLate(task.dueDate) > 0 && task.status !== "terminada");
  const criticalKpis = data.kpis.filter((kpi) => kpi.status !== "bien");
  const weightedPipeline = data.leads.reduce(
    (sum, lead) => sum + lead.estimatedValue * (lead.closeProbability / 100),
    0,
  );
  const monthlyRevenue = data.projects
    .filter((project) => project.status !== "cancelado")
    .reduce((sum, project) => sum + project.budget, 0);
  const avgProjectProgress = Math.round(
    data.projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(data.projects.length, 1),
  );
  const consultantsBusy = data.consultants.filter((consultant) => consultant.status === "ocupado");
  const newLeads = data.leads.filter((lead) => lead.stage === "nuevo lead" || lead.stage === "formulario 1 enviado");
  const proposals = data.leads.filter((lead) => ["propuesta enviada", "negociacion"].includes(lead.stage));
  const invoicedRevenue = data.invoices
    .filter((invoice) => invoice.status !== "cancelada")
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const collectedRevenue = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const accountsReceivable = Math.max(0, invoicedRevenue - collectedRevenue);
  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === "vencida");
  const operatingExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const operatingMargin = collectedRevenue - operatingExpenses;
  const billableHours = data.timeEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
  const nonBillableHours = data.timeEntries.filter((entry) => !entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
  const utilization = Math.round((billableHours / Math.max(billableHours + nonBillableHours, 1)) * 100);

  return (
    <>
      <PageHeader
        title="Dashboard gerencial"
        description="Vista de administrador para operar el negocio: ventas, clientes, consultores, proyectos, riesgos y acciones críticas."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pipeline ponderado" value={money(weightedPipeline)} detail={`${proposals.length} oportunidades calientes`} tone="blue" />
        <Stat label="Cartera de proyectos" value={money(monthlyRevenue)} detail={`${activeProjects.length} proyectos activos`} tone="green" />
        <Stat label="Avance promedio" value={`${avgProjectProgress}%`} detail="Progreso global de ejecución" tone="yellow" />
        <Stat label="Riesgos abiertos" value={`${overdueTasks.length + criticalKpis.length}`} detail="Tareas atrasadas + KPIs críticos" tone="red" />
      </div>

      <Panel className="mt-6">
        <PanelHeader title="ERP interno LC" description="Caja, cobranza, gastos, margen y capacidad del negocio." />
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-6">
          <Stat label="Facturado" value={money(invoicedRevenue)} detail={`${data.invoices.length} facturas`} tone="blue" />
          <Stat label="Cobrado" value={money(collectedRevenue)} detail="Pagos aplicados" tone="green" />
          <Stat label="Por cobrar" value={money(accountsReceivable)} detail={`${overdueInvoices.length} vencidas`} tone={overdueInvoices.length ? "red" : "yellow"} />
          <Stat label="Gastos" value={money(operatingExpenses)} detail={`${data.expenses.length} movimientos`} tone="yellow" />
          <Stat label="Margen caja" value={money(operatingMargin)} detail="Cobrado - gastos" tone={operatingMargin >= 0 ? "green" : "red"} />
          <Stat label="Utilizacion" value={`${utilization}%`} detail={`${billableHours}h facturables`} tone="blue" />
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader title="Cómo empezar hoy" description="Flujo recomendado para operar la plataforma sin perderse." />
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {[
              ["1", "Captura o revisa leads", "CRM", "/crm"],
              ["2", "Convierte leads ganados a pacientes", "Clientes", "/clientes"],
              ["3", "Crea proyectos desde expediente", "Proyectos", "/proyectos"],
              ["4", "Revisa consultores, KPIs y reportes", "Gerencia", "/consultores"],
            ].map(([step, title, area, href]) => (
              <Link key={step} href={href} className="rounded-lg border border-brand-mist bg-white p-4 hover:border-brand-gold hover:bg-brand-gold/10">
                <Badge tone="dark">Paso {step}</Badge>
                <p className="mt-3 font-semibold text-brand-charcoal">{title}</p>
                <p className="mt-1 text-sm text-brand-charcoal/60">{area}</p>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Consultores y capacidad" description="Carga del equipo y proyectos asignados." />
          <div className="space-y-3 p-5">
            {data.consultants.map((consultant) => (
              <Link key={consultant.id} href="/consultores" className="block rounded-lg border border-brand-mist p-3 hover:border-brand-gold">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{consultant.name}</p>
                    <p className="text-sm text-brand-charcoal/55">{consultant.projectIds.length} proyectos · {consultant.role}</p>
                  </div>
                  <Badge tone={consultant.status === "disponible" ? "green" : consultant.status === "ocupado" ? "yellow" : "red"}>{consultant.capacity}%</Badge>
                </div>
                <div className="mt-2 h-2 rounded-full bg-brand-mist">
                  <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${consultant.capacity}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel>
          <PanelHeader title="Control tower" description="Alertas importantes y salud por cliente." />
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {data.clients.map((client) => {
              const tasks = data.tasks.filter((task) => task.clientId === client.id && task.status !== "terminada");
              const kpis = data.kpis.filter((kpi) => kpi.clientId === client.id);
              return (
                <Link
                  href={`/clientes/${client.id}`}
                  key={client.id}
                  className="rounded-lg border border-brand-mist p-4 transition hover:border-brand-gold hover:bg-brand-gold/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-brand-charcoal">{client.name}</h3>
                      <p className="mt-1 text-sm text-brand-charcoal/60">{client.mainPain}</p>
                    </div>
                    <Badge tone={healthTone(client.health)}>{client.health}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{tasks.length} tareas</Badge>
                    <Badge>{kpis.length} KPIs</Badge>
                    <Badge tone="blue">{money(client.revenueEstimate)}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Riesgos y decisiones" description="Lo que un gerente debe revisar primero." />
          <div className="space-y-3 p-5">
            {newLeads.length ? (
              <Link href="/crm" className="block rounded-lg border border-brand-mist bg-brand-paper p-3">
                <p className="text-sm font-medium text-brand-charcoal">Hay {newLeads.length} leads nuevos o con Formulario 1 enviado</p>
                <p className="mt-1 text-xs text-brand-charcoal/60">Revisa fit y agenda descubrimiento.</p>
              </Link>
            ) : null}
            {consultantsBusy.length ? (
              <Link href="/consultores" className="block rounded-lg border border-brand-mist bg-brand-paper p-3">
                <p className="text-sm font-medium text-brand-charcoal">{consultantsBusy.length} consultores con carga alta</p>
                <p className="mt-1 text-xs text-brand-charcoal/60">Rebalancea proyectos antes de aceptar más alcance.</p>
              </Link>
            ) : null}
            {overdueTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <p className="text-sm font-medium text-rose-950">{task.title}</p>
                </div>
                <p className="mt-1 text-xs text-rose-700">
                  {daysLate(task.dueDate)} dias de atraso · {task.owner}
                </p>
              </div>
            ))}
            {criticalKpis.map((kpi) => (
              <div key={kpi.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-950">{kpi.name}</p>
                <p className="mt-1 text-xs text-amber-700">
                  Actual {kpi.currentValue}
                  {kpi.unit} vs meta {kpi.target}
                  {kpi.unit}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

const crmPipelineColumns: { label: string; description: string; stages: LeadStage[]; target: LeadStage }[] = [
  { label: "Nuevo lead", description: "Entrada comercial", stages: ["nuevo lead"], target: "nuevo lead" },
  { label: "Calificacion", description: "Formulario 1 + investigacion", stages: ["formulario 1 enviado", "investigacion en progreso"], target: "formulario 1 enviado" },
  { label: "Diagnostico", description: "Sesion inicial", stages: ["sesion inicial agendada"], target: "sesion inicial agendada" },
  { label: "Propuesta", description: "Paquete recomendado", stages: ["propuesta enviada"], target: "propuesta enviada" },
  { label: "Negociacion", description: "Ajuste y cierre", stages: ["negociacion"], target: "negociacion" },
  { label: "Cliente ganado", description: "Crear expediente", stages: ["cliente ganado"], target: "cliente ganado" },
  { label: "Perdido", description: "No fit o pausado", stages: ["perdido"], target: "perdido" },
];

type CrmTab = "pipeline" | "leads" | "clientes" | "seguimientos" | "formularios" | "reportes";
const crmTabIds: CrmTab[] = ["pipeline", "leads", "clientes", "seguimientos", "formularios", "reportes"];

function asCrmTab(value: string | null): CrmTab {
  return crmTabIds.includes(value as CrmTab) ? (value as CrmTab) : "pipeline";
}

function leadFitTone(lead: Lead) {
  if (lead.intake?.internalFlag === "verde") return "green";
  if (lead.intake?.internalFlag === "rojo") return "red";
  if (lead.intake?.internalFlag === "amarillo") return "yellow";
  return "neutral";
}

function leadFitLabel(lead: Lead) {
  if (lead.intake?.internalFlag) return lead.intake.internalFlag;
  return lead.intake ? "en revision" : "pendiente";
}

function leadIndustry(lead: Lead) {
  return lead.intake?.industry ?? lead.industry ?? lead.source ?? "Sin industria";
}

function leadPain(lead: Lead) {
  return lead.intake?.mainProblem ?? lead.desiredOutcome ?? lead.nextStep ?? "Dolor pendiente de documentar";
}

export function CrmScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, moveLead, addLead, updateLead } = useStore();
  const [showForm, setShowForm] = useState(false);
  const tab = asCrmTab(searchParams.get("tab"));
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [createdLeadLink, setCreatedLeadLink] = useState(false);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [conversionLead, setConversionLead] = useState<Lead | null>(null);
  const [responsibleFilter, setResponsibleFilter] = useState("todos");
  const [industryFilter, setIndustryFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("todas");

  const today = new Date().toISOString().slice(0, 10);
  const activeLeads = data.leads.filter((lead) => !["cliente ganado", "perdido"].includes(lead.stage));
  const pipelineTotal = activeLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const closeProbable = data.leads
    .filter((lead) => ["diagnostico agendado", "sesion inicial agendada", "propuesta enviada", "negociacion"].includes(lead.stage))
    .reduce((sum, lead) => sum + lead.estimatedValue * (lead.closeProbability / 100), 0);
  const followupsToday = activeLeads.filter((lead) => lead.lastInteraction === today).length;
  const openProposals = data.leads.filter((lead) => ["propuesta enviada", "negociacion"].includes(lead.stage));
  const staleLeads = activeLeads.filter((lead) => daysLate(lead.lastInteraction) >= 7);
  const wonLeads = data.leads.filter((lead) => lead.stage === "cliente ganado");
  const formLeads = data.leads.filter((lead) => lead.stage !== "perdido");
  const responsibleOptions = Array.from(new Set(data.leads.map((lead) => lead.assignedTo).filter(Boolean))) as string[];
  const industryOptions = Array.from(new Set(data.leads.map((lead) => leadIndustry(lead)).filter(Boolean)));
  const visibleLeads = data.leads.filter((lead) => {
    const matchesResponsible = responsibleFilter === "todos" || lead.assignedTo === responsibleFilter;
    const matchesIndustry = industryFilter === "todas" || leadIndustry(lead) === industryFilter;
    const matchesDate =
      dateFilter === "todas" ||
      (dateFilter === "hoy" && lead.lastInteraction === today) ||
      (dateFilter === "7" && daysLate(lead.lastInteraction) <= 7);
    return matchesResponsible && matchesIndustry && matchesDate;
  });
  const crmTabs: { id: CrmTab; label: string }[] = [
    { id: "pipeline", label: "Pipeline" },
    { id: "leads", label: "Leads" },
    { id: "clientes", label: "Clientes" },
    { id: "seguimientos", label: "Seguimientos" },
    { id: "formularios", label: "Formularios" },
    { id: "reportes", label: "Reportes" },
  ];

  const selectCrmTab = (nextTab: CrmTab) => {
    router.replace(`/crm?tab=${nextTab}`);
  };

  const copyLeadFormLink = async (leadId: string) => {
    const link = getLeadFormUrl(leadId);
    await navigator.clipboard.writeText(link);
    setCopiedLeadId(leadId);
    window.setTimeout(() => setCopiedLeadId(null), 1800);
  };

  const moveLeadThroughPipeline = (leadId: string, stage: LeadStage) => {
    const lead = data.leads.find((item) => item.id === leadId);
    if (!lead) return;
    if (stage === "cliente ganado" && !lead.convertedClientId) {
      setConversionLead(lead);
      return;
    }
    moveLead(leadId, stage);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-brand-charcoal/10 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">Leading Connections OS</Badge>
              <Badge>CRM consultivo</Badge>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-brand-charcoal sm:text-3xl">Pipeline comercial</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/60">
              Gestiona el proceso desde el primer contacto hasta cliente ganado, con Formulario 1, investigacion, diagnostico y propuesta en un flujo claro.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => selectCrmTab("formularios")}><FileCheck2 className="h-4 w-4" />Formularios</Button>
            <Button onClick={() => setShowForm((value) => !value)}><Plus className="h-4 w-4" />Nuevo lead</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Pipeline total" value={money(pipelineTotal)} detail={`${activeLeads.length} oportunidades activas`} tone="blue" />
        <Stat label="Cierre probable" value={money(closeProbable)} detail="Estimado este mes" tone="green" />
        <Stat label="Seguimientos hoy" value={`${followupsToday}`} detail="Actividad registrada hoy" tone="yellow" />
        <Stat label="Propuestas abiertas" value={`${openProposals.length}`} detail={money(openProposals.reduce((sum, lead) => sum + lead.estimatedValue, 0))} />
        <Stat label="Sin actividad" value={`${staleLeads.length}`} detail="Mas de 7 dias" tone={staleLeads.length ? "red" : "green"} />
      </div>

      <div className="rounded-lg border border-brand-charcoal/10 bg-white p-1 shadow-sm">
        <div className="flex gap-1 overflow-x-auto">
          {crmTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectCrmTab(item.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-brand-charcoal/55 transition hover:bg-brand-paper hover:text-brand-charcoal",
                tab === item.id && "bg-brand-navy text-white shadow-sm hover:bg-brand-navy hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-brand-charcoal/10 bg-white p-3 shadow-sm md:grid-cols-3">
        <Field label="Responsable">
          <Select value={responsibleFilter} onChange={(event) => setResponsibleFilter(event.currentTarget.value)}>
            <option value="todos">Todos los responsables</option>
            {responsibleOptions.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Industria">
          <Select value={industryFilter} onChange={(event) => setIndustryFilter(event.currentTarget.value)}>
            <option value="todas">Todas las industrias</option>
            {industryOptions.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Fecha">
          <Select value={dateFilter} onChange={(event) => setDateFilter(event.currentTarget.value)}>
            <option value="todas">Toda la actividad</option>
            <option value="hoy">Actividad de hoy</option>
            <option value="7">Ultimos 7 dias</option>
          </Select>
        </Field>
      </div>

      {showForm ? (
        <QuickLeadForm
          onSubmit={(lead) => {
            const leadId = addLead(lead);
            navigator.clipboard.writeText(getLeadFormUrl(leadId)).catch(() => {});
            setCreatedLeadLink(true);
            setShowForm(false);
            window.setTimeout(() => setCreatedLeadLink(false), 3500);
          }}
        />
      ) : null}

      {createdLeadLink ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Lead creado y formulario copiado.</p>
              <p className="mt-1 text-emerald-800">Envia el enlace al prospecto para iniciar la calificacion.</p>
            </div>
            <Button variant="secondary" onClick={() => selectCrmTab("formularios")}>Ver formularios</Button>
          </div>
        </div>
      ) : null}

      {tab === "pipeline" ? (
        <div className="grid gap-3 overflow-x-auto pb-2 xl:grid-cols-7">
          {crmPipelineColumns.map((column) => {
            const leads = visibleLeads.filter((lead) => column.stages.includes(lead.stage));
            const columnValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
            return (
              <section
                key={column.label}
                className="min-w-72 rounded-lg border border-brand-charcoal/10 bg-white/80 shadow-sm"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingLeadId) moveLeadThroughPipeline(draggingLeadId, column.target);
                  setDraggingLeadId(null);
                }}
              >
                <div className="border-b border-brand-charcoal/10 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-brand-charcoal">{column.label}</h2>
                      <p className="mt-0.5 text-xs text-brand-charcoal/45">{column.description}</p>
                    </div>
                    <Badge>{leads.length}</Badge>
                  </div>
                  <p className="mt-2 text-xs font-medium text-brand-charcoal/55">{money(columnValue)}</p>
                </div>
                <div className="min-h-80 space-y-3 p-3">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingLeadId(lead.id)}
                      onDragEnd={() => setDraggingLeadId(null)}
                      className="group w-full rounded-lg border border-brand-charcoal/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-gold/70 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <button type="button" onClick={() => setEditingLead(lead)} className="block max-w-full text-left">
                            <h3 className="truncate text-sm font-semibold text-brand-charcoal hover:text-brand-navy">{lead.company}</h3>
                          </button>
                          <p className="mt-1 truncate text-xs text-brand-charcoal/50">{leadIndustry(lead)} - {lead.contactName}</p>
                        </div>
                        <GripVertical className="h-4 w-4 shrink-0 text-brand-charcoal/25 transition group-hover:text-brand-charcoal/50" />
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-5 text-brand-charcoal/68">{leadPain(lead)}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-brand-paper p-2">
                          <p className="text-[10px] font-semibold uppercase text-brand-charcoal/40">Valor</p>
                          <p className="mt-1 text-sm font-semibold text-brand-charcoal">{money(lead.estimatedValue)}</p>
                        </div>
                        <div className="rounded-md bg-brand-paper p-2">
                          <p className="text-[10px] font-semibold uppercase text-brand-charcoal/40">Prob.</p>
                          <p className="mt-1 text-sm font-semibold text-brand-charcoal">{lead.closeProbability}%</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone={leadFitTone(lead)}>Fit {leadFitLabel(lead)}</Badge>
                        <Badge tone={lead.intake ? "green" : "yellow"}>{lead.intake ? "F1 recibido" : "F1 pendiente"}</Badge>
                      </div>
                      <div className="mt-4 border-t border-brand-charcoal/10 pt-3">
                        <p className="text-[10px] font-semibold uppercase text-brand-charcoal/40">Proxima accion</p>
                        <p className="mt-1 text-xs leading-5 text-brand-charcoal/65">{lead.nextStep}</p>
                        <p className="mt-2 text-xs text-brand-charcoal/40">Ultima actividad: {shortDate(lead.lastInteraction)}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="ghost" onClick={() => setEditingLead(lead)}>Editar</Button>
                        {lead.stage === "sesion inicial agendada" ? (
                          <Link
                            href={`/sesion/lead/${lead.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-medium text-white shadow-sm shadow-brand-navy/20"
                          >
                            <Video className="h-4 w-4" />
                            Iniciar sesion
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {!leads.length ? (
                    <div className="rounded-lg border border-dashed border-brand-mist p-5 text-center text-sm text-brand-charcoal/45">Sin oportunidades en esta etapa</div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {tab === "leads" ? (
        <Panel>
          <PanelHeader title="Leads" description="Vista tipo base de datos para editar valores principales sin salir del CRM." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Etapa</th>
                  <th className="px-5 py-3">Dolor</th>
                  <th className="px-5 py-3">Paquete</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Prob.</th>
                  <th className="px-5 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-gold/10">
                    <td className="px-5 py-4"><TextInput className="min-w-44" defaultValue={lead.company} onBlur={(event) => updateLead(lead.id, { company: event.currentTarget.value })} /></td>
                    <td className="px-5 py-4"><TextInput className="min-w-40" defaultValue={lead.contactName} onBlur={(event) => updateLead(lead.id, { contactName: event.currentTarget.value })} /></td>
                    <td className="px-5 py-4">
                      <Select
                        className="min-w-48"
                        value={lead.stage}
                        onChange={(event) => moveLeadThroughPipeline(lead.id, event.currentTarget.value as LeadStage)}
                      >
                        {leadStages.map((item) => <option key={item}>{item}</option>)}
                      </Select>
                    </td>
                    <td className="px-5 py-4 max-w-72 text-brand-charcoal/65">{leadPain(lead)}</td>
                    <td className="px-5 py-4">
                      <Select className="min-w-56" value={lead.recommendedPackage ?? ""} onChange={(event) => updateLead(lead.id, { recommendedPackage: event.currentTarget.value ? (event.currentTarget.value as PackageType) : undefined })}>
                        <option value="">Por definir</option>
                        {consultingPackages.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                      </Select>
                    </td>
                    <td className="px-5 py-4"><TextInput className="w-32" type="number" defaultValue={lead.estimatedValue} onBlur={(event) => updateLead(lead.id, { estimatedValue: Number(event.currentTarget.value) })} /></td>
                    <td className="px-5 py-4"><TextInput className="w-20" type="number" min="0" max="100" defaultValue={lead.closeProbability} onBlur={(event) => updateLead(lead.id, { closeProbability: Number(event.currentTarget.value) })} /></td>
                    <td className="px-5 py-4"><Button variant="ghost" onClick={() => setEditingLead(lead)}>Abrir</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {tab === "clientes" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wonLeads.map((lead) => (
            <Link key={lead.id} href={lead.convertedClientId ? `/clientes/${lead.convertedClientId}` : "/clientes"} className="rounded-lg border border-brand-charcoal/10 bg-white p-5 shadow-sm transition hover:border-brand-gold hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-semibold text-brand-charcoal">{lead.company}</h3><p className="mt-1 text-sm text-brand-charcoal/55">{lead.contactName}</p></div>
                <Badge tone="green">Ganado</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-charcoal/65">{leadPain(lead)}</p>
              <div className="mt-4 flex flex-wrap gap-2"><Badge>{money(lead.estimatedValue)}</Badge><Badge>{lead.recommendedPackage ?? "Sin paquete"}</Badge></div>
            </Link>
          ))}
          {!wonLeads.length ? <ActionEmptyState icon={<Users className="h-5 w-5" />} title="Sin clientes ganados desde CRM" detail="Cuando una oportunidad llegue a Cliente ganado se creara el expediente automaticamente." /> : null}
        </div>
      ) : null}

      {tab === "seguimientos" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[...activeLeads].sort((a, b) => b.lastInteraction.localeCompare(a.lastInteraction)).map((lead) => (
            <button key={lead.id} onClick={() => setEditingLead(lead)} className="rounded-lg border border-brand-charcoal/10 bg-white p-5 text-left shadow-sm transition hover:border-brand-gold hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-semibold text-brand-charcoal">{lead.company}</h3><p className="mt-1 text-sm text-brand-charcoal/55">{lead.contactName} - {leadIndustry(lead)}</p></div>
                <Badge tone={daysLate(lead.lastInteraction) >= 7 ? "red" : "blue"}>{shortDate(lead.lastInteraction)}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-charcoal/70">{lead.nextStep}</p>
            </button>
          ))}
        </div>
      ) : null}

      {tab === "formularios" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {formLeads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-brand-charcoal/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-semibold text-brand-charcoal">{lead.company}</h3><p className="mt-1 text-sm text-brand-charcoal/55">Formulario inicial</p></div>
                <Badge tone={lead.intake ? "green" : "yellow"}>{lead.intake ? "Recibido" : "Pendiente"}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-charcoal/65">{lead.intake?.mainProblem ?? "Aun no responde el filtro inicial."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => copyLeadFormLink(lead.id)}><Copy className="h-4 w-4" />{copiedLeadId === lead.id ? "Copiado" : "Copiar formulario"}</Button>
                <Link href={getLeadFormPath(lead.id)} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-mist bg-white px-3 text-sm font-medium text-brand-charcoal hover:border-brand-gold"><ExternalLink className="h-4 w-4" />Abrir</Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "reportes" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel><PanelHeader title="Conversion" description="Salud del embudo" /><div className="space-y-3 p-5"><Stat label="Activos" value={`${activeLeads.length}`} detail="Leads en proceso" /><Stat label="Ganados" value={`${wonLeads.length}`} detail="Clientes convertidos" tone="green" /></div></Panel>
          <Panel><PanelHeader title="Valor por etapa" description="Pipeline comercial" /><div className="space-y-3 p-5">{crmPipelineColumns.map((column) => <div key={column.label} className="flex items-center justify-between gap-3 text-sm"><span className="text-brand-charcoal/65">{column.label}</span><span className="font-semibold text-brand-charcoal">{money(data.leads.filter((lead) => column.stages.includes(lead.stage)).reduce((sum, lead) => sum + lead.estimatedValue, 0))}</span></div>)}</div></Panel>
          <Panel><PanelHeader title="Riesgos" description="Acciones que requieren atencion" /><div className="space-y-3 p-5"><Stat label="Sin actividad" value={`${staleLeads.length}`} detail="Mas de 7 dias" tone={staleLeads.length ? "red" : "green"} /><Stat label="F1 pendientes" value={`${data.leads.filter((lead) => !lead.intake && lead.stage !== "perdido").length}`} detail="Esperando respuesta" tone="yellow" /></div></Panel>
        </div>
      ) : null}

      {editingLead ? (
        <LeadEditor
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(patch) => {
            updateLead(editingLead.id, patch);
            setEditingLead(null);
          }}
        />
      ) : null}

      {conversionLead ? (
        <LeadConversionModal
          lead={conversionLead}
          onClose={() => setConversionLead(null)}
          onConfirm={(patch) => {
            updateLead(conversionLead.id, patch);
            moveLead(conversionLead.id, "cliente ganado");
            setConversionLead(null);
          }}
        />
      ) : null}
    </div>
  );
}

function LeadConversionModal({
  lead,
  onClose,
  onConfirm,
}: {
  lead: Lead;
  onClose: () => void;
  onConfirm: (patch: Partial<Lead>) => void;
}) {
  const [step, setStep] = useState(1);
  const [packageName, setPackageName] = useState<PackageType>(lead.recommendedPackage ?? consultingPackages[1].name);
  const packageData = consultingPackages.find((item) => item.name === packageName) ?? consultingPackages[1];
  const [price, setPrice] = useState(lead.estimatedValue || packageData.price);
  const [nextProject, setNextProject] = useState(`Proyecto LEAD - ${lead.company}`);
  const steps = ["Expediente", "Paquete", "Acuerdo", "Proyecto"];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-charcoal/60 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="border-b border-brand-mist px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone="green">Cliente ganado</Badge>
              <h2 className="mt-2 text-lg font-semibold text-brand-charcoal">Convertir {lead.company} a cliente</h2>
              <p className="mt-1 text-sm text-brand-charcoal/60">Se creara el expediente empresarial y quedara listo para Acuerdo de Claridad.</p>
            </div>
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {steps.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => setStep(index + 1)}
                className={cn(
                  "rounded-md border px-2 py-2 text-xs font-semibold",
                  step === index + 1 ? "border-brand-navy bg-brand-navy text-white" : "border-brand-mist bg-brand-paper text-brand-charcoal/60",
                )}
              >
                {index + 1}. {item}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-80 p-5">
          {step === 1 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <ConversionFact label="Empresa" value={lead.company} />
              <ConversionFact label="Contacto" value={`${lead.contactName}${lead.contactRole ? ` - ${lead.contactRole}` : ""}`} />
              <ConversionFact label="Industria" value={leadIndustry(lead)} />
              <ConversionFact label="Responsable LC" value={lead.assignedTo ?? "Luis Carlos Aguirre"} />
              <div className="md:col-span-2"><ConversionFact label="Dolor principal" value={leadPain(lead)} /></div>
              <div className="md:col-span-2"><ConversionFact label="Resultado deseado" value={lead.intake?.expectedResult ?? lead.desiredOutcome ?? "Pendiente de documentar"} /></div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Paquete contratado">
                <Select value={packageName} onChange={(event) => {
                  const next = event.currentTarget.value as PackageType;
                  setPackageName(next);
                  setPrice(consultingPackages.find((item) => item.name === next)?.price ?? price);
                }}>
                  {consultingPackages.map((item) => <option key={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label="Precio acordado"><TextInput type="number" value={price} onChange={(event) => setPrice(Number(event.currentTarget.value))} /></Field>
              <div className="rounded-lg border border-brand-mist bg-brand-paper p-4 md:col-span-2">
                <p className="text-sm font-semibold text-brand-charcoal">{packageData.duration}</p>
                <p className="mt-2 text-sm leading-6 text-brand-charcoal/65">{packageData.description}</p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <ActionEmptyState
                icon={<FileCheck2 className="h-5 w-5" />}
                title="Acuerdo de Claridad preparado"
                detail="En Sprint 3 se conectara IA y PDF. Por ahora se guarda el expediente con los datos necesarios para generarlo."
              />
              <div className="grid gap-3 md:grid-cols-3">
                <ConversionFact label="Base" value={lead.discovery?.rootProblem ?? leadPain(lead)} />
                <ConversionFact label="Paquete" value={packageName} />
                <ConversionFact label="Valor" value={money(price)} />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <Field label="Primer proyecto sugerido"><TextInput value={nextProject} onChange={(event) => setNextProject(event.currentTarget.value)} /></Field>
              <div className="grid gap-3 md:grid-cols-4">
                {["L - Listen", "E - Evaluate", "A - Act", "D - Develop"].map((item) => (
                  <div key={item} className="rounded-lg border border-brand-mist bg-white p-4 text-center text-sm font-semibold text-brand-charcoal">{item}</div>
                ))}
              </div>
              <p className="text-sm leading-6 text-brand-charcoal/60">
                El expediente se crea ahora. El proyecto formal queda bloqueado hasta tener Acuerdo de Claridad firmado, como regla operativa de LC.
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex justify-between border-t border-brand-mist px-5 py-4">
          <Button variant="secondary" disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))}>Anterior</Button>
          {step < 4 ? (
            <Button onClick={() => setStep((value) => Math.min(4, value + 1))}>Siguiente</Button>
          ) : (
            <Button onClick={() => onConfirm({
              recommendedPackage: packageName,
              estimatedValue: price,
              nextStep: `Generar Acuerdo de Claridad y preparar ${nextProject}`,
            })}>
              <CheckCircle2 className="h-4 w-4" />
              Crear expediente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversionFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-mist bg-brand-paper p-4">
      <p className="text-[11px] font-semibold uppercase text-brand-charcoal/45">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-brand-charcoal">{value}</p>
    </div>
  );
}

function QuickLeadForm({
  onSubmit,
}: {
  onSubmit: (lead: Omit<Lead, "id" | "lastInteraction">) => void;
}) {
  const sources = ["Manual", "Referido", "LinkedIn", "Redes sociales", "Landing page", "Base de datos", "B2B", "Evento"];
  const areas = ["Comercial", "Operaciones", "Finanzas", "Marketing", "Servicio al cliente", "Liderazgo", "Digital"];
  const responsibles = ["Luis Carlos Aguirre", "Mayte", "Laura Cardenas"];

  return (
    <Panel className="mb-6">
      <PanelHeader
        title="Nuevo lead"
        description="Captura la oportunidad, crea el lead y copia el link del Formulario 1 para enviarlo al prospecto."
      />
      <form
        className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const source = String(form.get("source") || "Manual");
          const industry = String(form.get("industry") || "");
          const mainProblem = String(form.get("mainProblem") || "");
          const desiredOutcome = String(form.get("desiredOutcome") || "");
          const budget = String(form.get("budget") || "evaluando") as "definido" | "evaluando" | "sin presupuesto";
          const urgency = String(form.get("urgency") || "media") as "baja" | "media" | "alta";
          const fit =
            budget === "definido" && urgency !== "baja"
              ? "verde"
              : budget === "sin presupuesto"
                ? "rojo"
                : "amarillo";

          onSubmit({
            company: String(form.get("company") || "Prospecto sin empresa"),
            contactName: String(form.get("contactName") || "Contacto pendiente"),
            contactRole: String(form.get("contactRole") || ""),
            email: String(form.get("email") || ""),
            phone: String(form.get("phone") || ""),
            stage: "formulario 1 enviado",
            estimatedValue: Number(form.get("estimatedValue") || 0),
            closeProbability: Number(form.get("closeProbability") || 15),
            nextStep: String(form.get("nextStep") || "Esperar respuesta del Formulario 1 LC"),
            source,
            industry,
            city: String(form.get("city") || ""),
            affectedArea: String(form.get("affectedArea") || ""),
            urgency,
            budget,
            decisionMaker: String(form.get("decisionMaker") || ""),
            desiredOutcome,
            assignedTo: String(form.get("assignedTo") || "Luis Carlos Aguirre"),
            intake: {
              industry,
              yearsOperating: 0,
              howFoundUs: source,
              mainProblem,
              expectedResult: desiredOutcome,
              previousConsulting: "no",
              budgetAvailable: budget,
              willingToParticipate: "sí",
              internalFlag: fit,
            },
          });
        }}
      >
        <Field label="Empresa o proyecto"><TextInput name="company" required /></Field>
        <Field label="Responsable / contacto"><TextInput name="contactName" required /></Field>
        <Field label="Puesto"><TextInput name="contactRole" placeholder="Director, gerente, fundador..." /></Field>
        <Field label="Correo"><TextInput name="email" type="email" /></Field>
        <Field label="WhatsApp"><TextInput name="phone" placeholder="+52 ..." /></Field>
        <Field label="Ciudad"><TextInput name="city" placeholder="Chihuahua, El Paso..." /></Field>
        <Field label="Industria"><TextInput name="industry" placeholder="Manufactura, salud, retail..." /></Field>
        <Field label="Origen del lead"><Select name="source" defaultValue="Manual">{sources.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Area afectada"><Select name="affectedArea" defaultValue="Operaciones">{areas.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Urgencia"><Select name="urgency" defaultValue="media"><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></Select></Field>
        <Field label="Presupuesto"><Select name="budget" defaultValue="evaluando"><option value="definido">Definido</option><option value="evaluando">Evaluando</option><option value="sin presupuesto">Sin presupuesto</option></Select></Field>
        <Field label="Quien decide"><TextInput name="decisionMaker" placeholder="Direccion, socios, comite..." /></Field>
        <Field label="Responsable interno"><Select name="assignedTo" defaultValue="Luis Carlos Aguirre">{responsibles.map((item) => <option key={item}>{item}</option>)}</Select></Field>
        <Field label="Valor estimado"><TextInput name="estimatedValue" type="number" min="0" defaultValue={0} /></Field>
        <Field label="Probabilidad inicial"><TextInput name="closeProbability" type="number" min="0" max="100" defaultValue={15} /></Field>
        <div className="xl:col-span-3"><Field label="Problema principal"><TextArea name="mainProblem" placeholder="Que duele hoy en la empresa..." /></Field></div>
        <div className="xl:col-span-3"><Field label="Resultado deseado"><TextArea name="desiredOutcome" placeholder="Que resultado quiere ver en 30, 60 o 90 dias..." /></Field></div>
        <div className="xl:col-span-3"><Field label="Proxima accion"><TextInput name="nextStep" defaultValue="Enviar Formulario 1 LC y validar fit inicial" /></Field></div>
        <div className="flex justify-end gap-2 md:col-span-2 xl:col-span-3">
          <Button>
            <Send className="h-4 w-4" />
            Crear lead y copiar link
          </Button>
        </div>
      </form>
    </Panel>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LeadIntakeForm({
  onSubmit,
}: {
  onSubmit: (lead: Omit<Lead, "id" | "lastInteraction">) => void;
}) {
  const [budget, setBudget] = useState("evaluando");
  const [participation, setParticipation] = useState("sí");
  const blocked = budget === "sin presupuesto";

  return (
    <Panel className="mb-6">
      <PanelHeader title="Filtro inicial LC Ops" description="Quién lo llena: prospecto antes de la primera sesión. Objetivo: determinar fit." />
      <form
        className="grid gap-4 p-5 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          if (blocked) return;
          const flag =
            budget === "definido" && participation === "sí"
              ? "verde"
              : budget === "evaluando" || participation === "prefiere delegar"
                ? "amarillo"
                : "rojo";
          onSubmit({
            company: String(form.get("empresa")),
            contactName: String(form.get("nombre_completo")),
            email: String(form.get("email")),
            phone: String(form.get("phone")),
            stage: "nuevo lead",
            estimatedValue: Number(form.get("estimatedValue")),
            closeProbability: 30,
            nextStep: "Revisar fit y agendar sesión de descubrimiento",
            source: String(form.get("como_nos_conociste") || "Manual"),
            recommendedPackage: String(form.get("recommendedPackage")) as PackageType,
            intake: {
              yearsOperating: Number(form.get("años_operando")),
              howFoundUs: String(form.get("como_nos_conociste") || "Otro"),
              mainProblem: String(form.get("problema_principal")),
              expectedResult: String(form.get("resultado_esperado")),
              previousConsulting: String(form.get("experiencia_previa")) as "sí" | "no",
              previousExperienceNotes: String(form.get("experiencia_previa_notas") || ""),
              budgetAvailable: budget as "definido" | "evaluando" | "sin presupuesto",
              willingToParticipate: participation as "sí" | "prefiere delegar",
              internalFlag: flag,
            },
          });
        }}
      >
        <Field label="Nombre completo"><TextInput name="nombre_completo" required /></Field>
        <Field label="Empresa o proyecto"><TextInput name="empresa" required /></Field>
        <Field label="Email"><TextInput name="email" type="email" required /></Field>
        <Field label="Teléfono"><TextInput name="phone" required /></Field>
        <Field label="Industria">
          <Select name="industria" required>
            {["Manufactura", "Logística", "Retail", "Servicios", "Tecnología", "Salud", "Educación", "Otro"].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Años operando"><TextInput name="años_operando" type="number" min="0" required /></Field>
        <Field label="Cómo conociste LC">
          <Select name="como_nos_conociste">
            {["Referido", "Redes sociales", "LinkedIn", "Búsqueda en internet", "Evento", "Otro"].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Valor estimado"><TextInput name="estimatedValue" type="number" required /></Field>
        <div className="md:col-span-2">
          <Field label="Principal problema o reto"><TextArea name="problema_principal" required maxLength={1800} /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Resultado esperado en 3 meses"><TextArea name="resultado_esperado" required maxLength={1200} /></Field>
        </div>
        <Field label="Experiencia previa con consultora">
          <Select name="experiencia_previa" required>
            <option value="no">No</option>
            <option value="sí">Sí</option>
          </Select>
        </Field>
        <Field label="Qué funcionó y qué no funcionó"><TextInput name="experiencia_previa_notas" /></Field>
        <Field label="Presupuesto disponible">
          <Select value={budget} onChange={(event) => setBudget(event.target.value)}>
            <option value="definido">Sí, tengo presupuesto definido</option>
            <option value="evaluando">Estoy evaluando opciones y costos</option>
            <option value="sin presupuesto">No tengo presupuesto asignado aún</option>
          </Select>
        </Field>
        <Field label="Participación activa">
          <Select value={participation} onChange={(event) => setParticipation(event.target.value)}>
            <option value="sí">Sí, entiendo que mi participación es parte del resultado</option>
            <option value="prefiere delegar">Prefiero delegar completamente y recibir resultados</option>
          </Select>
        </Field>
        <Field label="Paquete recomendado por LC">
          <Select name="recommendedPackage">
            {consultingPackages.map((item) => <option key={item.id}>{item.name}</option>)}
          </Select>
        </Field>
        <div className="md:col-span-2">
          {blocked ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              En este momento LC trabaja con empresas que tienen presupuesto asignado para consultoría.
            </div>
          ) : participation === "prefiere delegar" ? (
            <div className="rounded-md border border-brand-gold/50 bg-brand-gold/10 p-3 text-sm text-brand-charcoal">
              Bandera amarilla: el modelo LC requiere participación activa del cliente.
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2"><Button disabled={blocked}>Solicitar sesión de descubrimiento</Button></div>
      </form>
    </Panel>
  );
}

function LeadEditor({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead;
  onClose: () => void;
  onSave: (patch: Partial<Lead>) => void;
}) {
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [company, setCompany] = useState(lead.company);
  const [contactName, setContactName] = useState(lead.contactName);
  const [contactRole, setContactRole] = useState(lead.contactRole ?? "");
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);
  const [industry, setIndustry] = useState(lead.intake?.industry ?? lead.industry ?? "");
  const [city, setCity] = useState(lead.city ?? "");
  const [affectedArea, setAffectedArea] = useState(lead.affectedArea ?? "");
  const [urgency, setUrgency] = useState<"baja" | "media" | "alta">(lead.urgency ?? "media");
  const [budget, setBudget] = useState<"definido" | "evaluando" | "sin presupuesto">(lead.budget ?? lead.intake?.budgetAvailable ?? "evaluando");
  const [decisionMaker, setDecisionMaker] = useState(lead.decisionMaker ?? "");
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo ?? "Luis Carlos Aguirre");
  const [estimatedValue, setEstimatedValue] = useState(lead.estimatedValue);
  const [nextStep, setNextStep] = useState(lead.nextStep);
  const [mainProblem, setMainProblem] = useState(lead.intake?.mainProblem ?? "");
  const [expectedResult, setExpectedResult] = useState(lead.intake?.expectedResult ?? "");
  const [recommendedPackage, setRecommendedPackage] = useState<PackageType | undefined>(lead.recommendedPackage);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-charcoal/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-mist px-5 py-4">
          <div>
            <h2 className="font-semibold text-brand-charcoal">{lead.company}</h2>
            <p className="text-sm text-brand-charcoal/60">Editar lead y expediente inicial</p>
          </div>
          <div className="flex items-center gap-2">
            {lead.stage === "sesion inicial agendada" ? (
              <Link
                href={`/sesion/lead/${lead.id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-medium text-white shadow-sm shadow-brand-navy/20"
              >
                <Video className="h-4 w-4" />
                Iniciar sesion
              </Link>
            ) : null}
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="rounded-lg border border-brand-mist bg-brand-paper p-3 md:col-span-2">
            <p className="text-sm font-semibold text-brand-charcoal">Link del filtro inicial</p>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
              <p className="flex-1 text-sm text-brand-charcoal/70">Enlace privado listo para compartir con el prospecto.</p>
              <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(getLeadFormUrl(lead.id))}>
                <Copy className="h-4 w-4" />
                Copiar link
              </Button>
              <Link
                href={getLeadFormPath(lead.id)}
                target="_blank"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-mist bg-white px-3 text-sm font-medium text-brand-charcoal"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir
              </Link>
            </div>
          </div>
          <Field label="Empresa"><TextInput value={company} onChange={(event) => setCompany(event.target.value)} /></Field>
          <Field label="Contacto"><TextInput value={contactName} onChange={(event) => setContactName(event.target.value)} /></Field>
          <Field label="Puesto"><TextInput value={contactRole} onChange={(event) => setContactRole(event.target.value)} /></Field>
          <Field label="Email"><TextInput value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <Field label="Teléfono"><TextInput value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
          <Field label="Industria"><TextInput value={industry} onChange={(event) => setIndustry(event.target.value)} /></Field>
          <Field label="Ciudad"><TextInput value={city} onChange={(event) => setCity(event.target.value)} /></Field>
          <Field label="Area afectada"><TextInput value={affectedArea} onChange={(event) => setAffectedArea(event.target.value)} /></Field>
          <Field label="Urgencia">
            <Select value={urgency} onChange={(event) => setUrgency(event.currentTarget.value as "baja" | "media" | "alta")}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </Select>
          </Field>
          <Field label="Presupuesto">
            <Select value={budget} onChange={(event) => setBudget(event.currentTarget.value as "definido" | "evaluando" | "sin presupuesto")}>
              <option value="definido">Definido</option>
              <option value="evaluando">Evaluando</option>
              <option value="sin presupuesto">Sin presupuesto</option>
            </Select>
          </Field>
          <Field label="Quien decide"><TextInput value={decisionMaker} onChange={(event) => setDecisionMaker(event.target.value)} /></Field>
          <Field label="Responsable LC"><TextInput value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} /></Field>
          <Field label="Valor estimado"><TextInput type="number" value={estimatedValue} onChange={(event) => setEstimatedValue(Number(event.target.value))} /></Field>
          <Field label="Paquete recomendado">
            <Select value={recommendedPackage} onChange={(event) => setRecommendedPackage(event.target.value as PackageType)}>
              {consultingPackages.map((item) => <option key={item.id}>{item.name}</option>)}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Próximo paso"><TextInput value={nextStep} onChange={(event) => setNextStep(event.target.value)} /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Problema principal"><TextArea value={mainProblem} onChange={(event) => setMainProblem(event.target.value)} /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Resultado esperado"><TextArea value={expectedResult} onChange={(event) => setExpectedResult(event.target.value)} /></Field>
          </div>
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-brand-charcoal/80">Proceso</p>
            <div className="flex flex-wrap gap-2">
              {leadStages.filter((item) => item !== "cliente ganado").map((item) => (
                <Button key={item} variant={stage === item ? "primary" : "secondary"} onClick={() => setStage(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onSave({
              company,
              contactName,
              contactRole,
              email,
              phone,
              industry,
              city,
              affectedArea,
              urgency,
              budget,
              decisionMaker,
              assignedTo,
              desiredOutcome: expectedResult,
              estimatedValue,
              nextStep,
              stage,
              recommendedPackage,
              intake: {
                ...(lead.intake ?? {
                  yearsOperating: 0,
                  howFoundUs: lead.source,
                  previousConsulting: "no",
                  budgetAvailable: "evaluando",
                  willingToParticipate: "sí",
                  internalFlag: "amarillo",
                }),
                industry,
                budgetAvailable: budget,
                mainProblem,
                expectedResult,
              },
            })}>Guardar cambios</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicLeadFormScreen() {
  const { id } = useParams<{ id: string }>();
  const { data, updateLead, isReady } = useStore();
  const lead = data.leads.find((item) => item.id === id);
  const [budget, setBudget] = useState<"definido" | "evaluando" | "sin presupuesto">(
    lead?.intake?.budgetAvailable ?? "evaluando",
  );
  const [participation, setParticipation] = useState<"sí" | "prefiere delegar">(
    lead?.intake?.willingToParticipate ?? "sí",
  );
  const [previousConsulting, setPreviousConsulting] = useState<"no" | "sí">(
    lead?.intake?.previousConsulting ?? "no",
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isReady) return <main className="min-h-screen bg-brand-paper" />;

  if (!lead) {
    return (
      <main className="min-h-screen bg-brand-paper px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Formulario no encontrado"
            detail="Revisa que el link sea correcto o solicita un nuevo enlace al equipo LC."
          />
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-brand-navy px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
          <Image src="/brand/full-white.png" alt="Leading Connections" width={360} height={106} className="h-auto w-72 max-w-full" />
          <div className="mt-10 rounded-lg border border-white/15 bg-white/10 p-8">
            <CheckCircle2 className="mx-auto h-10 w-10 text-brand-gold" />
            <h1 className="mt-5 text-3xl font-semibold">Gracias por compartir esto con nosotros.</h1>
            <p className="mt-4 leading-7 text-brand-mist">
              Revisaremos tu información y si hay fit, nos pondremos en contacto contigo en menos de 48 horas para agendar tu sesión de descubrimiento.
            </p>
            <p className="mt-6 text-sm text-brand-gold">Equipo LC Leading Connections</p>
          </div>
        </div>
      </main>
    );
  }

  const noBudget = budget === "sin presupuesto";

  return (
    <main className="min-h-screen bg-brand-paper text-brand-charcoal">
      <section className="bg-brand-navy px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <Image src="/brand/full-white.png" alt="Leading Connections" width={330} height={98} className="h-auto w-72 max-w-full" priority />
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-semibold text-brand-gold">LC Leading Connections</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Cuéntanos sobre tu negocio</h1>
            <p className="mt-5 leading-7 text-brand-mist">
              Este formulario nos ayuda a entender tu negocio y el reto que enfrentas antes de nuestra primera conversación.
              No hay respuestas correctas o incorrectas; solo queremos conocer tu realidad tal como es.
            </p>
            <p className="mt-4 text-sm text-brand-gold">Tiempo estimado: 5 minutos</p>
          </div>
        </div>
      </section>

      <form
        className="mx-auto grid max-w-4xl gap-6 px-5 py-8"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const howFoundUs = String(form.get("howFoundUs") || "Otro");
          const operatingTime = String(form.get("operatingTime") || "");
          const flag = noBudget ? "rojo" : participation === "prefiere delegar" || budget === "evaluando" ? "amarillo" : "verde";
          updateLead(lead.id, {
            company: String(form.get("company")),
            contactName: String(form.get("contactName")),
            email: String(form.get("email")),
            phone: String(form.get("phone")),
            source: howFoundUs,
            stage: noBudget ? "perdido" : "investigacion en progreso",
            closeProbability: flag === "verde" ? 45 : flag === "amarillo" ? 25 : 5,
            nextStep: noBudget
              ? "Sin presupuesto disponible. Recontactar cuando exista disposición de inversión."
              : "Revisar filtro inicial y responder en menos de 48 horas.",
            intake: {
              industry: String(form.get("industry")),
              yearsOperating: yearsFromOperatingTime(operatingTime),
              operatingTime,
              howFoundUs,
              mainProblem: String(form.get("mainProblem")),
              expectedResult: String(form.get("expectedResult")),
              previousConsulting,
              attemptedResolution: String(form.get("attemptedResolution") || ""),
              previousExperienceNotes: String(form.get("previousExperienceNotes") || ""),
              budgetAvailable: budget,
              willingToParticipate: participation,
              internalFlag: flag,
            },
          });
          setSubmitted(true);
        }}
      >
        <Panel>
          <PanelHeader title="1. ¿Quién eres?" description="Cuéntanos un poco sobre ti y tu negocio." />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Nombre completo *"><TextInput name="contactName" defaultValue={lead.contactName} required /></Field>
            <Field label="Nombre de tu empresa o proyecto *"><TextInput name="company" defaultValue={lead.company} required /></Field>
            <Field label="Industria *">
              <Select name="industry" defaultValue={lead.intake?.industry ?? ""} required>
                <option value="" disabled>Selecciona una opción</option>
                {["Manufactura e industria", "Logística y transporte", "Retail y comercio", "Servicios profesionales", "Salud y bienestar", "Tecnología", "Educación", "Construcción y arquitectura", "Alimentos y bebidas", "Moda y estilo de vida", "Otro"].map((item) => <option key={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Tiempo operando *">
              <Select name="operatingTime" defaultValue={lead.intake?.operatingTime ?? ""} required>
                <option value="" disabled>Selecciona una opción</option>
                {["Todavía es una idea, aún no opera", "Menos de 1 año", "Entre 1 y 3 años", "Entre 3 y 5 años", "Más de 5 años"].map((item) => <option key={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="¿Cómo nos conociste?">
              <Select name="howFoundUs" defaultValue={lead.intake?.howFoundUs ?? lead.source}>
                {["Me lo recomendó alguien", "Redes sociales", "LinkedIn", "Búsqueda en internet", "Evento o exposición", "Otro"].map((item) => <option key={item}>{item}</option>)}
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="2. Tu reto actual" description="Escribe con tus propias palabras lo que está pasando hoy." />
          <div className="grid gap-4 p-5">
            <Field label="¿Cuál es el principal problema o reto que enfrenta tu negocio hoy? *">
              <TextArea name="mainProblem" defaultValue={lead.intake?.mainProblem} required />
            </Field>
            <Field label="¿Qué resultado concreto quieres lograr en los próximos 3 meses? *">
              <TextArea name="expectedResult" defaultValue={lead.intake?.expectedResult} required />
            </Field>
            <Field label="¿Han intentado resolver este problema antes? *">
              <Select value={previousConsulting} onChange={(event) => setPreviousConsulting(event.target.value as "no" | "sí")}>
                <option value="no">No, es la primera vez que buscamos ayuda</option>
                <option value="sí">Sí, ya intentamos resolverlo</option>
              </Select>
            </Field>
            {previousConsulting === "sí" ? (
              <Field label="¿Qué intentaron y por qué no funcionó?">
                <TextArea name="previousExperienceNotes" defaultValue={lead.intake?.previousExperienceNotes} />
              </Field>
            ) : null}
            <input type="hidden" name="attemptedResolution" value={previousConsulting} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="3. Compatibilidad" description="Estas preguntas nos ayudan a saber si podemos trabajar bien juntos." />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="¿Tienes presupuesto asignado para trabajar con una consultora? *">
              <Select value={budget} onChange={(event) => setBudget(event.target.value as typeof budget)}>
                <option value="definido">Sí, tengo presupuesto definido para esto</option>
                <option value="evaluando">Estoy evaluando cuánto invertir</option>
                <option value="sin presupuesto">Aún no tengo presupuesto asignado</option>
              </Select>
            </Field>
            <Field label="¿Estás dispuesto a participar activamente en el proceso? *">
              <Select value={participation} onChange={(event) => setParticipation(event.target.value as typeof participation)}>
                <option value="sí">Sí, entiendo que mi participación es parte del resultado</option>
                <option value="prefiere delegar">Prefiero delegar completamente y recibir resultados terminados</option>
              </Select>
            </Field>
            {noBudget ? (
              <div className="md:col-span-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                En este momento LC trabaja con empresas que tienen presupuesto disponible para consultoría. Guardaremos tu información para retomarla cuando estés en esa etapa.
              </div>
            ) : participation === "prefiere delegar" ? (
              <div className="md:col-span-2 rounded-md border border-brand-gold/50 bg-brand-gold/10 p-3 text-sm text-brand-charcoal">
                Nota interna: este lead quedará con bandera amarilla porque el modelo LC requiere participación activa.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="4. Para cerrar" description="Solo un par de datos para poder contactarte." />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Correo electrónico *"><TextInput name="email" type="email" defaultValue={lead.email} required /></Field>
            <Field label="WhatsApp *"><TextInput name="phone" defaultValue={lead.phone} placeholder="+52 656 123 4567" required /></Field>
            <div className="md:col-span-2">
              <Button className="w-full md:w-auto">
                <Send className="h-4 w-4" />
                Enviar formulario
              </Button>
            </div>
          </div>
        </Panel>
      </form>
    </main>
  );
}

export function SessionModeScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateLead, moveLead, isReady } = useStore();
  const lead = data.leads.find((item) => item.id === id);
  const [discovery, setDiscovery] = useState<DiscoveryForm>(() => ({ ...emptyDiscovery(), ...(lead?.discovery ?? {}) }));
  const [saved, setSaved] = useState(false);

  if (!isReady) return <main className="min-h-screen bg-brand-paper" />;

  if (!lead) {
    return (
      <main className="min-h-screen bg-brand-paper px-5 py-8">
        <div className="mx-auto max-w-2xl">
          <EmptyState title="Sesion no encontrada" detail="Regresa al CRM y abre la sesion desde la ficha del lead." />
          <Button className="mt-4" onClick={() => router.push("/crm")}>Volver a CRM</Button>
        </div>
      </main>
    );
  }

  const complete = isDiscoveryComplete(discovery);

  const updateDiscovery = <Key extends keyof DiscoveryForm>(key: Key, value: DiscoveryForm[Key]) => {
    setDiscovery((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const saveDiscovery = (completed = false) => {
    updateLead(lead.id, {
      discovery: {
        ...discovery,
        completedAt: completed ? new Date().toISOString().slice(0, 10) : discovery.completedAt,
      },
      recommendedPackage: discovery.recommendedPackage as PackageType,
      nextStep: complete ? "Descubrimiento completo. Convertir o enviar propuesta." : "Continuar sesion de descubrimiento.",
    });
    setSaved(true);
  };

  const toggleWarning = (value: string) => {
    setDiscovery((current) => {
      const exists = current.warningSignals.includes(value);
      return {
        ...current,
        warningSignals: exists
          ? current.warningSignals.filter((item) => item !== value)
          : [...current.warningSignals, value],
      };
    });
    setSaved(false);
  };

  return (
    <main className="min-h-screen bg-brand-paper text-brand-charcoal">
      <header className="sticky top-0 z-20 border-b border-brand-charcoal/10 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-navy">Modo sesion</p>
            <h1 className="text-2xl font-semibold md:text-3xl">{lead.contactName} · {lead.company}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push("/crm")}>Cerrar sesion</Button>
            <Button variant="secondary" onClick={() => saveDiscovery(false)}>{saved ? "Guardado" : "Guardar avance"}</Button>
            <Button
              disabled={!complete}
              onClick={() => {
                saveDiscovery(true);
                moveLead(lead.id, "cliente ganado");
                router.push("/clientes");
              }}
            >
              Convertir a cliente
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
        <Panel>
          <PanelHeader title="Referencia del Filtro Inicial" description="Datos capturados antes de esta llamada. Solo lectura." />
          <div className="grid gap-4 p-5 text-base md:grid-cols-2">
            <ReadOnlyFact label="Problema principal" value={lead.intake?.mainProblem ?? lead.nextStep} />
            <ReadOnlyFact label="Resultado esperado" value={lead.intake?.expectedResult ?? "Pendiente"} />
            <ReadOnlyFact label="Industria" value={lead.intake?.industry ?? "Pendiente"} />
            <ReadOnlyFact label="Tiempo operando" value={lead.intake?.operatingTime ?? `${lead.intake?.yearsOperating ?? 0} anos`} />
            <ReadOnlyFact label="Como nos conocio" value={lead.intake?.howFoundUs ?? lead.source} />
            <ReadOnlyFact label="Fit inicial" value={lead.intake?.internalFlag ?? "Pendiente"} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Formulario 2 - Descubrimiento" description="Para llenar en vivo durante la llamada de 60-90 minutos." />
          <div className="grid gap-6 p-5">
            <SessionSection title="A. El negocio real">
              <Field label="¿Como genera dinero el negocio hoy?">
                <TextArea className="text-base" value={discovery.businessModel} onChange={(event) => updateDiscovery("businessModel", event.target.value)} placeholder="Que vende, a quien, como cobra, canales principales" />
              </Field>
              <Field label="Ingresos mensuales aproximados">
                <Select className="text-base" value={discovery.monthlyRevenue} onChange={(event) => updateDiscovery("monthlyRevenue", event.target.value)}>
                  <option value="">Selecciona</option>
                  <option>Menos de $50K MXN</option>
                  <option>$50K-$150K</option>
                  <option>$150K-$500K</option>
                  <option>Mas de $500K</option>
                  <option>No compartio</option>
                </Select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Numero de empleados">
                  <TextInput className="text-base" type="number" value={discovery.employeeCount} onChange={(event) => updateDiscovery("employeeCount", Number(event.target.value))} />
                </Field>
                <Field label="Clientes activos actuales">
                  <TextInput className="text-base" type="number" value={discovery.activeClients} onChange={(event) => updateDiscovery("activeClients", Number(event.target.value))} />
                </Field>
              </div>
              <Field label="¿Que esta funcionando bien que NO debemos tocar?">
                <TextArea className="text-base" value={discovery.mainStrength} onChange={(event) => updateDiscovery("mainStrength", event.target.value)} />
              </Field>
            </SessionSection>

            <SessionSection title="B. El problema real">
              <Field label="Sintoma que el cliente describe">
                <TextArea className="text-base" value={discovery.describedSymptom} onChange={(event) => updateDiscovery("describedSymptom", event.target.value)} />
              </Field>
              <Field label="Problema raiz identificado por LC">
                <TextArea className="text-base" value={discovery.rootProblem} onChange={(event) => updateDiscovery("rootProblem", event.target.value)} />
              </Field>
              <Field label="¿Que han intentado antes para resolverlo?">
                <TextArea className="text-base" value={discovery.previousAttempts} onChange={(event) => updateDiscovery("previousAttempts", event.target.value)} />
              </Field>
              <Field label="Urgencia real del problema">
                <Select className="text-base" value={discovery.urgency} onChange={(event) => updateDiscovery("urgency", event.target.value as DiscoveryForm["urgency"])}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </Select>
              </Field>
              <Field label="¿Que pasa si no lo resuelven en los proximos 90 dias?">
                <TextArea className="text-base" value={discovery.urgencyImpact} onChange={(event) => updateDiscovery("urgencyImpact", event.target.value)} />
              </Field>
            </SessionSection>

            <SessionSection title="C. Baseline inicial">
              <Field label="Indicador comercial clave">
                <TextArea className="text-base" value={discovery.commercialBaseline} onChange={(event) => updateDiscovery("commercialBaseline", event.target.value)} />
              </Field>
              <Field label="Indicador operativo clave">
                <TextArea className="text-base" value={discovery.operationalBaseline} onChange={(event) => updateDiscovery("operationalBaseline", event.target.value)} />
              </Field>
              <Field label="Presencia digital actual">
                <TextArea className="text-base" value={discovery.digitalBaseline} onChange={(event) => updateDiscovery("digitalBaseline", event.target.value)} />
              </Field>
              <Field label="Metrica de exito acordada">
                <TextArea className="text-base" value={discovery.successMetric} onChange={(event) => updateDiscovery("successMetric", event.target.value)} />
              </Field>
              <Field label="Fecha limite para lograr la metrica">
                <TextInput className="text-base" type="date" value={discovery.metricDeadline} onChange={(event) => updateDiscovery("metricDeadline", event.target.value)} />
              </Field>
            </SessionSection>

            <SessionSection title="D. Evaluacion interna LC">
              <Field label="Paquete recomendado">
                <Select className="text-base" value={discovery.recommendedPackage} onChange={(event) => updateDiscovery("recommendedPackage", event.target.value)}>
                  <option value="">Selecciona</option>
                  <option>Diagnostico LC ($15,000)</option>
                  <option>Proyecto LC ($50K-$120K)</option>
                  <option>Retencion LC ($12K-$18K/mes)</option>
                </Select>
              </Field>
              <Field label="Justificacion del paquete recomendado">
                <TextArea className="text-base" value={discovery.packageJustification} onChange={(event) => updateDiscovery("packageJustification", event.target.value)} />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Horas LC por semana">
                  <TextInput className="text-base" type="number" value={discovery.weeklyHours} onChange={(event) => updateDiscovery("weeklyHours", Number(event.target.value))} />
                </Field>
                <Field label="Duracion estimada en meses">
                  <TextInput className="text-base" type="number" value={discovery.durationMonths} onChange={(event) => updateDiscovery("durationMonths", Number(event.target.value))} />
                </Field>
                <Field label="Complejidad">
                  <Select className="text-base" value={discovery.complexity} onChange={(event) => updateDiscovery("complexity", event.target.value)}>
                    <option>1 - Baja</option>
                    <option>2</option>
                    <option>3 - Media</option>
                    <option>4</option>
                    <option>5 - Alta</option>
                  </Select>
                </Field>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-charcoal/80">Senales de alerta detectadas</p>
                <div className="mt-2 grid gap-2">
                  {warningSignalOptions.map((item) => (
                    <label key={item} className="flex items-center gap-3 rounded-md border border-brand-mist bg-white p-3 text-base">
                      <input type="checkbox" checked={discovery.warningSignals.includes(item)} onChange={() => toggleWarning(item)} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Notas libres de la sesion">
                <TextArea className="text-base" value={discovery.sessionNotes} onChange={(event) => updateDiscovery("sessionNotes", event.target.value)} />
              </Field>
              <Field label="Decision LC">
                <Select className="text-base" value={discovery.finalDecision} onChange={(event) => updateDiscovery("finalDecision", event.target.value as DiscoveryForm["finalDecision"])}>
                  <option value="proceder">Proceder - enviar propuesta formal</option>
                  <option value="evaluacion">En evaluacion - necesita mas informacion</option>
                  <option value="no_fit">No hay fit - cerrar con respeto</option>
                </Select>
              </Field>
              <Field label="Justificacion de la decision">
                <TextArea className="text-base" value={discovery.decisionJustification} onChange={(event) => updateDiscovery("decisionJustification", event.target.value)} />
              </Field>
            </SessionSection>
          </div>
        </Panel>

        {!complete ? (
          <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-4 text-base text-brand-charcoal">
            Completa los campos clave del descubrimiento para habilitar la conversion a cliente.
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ReadOnlyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-mist bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal/45">{label}</p>
      <p className="mt-2 text-base leading-7 text-brand-charcoal">{value || "Pendiente"}</p>
    </div>
  );
}

function ActionEmptyState({
  icon,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-brand-mist bg-white p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-brand-paper text-brand-navy">{icon}</div>
      <h3 className="mt-4 font-semibold text-brand-charcoal">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-brand-charcoal/60">{detail}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function SessionSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-brand-mist pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold text-brand-charcoal">{title}</h2>
      {children}
    </section>
  );
}

export function ClientsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, updateClient } = useStore();
  const section = searchParams.get("section") === "contactos" ? "contactos" : "empresas";
  const [view, setView] = useState<"tarjetas" | "tabla">("tarjetas");
  const [visibleFields, setVisibleFields] = useState({
    industry: true,
    pain: true,
    services: true,
    revenue: true,
    owner: true,
  });

  const updateClientPhoto = (clientId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateClient(clientId, { companyPhotoUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const selectClientSection = (nextSection: "empresas" | "contactos") => {
    router.replace(`/clientes?section=${nextSection}`);
  };

  return (
    <>
      <PageHeader title="Clientes" description="Empresas y contactos separados: la empresa tiene expediente, proyectos y KPIs; los contactos son las personas clave.">
        <div className="flex flex-wrap gap-2">
          <Button variant={section === "empresas" ? "primary" : "secondary"} onClick={() => selectClientSection("empresas")}>Empresas</Button>
          <Button variant={section === "contactos" ? "primary" : "secondary"} onClick={() => selectClientSection("contactos")}>Contactos</Button>
          {section === "empresas" ? (
            <>
              <IconToggle active={view === "tarjetas"} label="Vista tarjetas" onClick={() => setView("tarjetas")}>
                <LayoutGrid className="h-4 w-4" />
              </IconToggle>
              <IconToggle active={view === "tabla"} label="Vista tabla" onClick={() => setView("tabla")}>
                <Table2 className="h-4 w-4" />
              </IconToggle>
            </>
          ) : null}
        </div>
      </PageHeader>

      {section === "empresas" ? (
        <Panel className="mb-5">
          <PanelHeader title="Campos visibles en tarjetas" description="Activa o quita lo que quieres ver en cada empresa." />
          <div className="flex flex-wrap gap-4 p-4 text-sm">
            {Object.entries({
              industry: "Industria",
              pain: "Dolor principal",
              services: "Servicios",
              revenue: "Ingreso estimado",
              owner: "Responsable",
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-brand-charcoal/75">
                <input
                  type="checkbox"
                  checked={visibleFields[key as keyof typeof visibleFields]}
                  onChange={(event) => setVisibleFields((current) => ({ ...current, [key]: event.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
        </Panel>
      ) : null}

      {section === "empresas" && view === "tarjetas" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.clients.map((client) => (
            <article key={client.id} className="rounded-lg border border-brand-mist bg-white p-5 shadow-sm transition hover:border-brand-gold hover:shadow-md">
              <Link href={`/clientes/${client.id}`} className="block">
                <div className="mb-4 h-32 rounded-lg border border-brand-mist bg-brand-paper bg-cover bg-center" style={{ backgroundImage: client.companyPhotoUrl ? `url(${client.companyPhotoUrl})` : undefined }}>
                  {!client.companyPhotoUrl ? (
                    <div className="grid h-full place-items-center text-sm font-semibold text-brand-charcoal/45">{client.name.slice(0, 2).toUpperCase()}</div>
                  ) : null}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-charcoal">{client.name}</h2>
                    {visibleFields.industry ? <p className="mt-1 text-sm text-brand-charcoal/55">{client.industry}</p> : null}
                  </div>
                  <Badge tone={healthTone(client.health)}>{client.health}</Badge>
                </div>
                {visibleFields.pain ? <p className="mt-4 text-sm leading-6 text-brand-charcoal/70">{client.mainPain}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {visibleFields.services ? client.services.slice(0, 2).map((service) => <Badge key={service}>{service}</Badge>) : null}
                  {visibleFields.revenue ? <Badge tone="blue">{money(client.revenueEstimate)}</Badge> : null}
                  {visibleFields.owner ? <Badge>{client.accountOwner}</Badge> : null}
                </div>
              </Link>
              <label className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-brand-mist bg-white px-3 text-sm font-medium text-brand-charcoal hover:border-brand-gold">
                Foto empresa
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => updateClientPhoto(client.id, event.currentTarget.files?.[0])} />
              </label>
            </article>
          ))}
        </div>
      ) : null}

      {section === "empresas" && view === "tabla" ? (
        <Panel>
          <PanelHeader title="Tabla de empresas" description="Haz click en cualquier parte de una fila para abrir el expediente." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr>
                  <th className="px-5 py-3">Foto</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Industria</th>
                  <th className="px-5 py-3">Salud</th>
                  <th className="px-5 py-3">Responsable</th>
                  <th className="px-5 py-3">Ingreso</th>
                  <th className="px-5 py-3">Foto empresa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {data.clients.map((client) => (
                  <tr key={client.id} className="cursor-pointer hover:bg-brand-gold/10" onClick={() => router.push(`/clientes/${client.id}`)}>
                    <td className="px-5 py-4">
                      <div className="h-11 w-14 rounded-md border border-brand-mist bg-brand-paper bg-cover bg-center" style={{ backgroundImage: client.companyPhotoUrl ? `url(${client.companyPhotoUrl})` : undefined }} />
                    </td>
                    <td className="px-5 py-4 font-medium">{client.name}</td>
                    <td className="px-5 py-4">{client.industry}</td>
                    <td className="px-5 py-4"><Badge tone={healthTone(client.health)}>{client.health}</Badge></td>
                    <td className="px-5 py-4">{client.accountOwner}</td>
                    <td className="px-5 py-4">{money(client.revenueEstimate)}</td>
                    <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                      <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-brand-mist bg-white px-3 text-sm font-medium text-brand-charcoal hover:border-brand-gold">
                        Subir
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => updateClientPhoto(client.id, event.currentTarget.files?.[0])} />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {section === "contactos" ? (
        <Panel>
          <PanelHeader title="Contactos" description="Personas clave separadas de la empresa. Click en la fila abre el expediente de la empresa." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Telefono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {data.contacts.map((contact) => {
                  const client = data.clients.find((item) => item.id === contact.clientId);
                  return (
                    <tr key={contact.id} className="cursor-pointer hover:bg-brand-gold/10" onClick={() => client && router.push(`/clientes/${client.id}`)}>
                      <td className="px-5 py-4 font-medium">{contact.name}</td>
                      <td className="px-5 py-4">{client?.name ?? "Sin empresa"}</td>
                      <td className="px-5 py-4">{contact.role}</td>
                      <td className="px-5 py-4">{contact.email}</td>
                      <td className="px-5 py-4">{contact.phone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </>
  );
}

function NewProjectForm({ clientId }: { clientId: string }) {
  const { addProject, addKpi, data } = useStore();
  const [open, setOpen] = useState(false);
  const [recipeId, setRecipeId] = useState(data.recipes[0]?.id ?? "");
  const selectedRecipe = data.recipes.find((recipe) => recipe.id === recipeId);
  const [projectKpis, setProjectKpis] = useState(selectedRecipe?.kpis.join("\n") ?? "");
  if (!open) return <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nuevo proyecto</Button>;

  return (
    <Panel>
      <PanelHeader title="Nuevo proyecto para expediente" description="Crea una pestaña individual de administración para este cliente." />
      <form
        className="grid gap-4 p-5 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const projectId = addProject({
            clientId,
            name: String(form.get("name")),
            objective: String(form.get("objective")),
            scope: String(form.get("scope")),
            owner: String(form.get("owner")),
            startsAt: String(form.get("startsAt")),
            endsAt: String(form.get("endsAt")),
            status: "planeado",
            priority: String(form.get("priority")) as Priority,
            budget: Number(form.get("budget")),
            packageType: String(form.get("packageType")) as PackageType,
            assignedRecipeId: String(form.get("assignedRecipeId") || "") || undefined,
          });
          listToArray(String(form.get("projectKpis"))).forEach((name) => {
            addKpi({
              clientId,
              projectId,
              name,
              description: `Indicador definido para medir exito en ${String(form.get("name"))}`,
              formula: "Definir formula con cliente",
              currentValue: 0,
              target: 100,
              unit: "%",
              frequency: "Semanal",
              owner: String(form.get("owner")),
              source: "Definido en proyecto",
              status: "alerta",
            });
          });
          setOpen(false);
        }}
      >
        <Field label="Nombre"><TextInput name="name" required /></Field>
        <Field label="Responsable">
          <Select name="owner">{data.consultants.map((item) => <option key={item.id}>{item.name}</option>)}</Select>
        </Field>
        <Field label="Paquete">
          <Select name="packageType">{consultingPackages.map((item) => <option key={item.id}>{item.name}</option>)}</Select>
        </Field>
        <Field label="Receta base del proyecto">
          <Select
            name="assignedRecipeId"
            value={recipeId}
            onChange={(event) => {
              const nextRecipeId = event.currentTarget.value;
              setRecipeId(nextRecipeId);
              setProjectKpis(data.recipes.find((recipe) => recipe.id === nextRecipeId)?.kpis.join("\n") ?? "");
            }}
          >
            <option value="">Proyecto personalizado sin receta base</option>
            {data.recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
          </Select>
        </Field>
        <Field label="Prioridad">
          <Select name="priority"><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Critica</option><option value="baja">Baja</option></Select>
        </Field>
        <Field label="Inicio"><TextInput name="startsAt" type="date" required /></Field>
        <Field label="Fin"><TextInput name="endsAt" type="date" required /></Field>
        <Field label="Presupuesto"><TextInput name="budget" type="number" required /></Field>
        <div className="md:col-span-2"><Field label="Objetivo"><TextArea name="objective" required /></Field></div>
        <div className="md:col-span-2"><Field label="Alcance"><TextArea name="scope" required /></Field></div>
        <div className="md:col-span-2">
          <Field label="KPIs propios del proyecto, uno por linea">
            <TextArea
              name="projectKpis"
              value={projectKpis}
              onChange={(event) => setProjectKpis(event.currentTarget.value)}
              placeholder="Ej. Tiempo de entrega promedio&#10;Margen bruto del proyecto&#10;Conversion de seguimiento"
            />
          </Field>
          <p className="mt-2 text-xs leading-5 text-brand-charcoal/55">
            Las recetas sugieren indicadores, pero aqui se definen los KPIs reales de exito para este negocio.
          </p>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button>Crear proyecto</Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
        </div>
      </form>
    </Panel>
  );
}

export function ClientDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { data, addDiagnosisFromIntake, updateDiagnosis, updateIntakeForm } = useStore();
  const [tab, setTab] = useState<"expediente" | "acuerdo" | "proyectos" | "sesiones" | "kpis" | "finanzas">("expediente");
  const [showNewExpediente, setShowNewExpediente] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [editingIntake, setEditingIntake] = useState<IntakeForm | null>(null);
  const client = data.clients.find((item) => item.id === id);
  if (!client) return <EmptyState title="Cliente no encontrado" detail="Revisa el expediente seleccionado." />;

  const contacts = data.contacts.filter((item) => item.clientId === client.id);
  const projects = data.projects.filter((item) => item.clientId === client.id);
  const tasks = data.tasks.filter((item) => item.clientId === client.id);
  const kpis = data.kpis.filter((item) => item.clientId === client.id);
  const meetings = [...data.meetings.filter((item) => item.clientId === client.id)].sort((a, b) => b.date.localeCompare(a.date));
  const interactions = data.interactions.filter((item) => item.clientId === client.id);
  const diagnoses = data.diagnoses.filter((item) => item.clientId === client.id);
  const intakeForms = data.intakeForms.filter((item) => item.clientId === client.id);
  const history = data.clientHistory.filter((item) => item.clientId === client.id);
  const lead = data.leads.find((item) => item.convertedClientId === client.id || item.company === client.name);
  const discovery = lead?.discovery;
  const signedAgreement = history.find((item) => item.title.toLowerCase().includes("acuerdo") && item.title.toLowerCase().includes("firmado"));
  const packageName = projects[0]?.packageType ?? lead?.recommendedPackage ?? client.services[0] ?? "Sin paquete asignado";
  const assignedConsultants = Array.from(new Set([client.accountOwner, ...projects.map((project) => project.owner)]));
  const projectRevenue = projects.reduce((sum, project) => sum + project.budget, 0);
  const paymentsReceived = Math.round(projectRevenue * 0.45);
  const projectExpenses = Math.round(projectRevenue * 0.28);
  const margin = paymentsReceived - projectExpenses;

  const generateAgreementPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 18;
    const write = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(value || "Pendiente", 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 5;
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("Acuerdo de Claridad LC", 20, y);
    y += 11;
    doc.setFontSize(11);
    write("Cliente", client.name);
    write("Paquete recomendado", packageName);
    write("Problema principal", discovery?.rootProblem || client.mainPain);
    write("Resultado esperado", discovery?.successMetric || intakeForms[0]?.objectives || "Pendiente de definir");
    write("Que si se trabajara", discovery?.packageJustification || projects[0]?.scope || "Alcance pendiente de formalizar");
    write("Baseline inicial", [discovery?.commercialBaseline, discovery?.operationalBaseline, discovery?.digitalBaseline].filter(Boolean).join("\n") || "Pendiente");
    write("Compromisos LC / Cliente", discovery?.decisionJustification || "Pendiente de firma por ambas partes");
    doc.save(`acuerdo-claridad-${client.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
  };

  const tabs = ["expediente", "acuerdo", "proyectos", "sesiones", "kpis", "finanzas"] as const;
  const timeline = [
    ...history,
    ...interactions.map((item) => ({ id: item.id, date: item.date, actor: "LC", title: item.title, detail: item.detail })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title={client.name} description={client.mainPain}>
        <Badge tone={healthTone(client.health)}>Salud {client.health}</Badge>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Industria" value={client.industry} detail={client.size} />
        <Stat label="Paquete" value={packageName} detail="Receta / servicio principal" />
        <Stat label="Proyectos" value={`${projects.length}`} detail={`${tasks.filter((task) => task.status !== "terminada").length} tareas abiertas`} tone="blue" />
        <Stat label="KPIs" value={`${kpis.length}`} detail={`${meetings.length} sesiones registradas`} tone="green" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "secondary"} onClick={() => setTab(item)}>{item}</Button>
        ))}
      </div>

      {tab === "expediente" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel>
            <PanelHeader title="Expediente del paciente-empresa" description="Contexto vivo del cliente, dolor principal, receta y equipo asignado." />
            <div className="space-y-5 p-5">
              <ReadOnlyFact label="Problema principal" value={client.mainPain} />
              <ReadOnlyFact label="Receta asignada" value={packageName} />
              <ReadOnlyFact label="Consultores LC" value={assignedConsultants.join(", ")} />
              <ReadOnlyFact label="Investigacion previa" value={intakeForms[0]?.currentProblems || lead?.intake?.mainProblem || "Pendiente de documentar"} />
              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal">Contactos clave</h3>
                <div className="mt-3 space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="rounded-lg border border-brand-mist p-3">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-brand-charcoal/55">{contact.role} - {contact.email}</p>
                    </div>
                  ))}
                  {!contacts.length ? <EmptyState title="Sin contactos" detail="Agrega contactos al expediente para coordinar sesiones y acuerdos." /> : null}
                </div>
              </div>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <PanelHeader
                title="Diagnosticos y formularios"
                description="Formulario 1, descubrimientos y nuevos expedientes para futuros proyectos."
                action={<Button onClick={() => setShowNewExpediente((value) => !value)}><Plus className="h-4 w-4" />Nuevo expediente</Button>}
              />
              {showNewExpediente ? (
                <form
                  className="grid gap-4 border-b border-brand-mist p-5 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    addDiagnosisFromIntake({
                      clientId: client.id,
                      company: client.name,
                      industry: client.industry,
                      size: client.size,
                      currentProblems: String(form.get("currentProblems")),
                      objectives: String(form.get("objectives")),
                      criticalProcesses: String(form.get("criticalProcesses")),
                      tools: "Por actualizar",
                      sales: "Por actualizar",
                      operations: "Por actualizar",
                      finance: "Por actualizar",
                      marketing: "Por actualizar",
                      customerService: "Por actualizar",
                      urgency: String(form.get("urgency")) as "baja" | "media" | "alta",
                      budget: "Por definir",
                      priorities: String(form.get("priorities")),
                      formType: "descubrimiento",
                    });
                    setShowNewExpediente(false);
                  }}
                >
                  <div className="md:col-span-2"><Field label="Sintoma o problema actual"><TextArea name="currentProblems" required /></Field></div>
                  <div className="md:col-span-2"><Field label="Objetivo de esta intervencion"><TextArea name="objectives" required /></Field></div>
                  <Field label="Proceso critico"><TextInput name="criticalProcesses" required /></Field>
                  <Field label="Urgencia"><Select name="urgency"><option value="media">Media</option><option value="alta">Alta</option><option value="baja">Baja</option></Select></Field>
                  <div className="md:col-span-2"><Field label="Prioridades"><TextArea name="priorities" required /></Field></div>
                  <div className="flex gap-2 md:col-span-2"><Button>Guardar expediente</Button><Button type="button" variant="secondary" onClick={() => setShowNewExpediente(false)}>Cancelar</Button></div>
                </form>
              ) : null}
              <div className="grid gap-4 p-5">
                {intakeForms.length ? (
                  <div className="grid gap-3">
                    <p className="text-sm font-semibold text-brand-charcoal">Formularios del cliente</p>
                    {intakeForms.map((form) => (
                      <div key={form.id} className="rounded-lg border border-brand-mist bg-brand-paper p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-brand-charcoal">{form.formType ?? "formulario"} · {shortDate(form.createdAt)}</p>
                            <p className="mt-1 text-sm leading-6 text-brand-charcoal/65">{form.currentProblems}</p>
                          </div>
                          <Button variant="secondary" onClick={() => setEditingIntake(form)}><Edit3 className="h-4 w-4" />Editar formulario</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="rounded-lg border border-brand-mist p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{diagnosis.company}</p>
                        <p className="mt-1 text-sm leading-6 text-brand-charcoal/65">{diagnosis.summary}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge tone={priorityTone(diagnosis.interventionPriority)}>{diagnosis.interventionPriority}</Badge>
                        <Button variant="secondary" onClick={() => setEditingDiagnosis(diagnosis)}><Edit3 className="h-4 w-4" />Editar</Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <ListBlock title="Problemas detectados" items={diagnosis.detectedProblems} />
                      <ListBlock title="Proyectos posibles" items={diagnosis.possibleProjects} />
                    </div>
                  </div>
                ))}
                {!diagnoses.length ? <ActionEmptyState icon={<FolderOpen className="h-5 w-5" />} title="Sin expediente diagnostico" detail="Crea un expediente para documentar sintomas, causa raiz y tratamiento propuesto." /> : null}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Historial" description="Cambios e interacciones recientes del expediente." />
              <div className="space-y-3 p-5">
                {timeline.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-lg border border-brand-mist p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.title}</p>
                      <Badge>{shortDate(item.date)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-brand-charcoal/55">{item.actor}</p>
                    <p className="mt-2 text-sm text-brand-charcoal/70">{item.detail}</p>
                  </div>
                ))}
                {!timeline.length ? <EmptyState title="Sin historial" detail="Los cambios importantes del cliente apareceran aqui." /> : null}
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === "acuerdo" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel>
            <PanelHeader title="Acuerdo de Claridad" description="Sin acuerdo firmado, no debe arrancar la ejecucion." />
            <div className="p-5">
              {signedAgreement ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="h-6 w-6 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-emerald-950">Acuerdo firmado</p>
                      <p className="text-sm text-emerald-800">Fecha de firma: {shortDate(signedAgreement.date)}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-emerald-950">
                    <p><span className="font-semibold">Paquete:</span> {packageName}</p>
                    <p><span className="font-semibold">Problema:</span> {discovery?.rootProblem || client.mainPain}</p>
                    <p><span className="font-semibold">Metrica:</span> {discovery?.successMetric || "Pendiente"}</p>
                  </div>
                  <Button className="mt-5" onClick={generateAgreementPdf}><FileDown className="h-4 w-4" />Descargar PDF</Button>
                </div>
              ) : (
                <ActionEmptyState
                  icon={<ClipboardCheck className="h-5 w-5" />}
                  title="Acuerdo pendiente"
                  detail="Genera el Acuerdo de Claridad con los datos del Formulario 2 antes de iniciar cualquier proyecto."
                  action={<Button onClick={generateAgreementPdf}>Generar Acuerdo de Claridad</Button>}
                />
              )}
            </div>
          </Panel>
          <Panel>
            <PanelHeader title="Datos fuente del Formulario 2" description="Resumen usado para prellenar alcance, limites y compromisos." />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <ReadOnlyFact label="Modelo de negocio" value={discovery?.businessModel ?? "Pendiente"} />
              <ReadOnlyFact label="Problema raiz" value={discovery?.rootProblem ?? "Pendiente"} />
              <ReadOnlyFact label="Baseline comercial" value={discovery?.commercialBaseline ?? "Pendiente"} />
              <ReadOnlyFact label="Baseline operativo" value={discovery?.operationalBaseline ?? "Pendiente"} />
              <ReadOnlyFact label="Metrica de exito" value={discovery?.successMetric ?? "Pendiente"} />
              <ReadOnlyFact label="Justificacion" value={discovery?.packageJustification ?? "Pendiente"} />
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "proyectos" ? (
        <div className="mt-6 space-y-5">
          <NewProjectForm clientId={client.id} />
          {projects.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const projectTasks = tasks.filter((task) => task.projectId === project.id);
                return (
                  <Link key={project.id} href={`/proyectos/${project.id}`} className="rounded-lg border border-brand-mist bg-white p-5 shadow-sm hover:border-brand-gold">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="mt-1 text-sm text-brand-charcoal/60">{project.packageType ?? "Sin paquete"}</p>
                      </div>
                      <Badge tone={statusTone(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-brand-charcoal/70">{project.objective}</p>
                    <div className="mt-4 grid gap-2 text-xs text-brand-charcoal/60">
                      <p>Fase LEAD: {(project.leadPhase ?? "listen").toUpperCase()}</p>
                      <p>{projectTasks.length} tareas internas</p>
                      <p>Causa raiz: {project.rootCause || "en investigacion"}</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-brand-mist"><div className="h-2 rounded-full bg-brand-gold" style={{ width: `${project.progress}%` }} /></div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <ActionEmptyState icon={<GanttChart className="h-5 w-5" />} title="No hay proyectos activos" detail="Los proyectos se crean desde esta ficha cuando existe acuerdo y paquete definido." action={<Button onClick={() => setShowNewExpediente(false)}>Crear desde formulario superior</Button>} />
          )}
        </div>
      ) : null}

      {tab === "sesiones" ? (
        <div className="mt-6 space-y-5">
          <div className="flex justify-end">
            {lead ? (
              <Link href={`/sesion/lead/${lead.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-medium text-white shadow-sm shadow-brand-navy/20">
                <CalendarPlus className="h-4 w-4" />Nueva sesion
              </Link>
            ) : (
              <Button variant="secondary" disabled><CalendarPlus className="h-4 w-4" />Nueva sesion</Button>
            )}
          </div>
          {meetings.length ? (
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <Panel key={meeting.id}>
                  <PanelHeader title={meeting.title} description={`${shortDate(meeting.date)} - ${meeting.owners.join(", ")}`} />
                  <div className="grid gap-4 p-5 md:grid-cols-3">
                    <div className="md:col-span-3"><p className="text-sm leading-6 text-brand-charcoal/70">{meeting.minutes}</p></div>
                    <ListBlock title="Acuerdos" items={meeting.agreements} />
                    <ListBlock title="Decisiones" items={meeting.decisions} />
                    <ListBlock title="Riesgos" items={meeting.risks} />
                    <ReadOnlyFact label="Proxima sesion" value={meeting.nextMeeting} />
                  </div>
                </Panel>
              ))}
            </div>
          ) : (
            <ActionEmptyState icon={<Video className="h-5 w-5" />} title="Sin sesiones registradas" detail="Cada llamada debe guardar agenda, notas, hallazgos, acuerdos y proximos pasos." action={lead ? <Link href={`/sesion/lead/${lead.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-medium text-white">Abrir Modo Sesion</Link> : undefined} />
          )}
        </div>
      ) : null}

      {tab === "kpis" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {kpis.map((kpi) => (
            <Panel key={kpi.id}>
              <PanelHeader title={kpi.name} description={kpi.description} action={<Badge tone={statusTone(kpi.status)}>{kpi.status}</Badge>} />
              <div className="space-y-4 p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <Stat label="Baseline" value={kpi.source} detail={kpi.frequency} />
                  <Stat label="Actual" value={`${kpi.currentValue}${kpi.unit}`} detail={kpi.owner} tone="blue" />
                  <Stat label="Meta" value={`${kpi.target}${kpi.unit}`} detail={kpi.formula} tone="green" />
                </div>
                <KpiTrend measurements={data.kpiMeasurements.filter((item) => item.kpiId === kpi.id)} target={kpi.target} />
              </div>
            </Panel>
          ))}
          {!kpis.length ? <ActionEmptyState icon={<LineChart className="h-5 w-5" />} title="Sin indicadores registrados" detail="Los KPIs se asignan al crear un proyecto o desde una receta validada." action={<Button onClick={() => setTab("proyectos")}>Ir a Proyectos</Button>} /> : null}
        </div>
      ) : null}

      {tab === "finanzas" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Stat label="Cotizacion" value={money(projectRevenue || client.revenueEstimate)} detail={packageName} tone="blue" />
            <Stat label="Cobrado" value={money(paymentsReceived)} detail="Demo: pagos aplicados" tone="green" />
            <Stat label="Gastos" value={money(projectExpenses)} detail="Costos internos estimados" tone="yellow" />
            <Stat label="Margen" value={money(margin)} detail="Ingreso cobrado menos gasto" tone={margin >= 0 ? "green" : "red"} />
          </div>
          <Panel>
            <PanelHeader title="Estado financiero del cliente" description="Vista interna LC y resumen para estado de cuenta." />
            <div className="space-y-3 p-5">
              {projects.map((project) => (
                <div key={project.id} className="rounded-lg border border-brand-mist p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-brand-charcoal/60">{project.packageType ?? "Sin paquete"}</p>
                    </div>
                    <Badge tone="blue">{money(project.budget)}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-brand-charcoal/65 md:grid-cols-3">
                    <p>Cobrado: {money(Math.round(project.budget * 0.45))}</p>
                    <p>Pendiente: {money(Math.round(project.budget * 0.55))}</p>
                    <p>Gasto estimado: {money(Math.round(project.budget * 0.28))}</p>
                  </div>
                </div>
              ))}
              {!projects.length ? <ActionEmptyState icon={<WalletCards className="h-5 w-5" />} title="Sin finanzas de proyecto" detail="La cotizacion se genera desde el paquete seleccionado al crear un proyecto." action={<Button onClick={() => setTab("proyectos")}>Ir a Proyectos</Button>} /> : null}
            </div>
          </Panel>
        </div>
      ) : null}

      {editingDiagnosis ? (
        <DiagnosisEditor
          diagnosis={editingDiagnosis}
          onClose={() => setEditingDiagnosis(null)}
          onSave={(patch) => {
            updateDiagnosis(editingDiagnosis.id, patch);
            setEditingDiagnosis(null);
          }}
        />
      ) : null}
      {editingIntake ? (
        <IntakeFormEditor
          intake={editingIntake}
          onClose={() => setEditingIntake(null)}
          onSave={(patch) => {
            updateIntakeForm(editingIntake.id, patch);
            setEditingIntake(null);
          }}
        />
      ) : null}
    </>
  );
}

function IntakeFormEditor({
  intake,
  onClose,
  onSave,
}: {
  intake: IntakeForm;
  onClose: () => void;
  onSave: (patch: Partial<IntakeForm>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-charcoal/60 p-4">
      <form
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSave({
            currentProblems: String(form.get("currentProblems")),
            objectives: String(form.get("objectives")),
            criticalProcesses: String(form.get("criticalProcesses")),
            tools: String(form.get("tools")),
            sales: String(form.get("sales")),
            operations: String(form.get("operations")),
            finance: String(form.get("finance")),
            marketing: String(form.get("marketing")),
            customerService: String(form.get("customerService")),
            urgency: String(form.get("urgency")) as IntakeForm["urgency"],
            budget: String(form.get("budget")),
            priorities: String(form.get("priorities")),
          });
        }}
      >
        <div className="flex items-center justify-between border-b border-brand-mist px-5 py-4">
          <div>
            <h2 className="font-semibold text-brand-charcoal">Editar formulario</h2>
            <p className="text-sm text-brand-charcoal/60">{intake.company} · {intake.formType ?? "formulario"}</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Problemas actuales"><TextArea name="currentProblems" defaultValue={intake.currentProblems} required /></Field></div>
          <div className="md:col-span-2"><Field label="Objetivos"><TextArea name="objectives" defaultValue={intake.objectives} required /></Field></div>
          <Field label="Procesos criticos"><TextInput name="criticalProcesses" defaultValue={intake.criticalProcesses} /></Field>
          <Field label="Herramientas"><TextInput name="tools" defaultValue={intake.tools} /></Field>
          <Field label="Ventas"><TextInput name="sales" defaultValue={intake.sales} /></Field>
          <Field label="Operaciones"><TextInput name="operations" defaultValue={intake.operations} /></Field>
          <Field label="Finanzas"><TextInput name="finance" defaultValue={intake.finance} /></Field>
          <Field label="Marketing"><TextInput name="marketing" defaultValue={intake.marketing} /></Field>
          <Field label="Servicio al cliente"><TextInput name="customerService" defaultValue={intake.customerService} /></Field>
          <Field label="Urgencia"><Select name="urgency" defaultValue={intake.urgency}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></Select></Field>
          <Field label="Presupuesto"><TextInput name="budget" defaultValue={intake.budget} /></Field>
          <div className="md:col-span-2"><Field label="Prioridades"><TextArea name="priorities" defaultValue={intake.priorities} /></Field></div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button>Guardar formulario</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DiagnosisEditor({
  diagnosis,
  onClose,
  onSave,
}: {
  diagnosis: Diagnosis;
  onClose: () => void;
  onSave: (patch: Partial<Diagnosis>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-charcoal/60 p-4">
      <form
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSave({
            summary: String(form.get("summary")),
            detectedProblems: listToArray(String(form.get("detectedProblems"))),
            opportunities: listToArray(String(form.get("opportunities"))),
            suggestedKpis: listToArray(String(form.get("suggestedKpis"))),
            possibleProjects: listToArray(String(form.get("possibleProjects"))),
            interventionPriority: String(form.get("interventionPriority")) as Priority,
            approach: String(form.get("approach")) as Diagnosis["approach"],
            recommendedPackage: String(form.get("recommendedPackage")) as PackageType,
          });
        }}
      >
        <div className="flex items-center justify-between border-b border-brand-mist px-5 py-4">
          <div>
            <h2 className="font-semibold text-brand-charcoal">Editar expediente</h2>
            <p className="text-sm text-brand-charcoal/60">{diagnosis.company}</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Resumen clínico-empresarial">
              <TextArea name="summary" defaultValue={diagnosis.summary} required />
            </Field>
          </div>
          <Field label="Prioridad">
            <Select name="interventionPriority" defaultValue={diagnosis.interventionPriority}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </Select>
          </Field>
          <Field label="Enfoque">
            <Select name="approach" defaultValue={diagnosis.approach ?? "operativo"}>
              <option value="comercial">Comercial</option>
              <option value="operativo">Operativo</option>
              <option value="financiero">Financiero</option>
              <option value="digital">Digital</option>
              <option value="liderazgo">Liderazgo</option>
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Paquete recomendado">
              <Select name="recommendedPackage" defaultValue={diagnosis.recommendedPackage ?? consultingPackages[0]?.name}>
                {consultingPackages.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="md:col-span-2"><Field label="Problemas detectados, uno por línea"><TextArea name="detectedProblems" defaultValue={diagnosis.detectedProblems.join("\n")} /></Field></div>
          <div className="md:col-span-2"><Field label="Oportunidades, una por línea"><TextArea name="opportunities" defaultValue={diagnosis.opportunities.join("\n")} /></Field></div>
          <Field label="KPIs sugeridos, uno por línea"><TextArea name="suggestedKpis" defaultValue={diagnosis.suggestedKpis.join("\n")} /></Field>
          <Field label="Proyectos posibles, uno por línea"><TextArea name="possibleProjects" defaultValue={diagnosis.possibleProjects.join("\n")} /></Field>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button>Guardar expediente</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const intakeSchema = z.object({
  clientId: z.string().optional(),
  company: z.string().min(2, "Indica la empresa"),
  industry: z.string().min(2),
  size: z.string().min(2),
  currentProblems: z.string().min(10),
  objectives: z.string().min(10),
  criticalProcesses: z.string().min(4),
  tools: z.string().min(2),
  sales: z.string().min(2),
  operations: z.string().min(2),
  finance: z.string().min(2),
  marketing: z.string().min(2),
  customerService: z.string().min(2),
  urgency: z.enum(["baja", "media", "alta"]),
  budget: z.string().min(2),
  priorities: z.string().min(5),
});

type IntakeValues = z.infer<typeof intakeSchema>;

export function IntakeScreen() {
  const router = useRouter();
  const { data, addDiagnosisFromIntake } = useStore();
  const { register, handleSubmit, formState } = useForm<IntakeValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      company: "Nueva empresa demo",
      industry: "Servicios",
      size: "25 colaboradores",
      urgency: "media",
      currentProblems: "Procesos manuales, seguimiento comercial inconsistente y datos dispersos.",
      objectives: "Ordenar la operacion, mejorar visibilidad de ventas y medir KPIs semanales.",
      criticalProcesses: "Ventas, operaciones y servicio al cliente",
      tools: "Excel, WhatsApp y correo",
      sales: "No hay pipeline unico ni probabilidad de cierre.",
      operations: "Las tareas se asignan en chats y se pierden acuerdos.",
      finance: "No se comparan metas contra resultados por proyecto.",
      marketing: "Campañas sin atribucion clara.",
      customerService: "Seguimiento reactivo a quejas.",
      budget: "$80,000 - $120,000",
      priorities: "CRM, tablero de KPIs y rutina de seguimiento.",
    },
  });

  return (
    <>
      <PageHeader title="Formulario inicial / diagnostico" description="Captura intake y genera automaticamente un primer diagnostico accionable." />
      <Panel>
        <PanelHeader title="Intake consultivo" description="Las respuestas alimentan problemas, oportunidades, KPIs y proyectos sugeridos." />
        <form
          className="grid gap-4 p-5 md:grid-cols-2"
          onSubmit={handleSubmit((values) => {
            const id = addDiagnosisFromIntake(values);
            router.push(`/diagnosticos?created=${id}`);
          })}
        >
          <Field label="Cliente existente">
            <Select {...register("clientId")}>
              <option value="">Nuevo cliente / prospecto</option>
              {data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </Select>
          </Field>
          <Field label="Empresa"><TextInput {...register("company")} /></Field>
          <Field label="Industria"><TextInput {...register("industry")} /></Field>
          <Field label="Tamano"><TextInput {...register("size")} /></Field>
          <Field label="Nivel de urgencia">
            <Select {...register("urgency")}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Select>
          </Field>
          <Field label="Presupuesto estimado"><TextInput {...register("budget")} /></Field>
          {[
            ["currentProblems", "Problemas actuales"],
            ["objectives", "Objetivos"],
            ["criticalProcesses", "Procesos criticos"],
            ["tools", "Herramientas actuales"],
            ["sales", "Ventas"],
            ["operations", "Operaciones"],
            ["finance", "Finanzas"],
            ["marketing", "Marketing"],
            ["customerService", "Servicio al cliente"],
            ["priorities", "Prioridades"],
          ].map(([name, label]) => (
            <div key={name} className="md:col-span-2">
              <Field label={label}><TextArea {...register(name as keyof IntakeValues)} /></Field>
            </div>
          ))}
          {Object.keys(formState.errors).length ? (
            <p className="text-sm text-rose-600 md:col-span-2">Revisa los campos marcados; todos necesitan informacion util para diagnosticar.</p>
          ) : null}
          <div className="md:col-span-2">
            <Button><Save className="h-4 w-4" /> Generar diagnostico</Button>
          </div>
        </form>
      </Panel>
    </>
  );
}

export function DiagnosesScreen() {
  const { data } = useStore();
  const approaches = ["comercial", "operativo", "financiero", "digital", "liderazgo"];
  return (
    <>
      <PageHeader title="Diagnósticos" description="Expedientes clínico-empresariales por cliente. LC diagnostica síntomas, causa raíz, tratamiento y paquete recomendado." />
      <div className="mb-5 flex flex-wrap gap-2">
        {approaches.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}
      </div>
      <div className="grid gap-5">
        {data.clients.map((client) => {
          const diagnoses = data.diagnoses.filter((diagnosis) => diagnosis.clientId === client.id);
          return (
            <Panel key={client.id}>
              <PanelHeader title={client.name} description={`Paciente empresa · Salud ${client.health}`} action={<Link className="text-sm font-medium text-brand-navy" href={`/clientes/${client.id}`}>Abrir expediente</Link>} />
              <div className="grid gap-4 p-5 xl:grid-cols-2">
                {diagnoses.length ? diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="rounded-lg border border-brand-mist p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={priorityTone(diagnosis.interventionPriority)}>{diagnosis.interventionPriority}</Badge>
                      <Badge tone="blue">{diagnosis.approach ?? "operativo"}</Badge>
                      {diagnosis.recommendedPackage ? <Badge>{diagnosis.recommendedPackage}</Badge> : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-brand-charcoal/70">{diagnosis.summary}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <ListBlock title="Síntomas / problemas" items={diagnosis.detectedProblems} />
                      <ListBlock title="Tratamiento sugerido" items={diagnosis.possibleProjects} />
                    </div>
                  </div>
                )) : <EmptyState title="Sin diagnóstico" detail="Crea un expediente desde la vista del cliente o convierte un lead ganado." />}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

export function RecipesScreen() {
  const { data } = useStore();
  return (
    <>
      <PageHeader title="Recetario de consultoria" description="Plantillas de intervencion reutilizables para convertir diagnosticos en ejecucion." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.recipes.map((recipe) => (
          <Panel key={recipe.id}>
            <PanelHeader title={recipe.name} description={recipe.problem} action={<Badge tone={priorityTone(recipe.difficulty === "alta" ? "alta" : recipe.difficulty)}>{recipe.difficulty}</Badge>} />
            <div className="space-y-4 p-5">
              <ListBlock title="Sintomas" items={recipe.symptoms} />
              <ListBlock title="Pasos recomendados" items={recipe.steps} />
              <div className="flex flex-wrap gap-2">
                {recipe.kpis.map((kpi) => <Badge key={kpi} tone="blue">{kpi}</Badge>)}
              </div>
              <p className="text-sm text-slate-500">{recipe.durationWeeks} semanas · {recipe.deliverables.join(", ")}</p>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

export function RecipesEditorScreen() {
  const { data, upsertRecipe } = useStore();
  const [editing, setEditing] = useState<Recipe | null>(null);

  return (
    <>
      <PageHeader title="Recetario de consultoría" description="Plantillas editables para convertir diagnósticos en ejecución.">
        <Button onClick={() => setEditing({
          id: "",
          name: "Nueva receta",
          problem: "",
          symptoms: [],
          steps: [],
          kpis: [],
          deliverables: [],
          durationWeeks: 2,
          difficulty: "media",
          suggestedTasks: [],
          templates: [],
        })}><Plus className="h-4 w-4" />Nueva receta</Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.recipes.map((recipe) => (
          <Panel key={recipe.id}>
            <PanelHeader title={recipe.name} description={recipe.problem} action={<Badge tone={priorityTone(recipe.difficulty === "alta" ? "alta" : recipe.difficulty)}>{recipe.difficulty}</Badge>} />
            <div className="space-y-4 p-5">
              <ListBlock title="Síntomas" items={recipe.symptoms} />
              <ListBlock title="Pasos recomendados" items={recipe.steps} />
              <div className="flex flex-wrap gap-2">
                {recipe.kpis.map((kpi) => <Badge key={kpi} tone="blue">{kpi}</Badge>)}
              </div>
              <p className="text-sm text-brand-charcoal/60">{recipe.durationWeeks} semanas · {recipe.deliverables.join(", ")}</p>
              <Button variant="secondary" onClick={() => setEditing(recipe)}>Editar receta</Button>
            </div>
          </Panel>
        ))}
      </div>
      {editing ? (
        <RecipeEditor
          recipe={editing}
          onClose={() => setEditing(null)}
          onSave={(recipe) => {
            upsertRecipe(recipe);
            setEditing(null);
          }}
        />
      ) : null}
    </>
  );
}

function listToArray(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function RecipeEditor({
  recipe,
  onClose,
  onSave,
}: {
  recipe: Recipe;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-charcoal/60 p-4">
      <form
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onSave({
            id: recipe.id || `recipe_${Date.now()}`,
            name: String(form.get("name")),
            problem: String(form.get("problem")),
            symptoms: listToArray(String(form.get("symptoms"))),
            steps: listToArray(String(form.get("steps"))),
            kpis: listToArray(String(form.get("kpis"))),
            deliverables: listToArray(String(form.get("deliverables"))),
            durationWeeks: Number(form.get("durationWeeks")),
            difficulty: String(form.get("difficulty")) as Recipe["difficulty"],
            suggestedTasks: listToArray(String(form.get("suggestedTasks"))),
            templates: listToArray(String(form.get("templates"))),
          });
        }}
      >
        <div className="flex items-center justify-between border-b border-brand-mist px-5 py-4">
          <h2 className="font-semibold text-brand-charcoal">Editar receta</h2>
          <Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label="Nombre"><TextInput name="name" defaultValue={recipe.name} required /></Field>
          <Field label="Duración estimada"><TextInput name="durationWeeks" type="number" defaultValue={recipe.durationWeeks} required /></Field>
          <Field label="Dificultad"><Select name="difficulty" defaultValue={recipe.difficulty}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></Select></Field>
          <div className="md:col-span-2"><Field label="Problema que resuelve"><TextArea name="problem" defaultValue={recipe.problem} required /></Field></div>
          <div className="md:col-span-2"><Field label="Síntomas comunes, uno por línea"><TextArea name="symptoms" defaultValue={recipe.symptoms.join("\n")} /></Field></div>
          <div className="md:col-span-2"><Field label="Pasos recomendados, uno por línea"><TextArea name="steps" defaultValue={recipe.steps.join("\n")} /></Field></div>
          <Field label="KPIs, uno por línea"><TextArea name="kpis" defaultValue={recipe.kpis.join("\n")} /></Field>
          <Field label="Entregables, uno por línea"><TextArea name="deliverables" defaultValue={recipe.deliverables.join("\n")} /></Field>
          <Field label="Tareas sugeridas, una por línea"><TextArea name="suggestedTasks" defaultValue={recipe.suggestedTasks.join("\n")} /></Field>
          <Field label="Plantillas, una por línea"><TextArea name="templates" defaultValue={recipe.templates.join("\n")} /></Field>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button>Guardar receta</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ProjectsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, updateProject, updateTaskStatus } = useStore();
  const view = ["modulos", "tabla", "gantt", "tareas"].includes(searchParams.get("view") ?? "")
    ? (searchParams.get("view") as "modulos" | "tabla" | "gantt" | "tareas")
    : "modulos";

  const selectProjectView = (nextView: "modulos" | "tabla" | "gantt" | "tareas") => {
    router.replace(`/proyectos?view=${nextView}`);
  };

  const projectTable = (
    <Panel>
      <PanelHeader title="Proyectos activos" description="Click para abrir la administración individual." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
            <tr>
              <th className="px-5 py-3">Proyecto</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Paquete</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Prioridad</th>
              <th className="px-5 py-3">Avance</th>
              <th className="px-5 py-3">Presupuesto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-mist">
            {data.projects.map((project) => {
              const client = data.clients.find((item) => item.id === project.clientId);
              return (
                <tr key={project.id} className="hover:bg-brand-gold/10">
                  <td className="px-5 py-4"><Link href={`/proyectos/${project.id}`} className="font-medium text-brand-charcoal">{project.name}</Link></td>
                  <td className="px-5 py-4">{client?.name}</td>
                  <td className="px-5 py-4">{project.packageType ?? "Sin paquete"}</td>
                  <td className="px-5 py-4"><Badge tone={statusTone(project.status)}>{project.status}</Badge></td>
                  <td className="px-5 py-4"><Badge tone={priorityTone(project.priority)}>{project.priority}</Badge></td>
                  <td className="px-5 py-4">{pct(project.progress)}</td>
                  <td className="px-5 py-4">{money(project.budget)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  return (
    <>
      <PageHeader title="Proyectos" description="Control global por modulos independientes: cada proyecto tiene receta, KPIs, tareas y avance propio.">
        <div className="flex flex-wrap gap-2">
          <IconToggle active={view === "modulos"} label="Vista modulos" onClick={() => selectProjectView("modulos")}>
            <LayoutGrid className="h-4 w-4" />
          </IconToggle>
          <IconToggle active={view === "tabla"} label="Vista tabla" onClick={() => selectProjectView("tabla")}>
            <Table2 className="h-4 w-4" />
          </IconToggle>
          <IconToggle active={view === "gantt"} label="Vista Gantt" onClick={() => selectProjectView("gantt")}>
            <GanttChart className="h-4 w-4" />
          </IconToggle>
          <IconToggle active={view === "tareas"} label="Vista tareas" onClick={() => selectProjectView("tareas")}>
            <CheckCircle2 className="h-4 w-4" />
          </IconToggle>
        </div>
      </PageHeader>
      {view === "tabla" ? projectTable : null}
      {view === "modulos" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((project) => {
            const client = data.clients.find((item) => item.id === project.clientId);
            const recipe = data.recipes.find((item) => item.id === project.assignedRecipeId);
            const projectKpis = data.kpis.filter((kpi) => project.kpiIds.includes(kpi.id) || kpi.projectId === project.id);
            const openTasks = data.tasks.filter((task) => task.projectId === project.id && task.status !== "terminada");
            return (
              <article key={project.id} className="group rounded-lg border border-brand-charcoal/15 bg-white p-5 shadow-sm shadow-brand-charcoal/10 transition hover:-translate-y-0.5 hover:border-brand-gold hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/proyectos/${project.id}`} className="text-base font-semibold text-brand-charcoal hover:text-brand-navy">
                      {project.name}
                    </Link>
                    <p className="mt-1 text-sm text-brand-charcoal/55">{client?.name ?? "Sin cliente"} · {project.owner}</p>
                  </div>
                  <Badge tone={priorityTone(project.priority)}>{project.priority}</Badge>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-brand-charcoal/70">{project.objective}</p>
                <div className="mt-5 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-md bg-brand-paper px-3 py-2">
                    <span className="text-brand-charcoal/55">Estado</span>
                    <Select className="h-8 w-36" value={project.status} onChange={(event) => updateProject(project.id, { status: event.currentTarget.value as ProjectStatus })}>
                      {["planeado", "en progreso", "pausado", "en revision", "completado", "cancelado"].map((status) => <option key={status}>{status}</option>)}
                    </Select>
                  </div>
                  <ModuleProperty label="Receta" value={recipe?.name ?? "Proyecto personalizado"} />
                  <ModuleProperty label="KPIs definidos" value={`${projectKpis.length}`} />
                  <ModuleProperty label="Tareas abiertas" value={`${openTasks.length}`} />
                  <ModuleProperty label="Paquete" value={project.packageType ?? "Sin paquete"} />
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-brand-charcoal/55">
                    <span>Avance</span>
                    <span>{pct(project.progress)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-brand-mist">
                    <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <Link href={`/proyectos/${project.id}`} className="mt-5 inline-flex text-sm font-medium text-brand-navy hover:underline">
                  Abrir modulo del proyecto
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
      {view === "gantt" ? <GanttScreen embedded /> : null}
      {view === "tareas" ? (
        <Panel>
          <PanelHeader title="Tareas por proyecto" description="Vista global de ejecución." />
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {data.projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-brand-mist p-4">
                <Link href={`/proyectos/${project.id}`} className="font-semibold text-brand-charcoal">{project.name}</Link>
                <div className="mt-3 space-y-2">
                  {data.tasks.filter((task) => task.projectId === project.id).map((task) => (
                    <div key={task.id} className="rounded-md bg-brand-paper p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {taskStatuses.map((status) => (
                          <button key={status} className="text-xs text-brand-navy underline" onClick={() => updateTaskStatus(task.id, status)}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </>
  );
}

function ModuleProperty({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-brand-paper px-3 py-2">
      <span className="shrink-0 text-brand-charcoal/55">{label}</span>
      <span className="text-right font-medium text-brand-charcoal">{value}</span>
    </div>
  );
}

export function ProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { data, updateProject, addKpi } = useStore();
  const [tab, setTab] = useState<"control" | "tareas" | "gantt" | "juntas" | "kpis">("control");
  const [showKpiForm, setShowKpiForm] = useState(false);
  const project = data.projects.find((item) => item.id === id);
  if (!project) return <EmptyState title="Proyecto no encontrado" detail="Revisa el proyecto seleccionado." />;
  const client = data.clients.find((item) => item.id === project.clientId);
  const tasks = data.tasks.filter((task) => task.projectId === project.id);
  const phases = data.phases.filter((phase) => phase.projectId === project.id);
  const kpis = data.kpis.filter((kpi) => project.kpiIds.includes(kpi.id) || kpi.projectId === project.id);
  const meetings = data.meetings.filter((meeting) => meeting.projectId === project.id);
  const assignedRecipe = data.recipes.find((recipe) => recipe.id === project.assignedRecipeId);

  return (
    <>
      <PageHeader title={project.name} description={project.objective}>
        <Badge tone={statusTone(project.status)}>{project.status}</Badge>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Cliente" value={client?.name ?? "Sin cliente"} detail={project.owner} />
        <Stat label="Presupuesto" value={money(project.budget)} detail={project.priority} tone="blue" />
        <Stat label="Avance" value={pct(project.progress)} detail={`${shortDate(project.startsAt)} - ${shortDate(project.endsAt)}`} tone="green" />
        <Stat label="Tareas" value={`${tasks.length}`} detail={`${tasks.filter((task) => task.status !== "terminada").length} abiertas`} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["control", "tareas", "gantt", "juntas", "kpis"] as const).map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "secondary"} onClick={() => setTab(item)}>{item}</Button>
        ))}
      </div>
      {tab === "control" ? (
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <PanelHeader title="Control del proyecto" description={project.scope} />
          <div className="space-y-4 p-5">
            <Field label="Estado">
              <Select value={project.status} onChange={(event) => updateProject(project.id, { status: event.target.value as ProjectStatus })}>
                {["planeado", "en progreso", "pausado", "en revision", "completado", "cancelado"].map((status) => <option key={status}>{status}</option>)}
              </Select>
            </Field>
            <Field label="Avance">
              <TextInput type="number" min="0" max="100" value={project.progress} onChange={(event) => updateProject(project.id, { progress: Number(event.target.value) })} />
            </Field>
            <Field label="Fase LEAD">
              <Select value={project.leadPhase ?? "listen"} onChange={(event) => updateProject(project.id, { leadPhase: event.target.value as NonNullable<typeof project.leadPhase> })}>
                <option value="listen">L - Listen</option>
                <option value="evaluate">E - Evaluate</option>
                <option value="act">A - Act</option>
                <option value="develop">D - Develop</option>
              </Select>
            </Field>
            <Field label="Receta del proyecto">
              <Select value={project.assignedRecipeId ?? ""} onChange={(event) => updateProject(project.id, { assignedRecipeId: event.currentTarget.value || undefined })}>
                <option value="">Proyecto personalizado sin receta base</option>
                {data.recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
              </Select>
            </Field>
            {assignedRecipe ? (
              <div className="rounded-lg border border-brand-mist bg-brand-paper p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{assignedRecipe.name}</p>
                    <p className="mt-1 text-sm leading-6 text-brand-charcoal/65">{assignedRecipe.problem}</p>
                  </div>
                  <Link href="/recetario" className="text-sm font-medium text-brand-navy hover:underline">Editar recetario</Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignedRecipe.kpis.map((kpi) => <Badge key={kpi} tone="blue">{kpi}</Badge>)}
                </div>
              </div>
            ) : null}
            <Field label="Hipotesis inicial">
              <TextArea value={project.initialHypothesis ?? ""} onChange={(event) => updateProject(project.id, { initialHypothesis: event.target.value })} />
            </Field>
            <Field label="Hallazgos reales">
              <TextArea value={project.realFindings ?? ""} onChange={(event) => updateProject(project.id, { realFindings: event.target.value })} />
            </Field>
            <Field label="Causa raiz">
              <TextArea value={project.rootCause ?? ""} onChange={(event) => updateProject(project.id, { rootCause: event.target.value })} />
            </Field>
            <ListBlock title="Riesgos" items={project.risks} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Fases y entregables de trabajo" description="Gantt resumido del proyecto." />
          <div className="space-y-4 p-5">
            {phases.map((phase) => (
              <div key={phase.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-slate-500">{phase.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-brand-mist">
                  <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${phase.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{shortDate(phase.startsAt)} - {shortDate(phase.endsAt)}</p>
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-2">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.owner} · {shortDate(task.dueDate)}</p>
                </div>
              ))}
            </div>
            {kpis.map((kpi) => <Badge key={kpi.id} tone={statusTone(kpi.status)}>{kpi.name}</Badge>)}
          </div>
        </Panel>
      </div>
      ) : null}
      {tab === "tareas" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-brand-mist bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-sm text-brand-charcoal/60">{task.owner} · {shortDate(task.dueDate)}</p>
                </div>
                <Badge tone={statusTone(task.status)}>{task.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-brand-charcoal/70">{task.description}</p>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "gantt" ? (
        <Panel className="mt-6">
          <PanelHeader title="Gantt del proyecto" description="Fases y avance individual." />
          <div className="space-y-4 p-5">
            {phases.map((phase) => (
              <div key={phase.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{phase.name}</span>
                  <span className="text-brand-charcoal/60">{shortDate(phase.startsAt)} - {shortDate(phase.endsAt)}</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-brand-mist">
                  <div className="h-3 rounded-full bg-brand-gold" style={{ width: `${phase.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {tab === "juntas" ? (
        <Panel className="mt-6">
          <PanelHeader title="Bitácora de juntas" description="Minutas, acuerdos, decisiones y riesgos del proyecto." />
          <div className="space-y-4 p-5">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="rounded-lg border border-brand-mist p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{meeting.title}</p>
                  <Badge>{shortDate(meeting.date)}</Badge>
                </div>
                <p className="mt-2 text-sm text-brand-charcoal/70">{meeting.minutes}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <ListBlock title="Acuerdos" items={meeting.agreements} />
                  <ListBlock title="Decisiones" items={meeting.decisions} />
                  <ListBlock title="Riesgos" items={meeting.risks} />
                </div>
              </div>
            ))}
            {!meetings.length ? <EmptyState title="Sin juntas" detail="Las reuniones ahora se registran dentro del proyecto." /> : null}
          </div>
        </Panel>
      ) : null}
      {tab === "kpis" ? (
        <div className="mt-6 space-y-4">
          <Panel>
            <PanelHeader
              title="KPIs del proyecto"
              description="Las recetas sugieren indicadores; aqui LC define los KPIs reales de exito para este cliente."
              action={<Button onClick={() => setShowKpiForm((value) => !value)}><Plus className="h-4 w-4" />Nuevo KPI</Button>}
            />
            {assignedRecipe ? (
              <div className="border-b border-brand-mist bg-brand-paper px-5 py-4">
                <p className="text-xs font-semibold uppercase text-brand-charcoal/45">Sugerencias desde receta</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignedRecipe.kpis.map((kpi) => <Badge key={kpi} tone="blue">{kpi}</Badge>)}
                </div>
              </div>
            ) : null}
            {showKpiForm ? (
              <form
                className="grid gap-4 border-b border-brand-mist p-5 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  addKpi({
                    clientId: project.clientId,
                    projectId: project.id,
                    name: String(form.get("name")),
                    description: String(form.get("description")),
                    formula: String(form.get("formula")),
                    currentValue: Number(form.get("currentValue") || 0),
                    target: Number(form.get("target") || 0),
                    unit: String(form.get("unit") || ""),
                    frequency: String(form.get("frequency") || "Semanal"),
                    owner: String(form.get("owner") || project.owner),
                    source: String(form.get("source") || "Definido en proyecto"),
                    status: "alerta",
                  });
                  setShowKpiForm(false);
                }}
              >
                <Field label="Nombre del KPI"><TextInput name="name" required /></Field>
                <Field label="Responsable"><TextInput name="owner" defaultValue={project.owner} /></Field>
                <div className="md:col-span-2"><Field label="Descripcion"><TextArea name="description" required /></Field></div>
                <Field label="Formula"><TextInput name="formula" placeholder="Ej. Ventas cerradas / oportunidades" /></Field>
                <Field label="Fuente / baseline"><TextInput name="source" placeholder="CRM, Excel, sistema del cliente..." /></Field>
                <Field label="Valor actual"><TextInput name="currentValue" type="number" defaultValue={0} /></Field>
                <Field label="Meta"><TextInput name="target" type="number" defaultValue={100} /></Field>
                <Field label="Unidad"><TextInput name="unit" placeholder="%, dias, $, clientes..." /></Field>
                <Field label="Frecuencia"><TextInput name="frequency" defaultValue="Semanal" /></Field>
                <div className="flex justify-end gap-2 md:col-span-2">
                  <Button type="button" variant="secondary" onClick={() => setShowKpiForm(false)}>Cancelar</Button>
                  <Button>Guardar KPI</Button>
                </div>
              </form>
            ) : null}
          </Panel>
          <div className="grid gap-4 md:grid-cols-2">
            {kpis.map((kpi) => <Panel key={kpi.id}><PanelHeader title={kpi.name} description={kpi.description} action={<Badge tone={statusTone(kpi.status)}>{kpi.status}</Badge>} /><div className="space-y-4 p-5"><div className="grid gap-3 md:grid-cols-3"><Stat label="Actual" value={`${kpi.currentValue}${kpi.unit}`} detail={kpi.source} /><Stat label="Meta" value={`${kpi.target}${kpi.unit}`} detail={kpi.frequency} tone="green" /><Stat label="Formula" value={kpi.formula || "Manual"} detail={kpi.owner} tone="blue" /></div><KpiTrend measurements={data.kpiMeasurements.filter((item) => item.kpiId === kpi.id)} target={kpi.target} /></div></Panel>)}
            {!kpis.length ? <ActionEmptyState icon={<LineChart className="h-5 w-5" />} title="Sin KPIs definidos" detail="Agrega indicadores propios para este proyecto. Puedes tomar ideas de la receta, pero deben validarse con el cliente." action={<Button onClick={() => setShowKpiForm(true)}>Definir primer KPI</Button>} /> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function GanttScreen({ embedded = false }: { embedded?: boolean }) {
  const { data, updateProject } = useStore();
  const min = new Date("2026-05-15").getTime();
  const max = new Date("2026-08-05").getTime();
  const span = max - min;
  return (
    <>
      {!embedded ? <PageHeader title="Gantt" description="Vista temporal básica por proyectos y fases; fechas editables desde proyecto." /> : null}
      <Panel>
        <PanelHeader title="Cronograma" description="Incluye fases, atrasos y avance relativo." />
        <div className="space-y-6 overflow-x-auto p-5">
          {data.projects.map((project) => {
            const start = new Date(project.startsAt).getTime();
            const end = new Date(project.endsAt).getTime();
            const left = ((start - min) / span) * 100;
            const width = ((end - start) / span) * 100;
            return (
              <div key={project.id} className="min-w-[760px]">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <Link href={`/proyectos/${project.id}`} className="font-medium">{project.name}</Link>
                  <div className="flex items-center gap-2">
                    <TextInput type="date" value={project.startsAt} onChange={(event) => updateProject(project.id, { startsAt: event.target.value })} />
                    <TextInput type="date" value={project.endsAt} onChange={(event) => updateProject(project.id, { endsAt: event.target.value })} />
                  </div>
                </div>
                <div className="relative h-9 rounded-md bg-brand-mist">
                  <div className="absolute top-1 h-7 rounded-md bg-brand-navy" style={{ left: `${Math.max(left, 0)}%`, width: `${Math.max(width, 4)}%` }} />
                  <div className="absolute top-1 h-7 rounded-md bg-brand-gold" style={{ left: `${Math.max(left, 0)}%`, width: `${Math.max((width * project.progress) / 100, 2)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

export function TasksScreen() {
  const { data, updateTaskStatus } = useStore();
  return (
    <>
      <PageHeader title="Tareas" description="Kanban operativo con prioridad, responsable, checklist y relacion con KPI o entregable." />
      <div className="grid gap-4 overflow-x-auto xl:grid-cols-5">
        {taskStatuses.map((status) => {
          const tasks = data.tasks.filter((task) => task.status === status);
          return (
            <Panel key={status} className="min-w-64">
              <PanelHeader title={status} description={`${tasks.length} tareas`} />
              <div className="space-y-3 p-3">
                {tasks.map((task) => {
                  const client = data.clients.find((item) => item.id === task.clientId);
                  return (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold">{task.title}</h3>
                        <Badge tone={priorityTone(task.priority)}>{task.priority}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{client?.name}</p>
                      <p className="mt-2 text-xs text-slate-500">Vence {shortDate(task.dueDate)} · {task.owner}</p>
                      <div className="mt-3 space-y-1">
                        {task.checklist.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 className={cn("h-3.5 w-3.5", item.done ? "text-emerald-600" : "text-slate-300")} />
                            {item.label}
                          </div>
                        ))}
                      </div>
                      <Select className="mt-3" value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}>
                        {taskStatuses.map((next) => <option key={next}>{next}</option>)}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

export function KpisScreen() {
  const { data } = useStore();
  const [scope, setScope] = useState<"global" | "cliente" | "proyecto" | "crm">("global");
  const filteredKpis =
    scope === "global"
      ? data.kpis
      : scope === "proyecto"
        ? data.kpis.filter((kpi) => kpi.projectId)
        : scope === "crm"
          ? data.kpis.filter((kpi) => kpi.source.toLowerCase().includes("crm"))
          : data.kpis.filter((kpi) => kpi.clientId);
  const avgProgress = Math.round(data.projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(data.projects.length, 1));
  const wonLeads = data.leads.filter((lead) => lead.stage === "cliente ganado").length;
  const pipelineValue = data.leads.reduce((sum, lead) => sum + lead.estimatedValue * (lead.closeProbability / 100), 0);

  return (
    <>
      <PageHeader title="KPIs" description="Indicadores globales, por cliente, por proyecto y del CRM." />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <Stat label="Avance promedio" value={`${avgProgress}%`} detail="Proyectos activos" tone="green" />
        <Stat label="Pipeline ponderado" value={money(pipelineValue)} detail="CRM comercial" tone="blue" />
        <Stat label="Leads ganados" value={`${wonLeads}`} detail="Conversión a cliente" />
        <Stat label="KPIs críticos" value={`${data.kpis.filter((kpi) => kpi.status === "critico").length}`} detail="Requieren tratamiento" tone="red" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["global", "cliente", "proyecto", "crm"] as const).map((item) => (
          <Button key={item} variant={scope === item ? "primary" : "secondary"} onClick={() => setScope(item)}>{item}</Button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {filteredKpis.map((kpi) => {
          const measurements = data.kpiMeasurements.filter((item) => item.kpiId === kpi.id);
          const client = data.clients.find((item) => item.id === kpi.clientId);
          const project = data.projects.find((item) => item.id === kpi.projectId);
          return (
            <Panel key={kpi.id}>
              <PanelHeader title={kpi.name} description={`${client?.name ?? "Global"}${project ? ` · ${project.name}` : ""}`} action={<span className={cn("rounded-md border px-2 py-1 text-xs font-medium", kpiTone(kpi.status))}>{kpi.status}</span>} />
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500">Actual</p><p className="text-2xl font-semibold">{kpi.currentValue}{kpi.unit}</p></div>
                  <div><p className="text-slate-500">Meta</p><p className="text-2xl font-semibold">{kpi.target}{kpi.unit}</p></div>
                </div>
                <KpiTrend measurements={measurements} target={kpi.target} />
                <p className="text-sm text-slate-500">{kpi.formula} · {kpi.frequency} · Fuente: {kpi.source}</p>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

export function MeetingsScreen() {
  const { data, createTasksFromMeeting } = useStore();
  const [message, setMessage] = useState("");
  return (
    <>
      <PageHeader title="Reuniones y seguimiento" description="Minutas con acuerdos, decisiones, riesgos y tareas generables." />
      {message ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {data.meetings.map((meeting) => {
          const client = data.clients.find((item) => item.id === meeting.clientId);
          return (
            <Panel key={meeting.id}>
              <PanelHeader title={meeting.title} description={`${client?.name} · ${shortDate(meeting.date)}`} action={<Button variant="secondary" onClick={() => setMessage(`Se crearon ${createTasksFromMeeting(meeting.id)} tareas desde acuerdos.`)}><CalendarPlus className="h-4 w-4" />Crear tareas</Button>} />
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <p className="text-sm leading-6 text-slate-600 md:col-span-2">{meeting.minutes}</p>
                <ListBlock title="Acuerdos" items={meeting.agreements} />
                <ListBlock title="Decisiones" items={meeting.decisions} />
                <ListBlock title="Riesgos" items={meeting.risks} />
                <div><h3 className="text-sm font-semibold">Proxima reunion</h3><p className="mt-2 text-sm text-slate-600">{shortDate(meeting.nextMeeting)}</p></div>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

export function DeliverablesScreen() {
  const { data } = useStore();
  return (
    <>
      <PageHeader title="Entregables" description="Compromisos por cliente y proyecto, con aprobacion del cliente." />
      <Panel>
        <PanelHeader title="Registro de entregables" description="Preparado para adjuntos y storage de Supabase." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">Entregable</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Aprobado</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.deliverables.map((item) => {
                const client = data.clients.find((clientItem) => clientItem.id === item.clientId);
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-4"><p className="font-medium">{item.name}</p><p className="text-slate-500">{item.description}</p></td>
                    <td className="px-5 py-4">{client?.name}</td>
                    <td className="px-5 py-4"><Badge tone={statusTone(item.status)}>{item.status}</Badge></td>
                    <td className="px-5 py-4">{shortDate(item.dueDate)}</td>
                    <td className="px-5 py-4">{item.approvedByClient ? "Si" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function ConsultantsScreen() {
  const { data, addConsultant } = useStore();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [showForm, setShowForm] = useState(false);
  const statuses = ["disponible", "ocupado", "pausado"] as const;

  return (
    <>
      <PageHeader title="Consultores" description="Capacidad, especialidades y proyectos asignados por consultor.">
        <div className="flex flex-wrap gap-2">
          <IconToggle active={view === "kanban"} label="Vista kanban" onClick={() => setView("kanban")}>
            <Columns3 className="h-4 w-4" />
          </IconToggle>
          <IconToggle active={view === "lista"} label="Vista lista" onClick={() => setView("lista")}>
            <Table2 className="h-4 w-4" />
          </IconToggle>
          <Button onClick={() => setShowForm((value) => !value)}><Plus className="h-4 w-4" />Registrar</Button>
        </div>
      </PageHeader>
      {showForm ? (
        <Panel className="mb-5">
          <PanelHeader title="Nuevo consultor" description="Registro básico para asignación futura." />
          <form
            className="grid gap-4 p-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              addConsultant({
                name: String(form.get("name")),
                role: String(form.get("role")),
                email: String(form.get("email")),
                phone: String(form.get("phone")),
                specialties: String(form.get("specialties")).split(",").map((item) => item.trim()).filter(Boolean),
                status: String(form.get("status")) as "disponible" | "ocupado" | "pausado",
                capacity: Number(form.get("capacity")),
              });
              setShowForm(false);
            }}
          >
            <Field label="Nombre"><TextInput name="name" required /></Field>
            <Field label="Rol"><TextInput name="role" required /></Field>
            <Field label="Email"><TextInput name="email" type="email" required /></Field>
            <Field label="Teléfono"><TextInput name="phone" /></Field>
            <Field label="Especialidades separadas por coma"><TextInput name="specialties" /></Field>
            <Field label="Estado"><Select name="status"><option>disponible</option><option>ocupado</option><option>pausado</option></Select></Field>
            <Field label="Capacidad %"><TextInput name="capacity" type="number" min="0" max="100" defaultValue={50} /></Field>
            <div className="md:col-span-2"><Button>Guardar consultor</Button></div>
          </form>
        </Panel>
      ) : null}
      {view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {statuses.map((status) => (
            <Panel key={status}>
              <PanelHeader title={status} description={`${data.consultants.filter((item) => item.status === status).length} consultores`} />
              <div className="space-y-3 p-4">
                {data.consultants.filter((consultant) => consultant.status === status).map((consultant) => (
                  <ConsultantCard key={consultant.id} consultantId={consultant.id} />
                ))}
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel>
          <PanelHeader title="Lista de consultores" description="Carga y proyectos por persona." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Rol</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Capacidad</th><th className="px-5 py-3">Proyectos</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {data.consultants.map((consultant) => (
                  <tr key={consultant.id}>
                    <td className="px-5 py-4 font-medium">{consultant.name}</td>
                    <td className="px-5 py-4">{consultant.role}</td>
                    <td className="px-5 py-4"><Badge tone={consultant.status === "disponible" ? "green" : consultant.status === "ocupado" ? "yellow" : "red"}>{consultant.status}</Badge></td>
                    <td className="px-5 py-4">{consultant.capacity}%</td>
                    <td className="px-5 py-4">{consultant.projectIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}

function ConsultantCard({ consultantId }: { consultantId: string }) {
  const { data } = useStore();
  const consultant = data.consultants.find((item) => item.id === consultantId);
  if (!consultant) return null;
  const projects = data.projects.filter((project) => consultant.projectIds.includes(project.id));

  return (
    <div className="rounded-lg border border-brand-mist bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{consultant.name}</p>
          <p className="text-sm text-brand-charcoal/60">{consultant.role}</p>
        </div>
        <Badge tone={consultant.status === "disponible" ? "green" : consultant.status === "ocupado" ? "yellow" : "red"}>{consultant.status}</Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-brand-mist"><div className="h-2 rounded-full bg-brand-gold" style={{ width: `${consultant.capacity}%` }} /></div>
      <div className="mt-3 flex flex-wrap gap-2">
        {consultant.specialties.map((item) => <Badge key={item}>{item}</Badge>)}
      </div>
      <div className="mt-3 space-y-1 text-sm text-brand-charcoal/70">
        {projects.map((project) => <Link key={project.id} href={`/proyectos/${project.id}`} className="block text-brand-navy">{project.name}</Link>)}
      </div>
    </div>
  );
}

export function FinancialsScreen() {
  const { data } = useStore();
  const invoiced = data.invoices.filter((invoice) => invoice.status !== "cancelada").reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const expenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const receivable = Math.max(0, invoiced - paid);
  const activeProjectValue = data.projects.filter((project) => project.status !== "cancelado").reduce((sum, project) => sum + project.budget, 0);
  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === "vencida");

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Vista global del negocio. Cada factura, pago, gasto e ingreso pertenece a un cliente o proyecto especifico."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Ingresos facturados" value={money(invoiced)} detail={`${data.invoices.length} facturas`} tone="blue" />
        <Stat label="Cobrado" value={money(paid)} detail={`${data.payments.length} pagos`} tone="green" />
        <Stat label="Por cobrar" value={money(receivable)} detail={`${overdueInvoices.length} vencidas`} tone={overdueInvoices.length ? "red" : "yellow"} />
        <Stat label="Gastos" value={money(expenses)} detail={`${data.expenses.length} registros`} tone="red" />
        <Stat label="Valor activo" value={money(activeProjectValue)} detail="Proyectos en cartera" tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Panel>
          <PanelHeader title="Cartera de facturas" description="Cobranza vinculada a clientes y proyectos." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr><th className="px-5 py-3">Folio</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Proyecto</th><th className="px-5 py-3">Concepto</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Estado</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {data.invoices.map((invoice) => {
                  const client = data.clients.find((item) => item.id === invoice.clientId);
                  const project = data.projects.find((item) => item.id === invoice.projectId);
                  return (
                    <tr key={invoice.id} className="hover:bg-brand-gold/10">
                      <td className="px-5 py-4 font-medium">{invoice.folio}</td>
                      <td className="px-5 py-4">{client?.name ?? "Sin cliente"}</td>
                      <td className="px-5 py-4">{project?.name ?? "Sin proyecto"}</td>
                      <td className="px-5 py-4">{invoice.concept}</td>
                      <td className="px-5 py-4">{money(invoice.total)}</td>
                      <td className="px-5 py-4"><Badge tone={invoice.status === "pagada" ? "green" : invoice.status === "vencida" ? "red" : "yellow"}>{invoice.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Gastos por proyecto" description="Egresos internos y reembolsables asociados a clientes." />
          <div className="space-y-3 p-5">
            {data.expenses.map((expense) => {
              const client = data.clients.find((item) => item.id === expense.clientId);
              const project = data.projects.find((item) => item.id === expense.projectId);
              return (
                <div key={expense.id} className="rounded-lg border border-brand-mist p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-charcoal">{expense.description}</p>
                      <p className="mt-1 text-sm text-brand-charcoal/55">{client?.name ?? "Interno LC"} - {project?.name ?? expense.category}</p>
                    </div>
                    <Badge tone={expense.billable ? "blue" : "neutral"}>{expense.billable ? "facturable" : "interno"}</Badge>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-brand-charcoal">{money(expense.amount)}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function ReportsScreen() {
  const { data, generateReport } = useStore();
  const [period, setPeriod] = useState("Julio 2026");
  const [type, setType] = useState<"ejecutivo cliente" | "avance proyecto" | "kpis" | "tareas atrasadas" | "crm comercial" | "mensual consultoria">("mensual consultoria");

  async function downloadPdf(reportId: string) {
    const report = data.reports.find((item) => item.id === reportId);
    if (!report) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 49, 72);
    doc.setFontSize(18);
    doc.text("Leading Connections", 18, 20);
    doc.setTextColor(43, 43, 43);
    doc.setFontSize(14);
    doc.text(report.title, 18, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Periodo: ${report.period}`, 18, 44);
    doc.text(`Tipo: ${report.type}`, 18, 52);
    doc.text(`Generado: ${report.generatedAt ?? new Date().toISOString().slice(0, 10)}`, 18, 60);
    const lines = doc.splitTextToSize(report.summary, 174);
    doc.text(lines, 18, 76);
    doc.save(`${report.title.replaceAll(" ", "_")}.pdf`);
  }

  return (
    <>
      <PageHeader title="Reportes" description="Genera resumen por periodo definido y descarga PDF real." />
      <Panel className="mb-5">
        <PanelHeader title="Generar reporte" description="Define periodo y tipo de resumen." />
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
          <Field label="Periodo"><TextInput value={period} onChange={(event) => setPeriod(event.target.value)} /></Field>
          <Field label="Tipo">
            <Select value={type} onChange={(event) => setType(event.target.value as typeof type)}>
              <option value="ejecutivo cliente">Ejecutivo cliente</option>
              <option value="avance proyecto">Avance proyecto</option>
              <option value="kpis">KPIs</option>
              <option value="tareas atrasadas">Tareas atrasadas</option>
              <option value="crm comercial">CRM comercial</option>
              <option value="mensual consultoria">Mensual consultoría</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={() => generateReport(period, type)}>Generar</Button>
          </div>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.reports.map((report) => (
          <Panel key={report.id}>
            <PanelHeader title={report.title} description={report.period} action={<Badge tone={report.status === "listo" ? "green" : "yellow"}>{report.status}</Badge>} />
            <div className="p-5">
              <Badge tone="blue">{report.type}</Badge>
              <p className="mt-4 text-sm leading-6 text-brand-charcoal/70">{report.summary}</p>
              <Button className="mt-5" variant="secondary" onClick={() => downloadPdf(report.id)}><FileDown className="h-4 w-4" />Descargar PDF</Button>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

export function SettingsScreen() {
  const { user, data, resetDemo, addInvoice, addExpense } = useStore();
  const [tab, setTab] = useState<"sistema" | "equipo" | "paquetes" | "finanzas">("sistema");
  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const totals = useMemo(() => [
    ["Leads", data.leads.length],
    ["Clientes", data.clients.length],
    ["Proyectos", data.projects.length],
    ["Facturas", data.invoices.length],
    ["Gastos", data.expenses.length],
    ["Horas", data.timeEntries.length],
  ], [data]);
  const invoicedRevenue = data.invoices.filter((invoice) => invoice.status !== "cancelada").reduce((sum, invoice) => sum + invoice.total, 0);
  const collectedRevenue = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const expenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const accountsReceivable = Math.max(0, invoicedRevenue - collectedRevenue);
  const billableHours = data.timeEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
  const tabs = ["sistema", "equipo", "paquetes", "finanzas"] as const;

  return (
    <>
      <PageHeader title="Configuracion" description="ERP interno de LC: sistema, equipo, paquetes, facturacion, gastos y control administrativo." />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "secondary"} onClick={() => setTab(item)}>{item}</Button>
        ))}
      </div>

      {tab === "sistema" ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel>
            <PanelHeader title="Workspace" description={data.organization.name} />
            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-brand-mist p-4">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-brand-charcoal/55">{user?.email} - {user?.role}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-brand-mist p-4">
                <div>
                  <p className="font-medium">Supabase</p>
                  <p className="text-sm text-brand-charcoal/55">{hasEnv ? "Variables detectadas" : "Modo demo local activo"}</p>
                </div>
                <Badge tone={hasEnv ? "green" : "yellow"}>{hasEnv ? "conectado" : "demo"}</Badge>
              </div>
              <Button variant="secondary" onClick={resetDemo}><RotateCcw className="h-4 w-4" />Restaurar datos demo</Button>
            </div>
          </Panel>
          <Panel>
            <PanelHeader title="Estado operativo" description="Volumen de datos del ERP y CRM." />
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {totals.map(([label, value]) => <Stat key={label} label={String(label)} value={String(value)} detail="Registros demo" />)}
            </div>
            <div className="border-t border-brand-mist p-5 text-sm leading-6 text-brand-charcoal/60">
              El ERP ya separa pipeline comercial, clientes, proyectos, facturas, pagos, gastos, horas de consultoria, paquetes y capacidad del equipo. La siguiente capa natural es conectar estos registros a Supabase con permisos por rol.
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "equipo" ? (
        <Panel>
          <PanelHeader title="Equipo y capacidad" description="Carga de consultores, horas registradas y proyectos asignados." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55">
                <tr><th className="px-5 py-3">Consultor</th><th className="px-5 py-3">Rol</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Capacidad</th><th className="px-5 py-3">Horas</th><th className="px-5 py-3">Proyectos</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-mist">
                {data.consultants.map((consultant) => {
                  const hours = data.timeEntries.filter((entry) => entry.consultantId === consultant.id).reduce((sum, entry) => sum + entry.hours, 0);
                  return (
                    <tr key={consultant.id}>
                      <td className="px-5 py-4 font-medium">{consultant.name}</td>
                      <td className="px-5 py-4">{consultant.role}</td>
                      <td className="px-5 py-4"><Badge tone={consultant.status === "disponible" ? "green" : consultant.status === "ocupado" ? "yellow" : "red"}>{consultant.status}</Badge></td>
                      <td className="px-5 py-4">{consultant.capacity}%</td>
                      <td className="px-5 py-4">{hours}h</td>
                      <td className="px-5 py-4">{consultant.projectIds.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {tab === "paquetes" ? (
        <Panel>
          <PanelHeader title="Catalogo comercial" description="Paquetes, precios base y reglas de cobro para cotizaciones." />
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {data.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border border-brand-mist bg-white p-4">
                <p className="font-semibold text-brand-charcoal">{pkg.name}</p>
                <p className="mt-1 text-sm text-brand-charcoal/55">{pkg.duration}</p>
                <p className="mt-3 text-2xl font-semibold text-brand-navy">{pkg.price ? money(pkg.price) : "A cotizar"}</p>
                <p className="mt-2 text-sm text-brand-charcoal/60">{pkg.pricingNotes}</p>
                <p className="mt-3 text-sm leading-6 text-brand-charcoal/65">{pkg.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {tab === "finanzas" ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <Panel>
              <PanelHeader title="Resumen financiero" description="Facturacion, cobranza, gastos y productividad." />
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <Stat label="Facturado" value={money(invoicedRevenue)} detail={`${data.invoices.length} facturas`} tone="blue" />
                <Stat label="Cobrado" value={money(collectedRevenue)} detail={`${data.payments.length} pagos`} tone="green" />
                <Stat label="Por cobrar" value={money(accountsReceivable)} detail="Cartera pendiente" tone="yellow" />
                <Stat label="Gastos" value={money(expenses)} detail={`${data.expenses.length} egresos`} tone="red" />
                <Stat label="Margen caja" value={money(collectedRevenue - expenses)} detail="Cobrado - gastos" tone={collectedRevenue >= expenses ? "green" : "red"} />
                <Stat label="Horas facturables" value={`${billableHours}h`} detail="Consultoria registrada" tone="blue" />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Registrar factura" description="Crea una factura interna vinculada a cliente y proyecto." />
              <form
                className="grid gap-4 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const subtotal = Number(form.get("subtotal") || 0);
                  const tax = Math.round(subtotal * 0.16);
                  addInvoice({
                    clientId: String(form.get("clientId")),
                    projectId: String(form.get("projectId") || "") || undefined,
                    folio: String(form.get("folio")),
                    concept: String(form.get("concept")),
                    issuedAt: String(form.get("issuedAt")),
                    dueAt: String(form.get("dueAt")),
                    subtotal,
                    tax,
                    total: subtotal + tax,
                    status: "emitida",
                  });
                  event.currentTarget.reset();
                }}
              >
                <Field label="Cliente"><Select name="clientId" required>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></Field>
                <Field label="Proyecto"><Select name="projectId"><option value="">Sin proyecto</option>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field>
                <Field label="Folio"><TextInput name="folio" defaultValue={`LC-2026-${String(data.invoices.length + 1).padStart(3, "0")}`} required /></Field>
                <Field label="Concepto"><TextInput name="concept" required /></Field>
                <Field label="Subtotal"><TextInput name="subtotal" type="number" min="0" required /></Field>
                <div className="grid gap-4 md:grid-cols-2"><Field label="Emision"><TextInput name="issuedAt" type="date" required /></Field><Field label="Vencimiento"><TextInput name="dueAt" type="date" required /></Field></div>
                <Button>Guardar factura</Button>
              </form>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel>
              <PanelHeader title="Registrar gasto" description="Control de egresos internos, billables o no billables." />
              <form
                className="grid gap-4 p-5 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  addExpense({
                    clientId: String(form.get("clientId") || "") || undefined,
                    projectId: String(form.get("projectId") || "") || undefined,
                    date: String(form.get("date")),
                    category: String(form.get("category")) as "nomina" | "software" | "viaticos" | "proveedor" | "marketing" | "otro",
                    description: String(form.get("description")),
                    vendor: String(form.get("vendor")),
                    amount: Number(form.get("amount") || 0),
                    billable: form.get("billable") === "on",
                  });
                  event.currentTarget.reset();
                }}
              >
                <Field label="Fecha"><TextInput name="date" type="date" required /></Field>
                <Field label="Categoria"><Select name="category"><option value="software">Software</option><option value="viaticos">Viaticos</option><option value="proveedor">Proveedor</option><option value="marketing">Marketing</option><option value="nomina">Nomina</option><option value="otro">Otro</option></Select></Field>
                <Field label="Cliente"><Select name="clientId"><option value="">Interno LC</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></Field>
                <Field label="Proyecto"><Select name="projectId"><option value="">Sin proyecto</option>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field>
                <Field label="Proveedor"><TextInput name="vendor" required /></Field>
                <Field label="Monto"><TextInput name="amount" type="number" min="0" required /></Field>
                <div className="md:col-span-2"><Field label="Descripcion"><TextInput name="description" required /></Field></div>
                <label className="flex items-center gap-2 text-sm text-brand-charcoal/75"><input name="billable" type="checkbox" /> Reembolsable / facturable al cliente</label>
                <div className="md:col-span-2"><Button>Guardar gasto</Button></div>
              </form>
            </Panel>

            <Panel>
              <PanelHeader title="Facturas y cartera" description="Estado de facturacion del negocio." />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-brand-mist bg-brand-paper text-xs uppercase text-brand-charcoal/55"><tr><th className="px-5 py-3">Folio</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Vence</th><th className="px-5 py-3">Estado</th></tr></thead>
                  <tbody className="divide-y divide-brand-mist">
                    {data.invoices.map((invoice) => {
                      const client = data.clients.find((item) => item.id === invoice.clientId);
                      return <tr key={invoice.id}><td className="px-5 py-4 font-medium">{invoice.folio}</td><td className="px-5 py-4">{client?.name}</td><td className="px-5 py-4">{money(invoice.total)}</td><td className="px-5 py-4">{shortDate(invoice.dueAt)}</td><td className="px-5 py-4"><Badge tone={invoice.status === "pagada" ? "green" : invoice.status === "vencida" ? "red" : "yellow"}>{invoice.status}</Badge></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function HomeRedirectScreen() {
  const router = useRouter();
  const { user, isReady } = useStore();
  if (isReady) router.replace(user ? "/app" : "/login");
  return <div className="min-h-screen bg-slate-50" />;
}
