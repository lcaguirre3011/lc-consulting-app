"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoData, generateDiagnosis } from "./demo-data";
import type {
  AppData,
  AppUser,
  Client,
  Consultant,
  Diagnosis,
  Expense,
  IntakeForm,
  Invoice,
  Lead,
  LeadStage,
  Project,
  Recipe,
  Report,
  Task,
  TaskStatus,
} from "./types";
import { uid } from "./utils";

const DATA_KEY = "lc-consulting-data-v2";
const USER_KEY = "lc-consulting-user-v1";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeLeadStage(stage: string): LeadStage {
  if (stage === "contacto inicial") return "formulario 1 enviado";
  if (stage === "diagnostico agendado") return "sesion inicial agendada";
  return stage as LeadStage;
}

function normalizeData(data: AppData): AppData {
  return {
    ...demoData,
    ...data,
    leads: (data.leads ?? demoData.leads).map((lead) => ({
      ...lead,
      stage: normalizeLeadStage(lead.stage),
    })),
    clients: (data.clients ?? demoData.clients).map((client) => ({
      ...client,
      expedienteIds: client.expedienteIds ?? [],
    })),
    projects: (data.projects ?? demoData.projects).map((project) => ({
      ...project,
      leadPhase: project.leadPhase ?? "listen",
      initialHypothesis: project.initialHypothesis ?? "",
      realFindings: project.realFindings ?? "",
      rootCause: project.rootCause ?? "",
    })),
    reports: data.reports ?? demoData.reports,
    clientHistory: data.clientHistory ?? demoData.clientHistory,
    consultants: data.consultants ?? demoData.consultants,
    packages: (data.packages ?? demoData.packages).map((item) => {
      const demoPackage = demoData.packages.find((candidate) => candidate.id === item.id);
      return {
        ...item,
        price: item.price ?? demoPackage?.price ?? 0,
        pricingNotes: item.pricingNotes ?? demoPackage?.pricingNotes,
      };
    }),
    invoices: data.invoices ?? demoData.invoices,
    payments: data.payments ?? demoData.payments,
    expenses: data.expenses ?? demoData.expenses,
    timeEntries: data.timeEntries ?? demoData.timeEntries,
  };
}

interface StoreContextValue {
  data: AppData;
  user: AppUser | null;
  isReady: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  resetDemo: () => void;
  moveLead: (leadId: string, stage: LeadStage) => void;
  addLead: (lead: Omit<Lead, "id" | "lastInteraction">) => string;
  updateLead: (leadId: string, patch: Partial<Lead>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  updateDiagnosis: (diagnosisId: string, patch: Partial<Diagnosis>) => void;
  addProject: (project: Omit<Project, "id" | "progress" | "risks" | "kpiIds">) => string;
  upsertRecipe: (recipe: Recipe) => void;
  addConsultant: (consultant: Omit<Consultant, "id" | "projectIds">) => void;
  addInvoice: (invoice: Omit<Invoice, "id">) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addDiagnosisFromIntake: (intake: Omit<IntakeForm, "id" | "createdAt">) => string;
  createTasksFromMeeting: (meetingId: string) => number;
  generateReport: (period: string, type: Report["type"]) => string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(demoData);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(DATA_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    queueMicrotask(() => {
      if (stored) setData(normalizeData(JSON.parse(stored) as AppData));
      if (storedUser) setUser(JSON.parse(storedUser) as AppUser);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data, isReady]);

  const login = useCallback((email: string) => {
    const nextUser =
      demoData.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase()) ??
      demoData.users[0];
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(USER_KEY);
  }, []);

  const resetDemo = useCallback(() => {
    setData(demoData);
    window.localStorage.setItem(DATA_KEY, JSON.stringify(demoData));
  }, []);

  const convertLeadToClient = useCallback((leadId: string) => {
    setData((current) => {
      const lead = current.leads.find((item) => item.id === leadId);
      if (!lead) return current;
      if (lead.convertedClientId && current.clients.some((client) => client.id === lead.convertedClientId)) {
        return current;
      }

      const clientId = uid("client");
      const diagnosisId = uid("diag");
      const intakeId = uid("intake");
      const newClient: Client = {
        id: clientId,
        name: lead.company,
        industry: lead.intake?.howFoundUs === "Evento" ? "Servicios" : "Por clasificar",
        size: `${lead.intake?.yearsOperating ?? 0} años operando`,
        health: lead.intake?.internalFlag === "rojo" ? "rojo" : lead.intake?.internalFlag === "amarillo" ? "amarillo" : "verde",
        accountOwner: "Laura Cárdenas",
        mainPain: lead.intake?.mainProblem ?? lead.nextStep,
        services: lead.recommendedPackage ? [lead.recommendedPackage] : ["Diagnóstico inicial"],
        revenueEstimate: lead.estimatedValue,
        since: today(),
        expedienteIds: [diagnosisId],
      };

      return {
        ...current,
        leads: current.leads.map((item) =>
          item.id === leadId
            ? { ...item, stage: "cliente ganado", convertedClientId: clientId, lastInteraction: today() }
            : item,
        ),
        clients: [newClient, ...current.clients],
        contacts: [
          {
            id: uid("ct"),
            clientId,
            name: lead.contactName,
            role: "Contacto principal",
            email: lead.email,
            phone: lead.phone,
          },
          ...current.contacts,
        ],
        intakeForms: [
          {
            id: intakeId,
            clientId,
            company: lead.company,
            industry: newClient.industry,
            size: newClient.size,
            currentProblems: lead.intake?.mainProblem ?? "",
            objectives: lead.intake?.expectedResult ?? "",
            criticalProcesses: "Por descubrir en sesión LC",
            tools: "Pendiente",
            sales: "Pendiente",
            operations: "Pendiente",
            finance: "Pendiente",
            marketing: "Pendiente",
            customerService: "Pendiente",
            urgency: lead.intake?.internalFlag === "verde" ? "media" : "alta",
            budget: lead.intake?.budgetAvailable ?? "Pendiente",
            priorities: lead.nextStep,
            createdAt: today(),
            formType: "filtro inicial",
          },
          ...current.intakeForms,
        ],
        diagnoses: [
          {
            id: diagnosisId,
            clientId,
            intakeId,
            company: lead.company,
            summary: `Primer expediente clínico-empresarial creado desde el filtro inicial. El paciente presenta: ${lead.intake?.mainProblem ?? lead.nextStep}`,
            detectedProblems: [lead.intake?.mainProblem ?? "Problema principal pendiente de descubrir"],
            opportunities: [lead.intake?.expectedResult ?? "Definir resultado esperado en sesión"],
            suggestedKpis: ["Fit consultivo", "Avance de descubrimiento", "Probabilidad de propuesta"],
            possibleProjects: [lead.recommendedPackage ?? "Diagnóstico + Plan de Acción"],
            interventionPriority: lead.intake?.internalFlag === "verde" ? "media" : "alta",
            createdAt: today(),
            approach: "operativo",
            recommendedPackage: lead.recommendedPackage,
          },
          ...current.diagnoses,
        ],
        clientHistory: [
          {
            id: uid("hist"),
            clientId,
            date: today(),
            actor: "Sistema",
            title: "Lead convertido a cliente",
            detail: `${lead.company} entró al expediente de clientes desde CRM al ganar la oportunidad.`,
          },
          ...current.clientHistory,
        ],
      };
    });
  }, []);

  const moveLead = useCallback((leadId: string, stage: LeadStage) => {
    setData((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, stage, lastInteraction: today() }
          : lead,
      ),
    }));
    if (stage === "cliente ganado") {
      queueMicrotask(() => convertLeadToClient(leadId));
    }
  }, [convertLeadToClient]);

  const addLead = useCallback((lead: Omit<Lead, "id" | "lastInteraction">) => {
    const leadId = uid("lead");
    setData((current) => ({
      ...current,
      leads: [
        {
          ...lead,
          id: leadId,
          lastInteraction: today(),
        },
        ...current.leads,
      ],
    }));
    return leadId;
  }, []);

  const updateLead = useCallback((leadId: string, patch: Partial<Lead>) => {
    setData((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === leadId ? { ...lead, ...patch, lastInteraction: today() } : lead,
      ),
    }));
    if (patch.stage === "cliente ganado") {
      queueMicrotask(() => convertLeadToClient(leadId));
    }
  }, [convertLeadToClient]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }));
  }, []);

  const updateProject = useCallback((projectId: string, patch: Partial<Project>) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, ...patch } : project,
      ),
    }));
  }, []);

  const updateDiagnosis = useCallback((diagnosisId: string, patch: Partial<Diagnosis>) => {
    setData((current) => {
      const currentDiagnosis = current.diagnoses.find((diagnosis) => diagnosis.id === diagnosisId);
      const nextDiagnoses = current.diagnoses.map((diagnosis) =>
        diagnosis.id === diagnosisId ? { ...diagnosis, ...patch } : diagnosis,
      );

      return {
        ...current,
        diagnoses: nextDiagnoses,
        clientHistory: currentDiagnosis?.clientId
          ? [
              {
                id: uid("hist"),
                clientId: currentDiagnosis.clientId,
                date: today(),
                actor: user?.name ?? "Sistema",
                title: "Expediente actualizado",
                detail: `Se actualizo el expediente ${currentDiagnosis.company}.`,
              },
              ...current.clientHistory,
            ]
          : current.clientHistory,
      };
    });
  }, [user?.name]);

  const addProject = useCallback((project: Omit<Project, "id" | "progress" | "risks" | "kpiIds">) => {
    const projectId = uid("proj");
    setData((current) => ({
      ...current,
      projects: [
        {
          ...project,
          id: projectId,
          progress: 0,
          risks: [],
          kpiIds: [],
        },
        ...current.projects,
      ],
      clientHistory: [
        {
          id: uid("hist"),
          clientId: project.clientId,
          date: today(),
          actor: user?.name ?? "Sistema",
          title: "Proyecto nuevo",
          detail: `Se creó el proyecto ${project.name}.`,
        },
        ...current.clientHistory,
      ],
    }));
    return projectId;
  }, [user?.name]);

  const upsertRecipe = useCallback((recipe: Recipe) => {
    setData((current) => {
      const exists = current.recipes.some((item) => item.id === recipe.id);
      return {
        ...current,
        recipes: exists
          ? current.recipes.map((item) => (item.id === recipe.id ? recipe : item))
          : [{ ...recipe, id: recipe.id || uid("recipe") }, ...current.recipes],
      };
    });
  }, []);

  const addConsultant = useCallback((consultant: Omit<Consultant, "id" | "projectIds">) => {
    setData((current) => ({
      ...current,
      consultants: [{ ...consultant, id: uid("consultant"), projectIds: [] }, ...current.consultants],
    }));
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, "id">) => {
    setData((current) => ({
      ...current,
      invoices: [{ ...invoice, id: uid("inv") }, ...current.invoices],
    }));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    setData((current) => ({
      ...current,
      expenses: [{ ...expense, id: uid("exp") }, ...current.expenses],
    }));
  }, []);

  const addDiagnosisFromIntake = useCallback((intake: Omit<IntakeForm, "id" | "createdAt">) => {
    const fullIntake: IntakeForm = {
      ...intake,
      id: uid("intake"),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const diagnosis = generateDiagnosis(fullIntake);
    setData((current) => ({
      ...current,
      intakeForms: [fullIntake, ...current.intakeForms],
      diagnoses: [diagnosis, ...current.diagnoses],
    }));
    return diagnosis.id;
  }, []);

  const createTasksFromMeeting = useCallback((meetingId: string) => {
    let created = 0;
    setData((current) => {
      const meeting = current.meetings.find((item) => item.id === meetingId);
      if (!meeting) return current;
      const nextTasks: Task[] = meeting.agreements.map((agreement, index) => ({
        id: uid("task"),
        title: agreement,
        description: `Acuerdo generado desde la reunion: ${meeting.title}`,
        clientId: meeting.clientId,
        projectId: meeting.projectId,
        owner: meeting.owners[index] ?? meeting.owners[0] ?? "LC Consulting",
        dueDate: meeting.nextMeeting,
        priority: "media",
        status: "pendiente",
        checklist: [{ label: "Confirmar responsable y evidencia", done: false }],
        comments: [],
        relation: "acuerdo de reunion",
      }));
      created = nextTasks.length;
      return { ...current, tasks: [...nextTasks, ...current.tasks] };
    });
    return created;
  }, []);

  const generateReport = useCallback((period: string, type: Report["type"]) => {
    const id = uid("rep");
    setData((current) => {
      const overdue = current.tasks.filter((task) => task.status !== "terminada" && task.dueDate < today());
      const activeProjects = current.projects.filter((project) => project.status === "en progreso");
      const criticalKpis = current.kpis.filter((kpi) => kpi.status !== "bien");
      const summary = [
        `${current.clients.length} clientes activos.`,
        `${activeProjects.length} proyectos en progreso.`,
        `${overdue.length} tareas atrasadas.`,
        `${criticalKpis.length} KPIs en alerta o crítico.`,
      ].join(" ");

      return {
        ...current,
        reports: [
          {
            id,
            type,
            title: `Reporte ${type} - ${period}`,
            period,
            status: "listo",
            summary,
            generatedAt: today(),
          },
          ...current.reports,
        ],
      };
    });
    return id;
  }, []);

  const value = useMemo(
    () => ({
      data,
      user,
      isReady,
      login,
      logout,
      resetDemo,
      moveLead,
      addLead,
      updateLead,
      updateTaskStatus,
      updateProject,
      updateDiagnosis,
      addProject,
      upsertRecipe,
      addConsultant,
      addInvoice,
      addExpense,
      addDiagnosisFromIntake,
      createTasksFromMeeting,
      generateReport,
    }),
    [
      data,
      user,
      isReady,
      login,
      logout,
      resetDemo,
      moveLead,
      addLead,
      updateLead,
      updateTaskStatus,
      updateProject,
      updateDiagnosis,
      addProject,
      upsertRecipe,
      addConsultant,
      addInvoice,
      addExpense,
      addDiagnosisFromIntake,
      createTasksFromMeeting,
      generateReport,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
