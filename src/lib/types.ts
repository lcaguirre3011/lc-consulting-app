export type Role = "admin" | "consultant" | "viewer";
export type Health = "verde" | "amarillo" | "rojo";
export type Priority = "baja" | "media" | "alta" | "critica";
export type LeadStage =
  | "nuevo lead"
  | "contacto inicial"
  | "diagnostico agendado"
  | "propuesta enviada"
  | "negociacion"
  | "cliente ganado"
  | "perdido";
export type ProjectStatus =
  | "planeado"
  | "en progreso"
  | "pausado"
  | "en revision"
  | "completado"
  | "cancelado";
export type TaskStatus =
  | "pendiente"
  | "en proceso"
  | "bloqueada"
  | "en revision"
  | "terminada";
export type KpiStatus = "bien" | "alerta" | "critico";
export type PackageType =
  | "Diagnóstico Express + Recomendaciones"
  | "Diagnóstico + Plan de Acción"
  | "Diagnóstico + Implementación"
  | "Proyecto Integral"
  | "Sprint de Mejora"
  | "Acompañamiento Mensual"
  | "Mentoría Estratégica + Coaching Ejecutivo"
  | "Licencia Anual de Acompañamiento"
  | "Proyecto Personalizado";

export interface LeadIntake {
  yearsOperating: number;
  howFoundUs: string;
  mainProblem: string;
  expectedResult: string;
  previousConsulting: "sí" | "no";
  previousExperienceNotes?: string;
  budgetAvailable: "definido" | "evaluando" | "sin presupuesto";
  willingToParticipate: "sí" | "prefiere delegar";
  internalFlag: "verde" | "amarillo" | "rojo";
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  stage: LeadStage;
  estimatedValue: number;
  closeProbability: number;
  nextStep: string;
  source: string;
  lastInteraction: string;
  intake?: LeadIntake;
  recommendedPackage?: PackageType;
  convertedClientId?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  health: Health;
  accountOwner: string;
  mainPain: string;
  services: string[];
  revenueEstimate: number;
  since: string;
  expedienteIds?: string[];
}

export interface ClientHistory {
  id: string;
  clientId: string;
  date: string;
  actor: string;
  title: string;
  detail: string;
}

export interface Consultant {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialties: string[];
  status: "disponible" | "ocupado" | "pausado";
  capacity: number;
  projectIds: string[];
}

export interface ConsultingPackage {
  id: string;
  name: PackageType;
  description: string;
  duration: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Interaction {
  id: string;
  clientId?: string;
  leadId?: string;
  type: "nota" | "llamada" | "reunion" | "archivo";
  title: string;
  detail: string;
  date: string;
}

export interface IntakeForm {
  id: string;
  clientId?: string;
  company: string;
  industry: string;
  size: string;
  currentProblems: string;
  objectives: string;
  criticalProcesses: string;
  tools: string;
  sales: string;
  operations: string;
  finance: string;
  marketing: string;
  customerService: string;
  urgency: "baja" | "media" | "alta";
  budget: string;
  priorities: string;
  createdAt: string;
  formType?: "filtro inicial" | "descubrimiento";
}

export interface Diagnosis {
  id: string;
  clientId?: string;
  intakeId: string;
  company: string;
  summary: string;
  detectedProblems: string[];
  opportunities: string[];
  suggestedKpis: string[];
  possibleProjects: string[];
  interventionPriority: Priority;
  createdAt: string;
  approach?: "comercial" | "operativo" | "financiero" | "digital" | "liderazgo";
  recommendedPackage?: PackageType;
}

export interface Recipe {
  id: string;
  name: string;
  problem: string;
  symptoms: string[];
  steps: string[];
  kpis: string[];
  deliverables: string[];
  durationWeeks: number;
  difficulty: "baja" | "media" | "alta";
  suggestedTasks: string[];
  templates: string[];
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  progress: number;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  objective: string;
  scope: string;
  owner: string;
  startsAt: string;
  endsAt: string;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  progress: number;
  risks: string[];
  kpiIds: string[];
  packageType?: PackageType;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientId: string;
  projectId?: string;
  owner: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  checklist: { label: string; done: boolean }[];
  comments: string[];
  relation?: string;
}

export interface KpiMeasurement {
  id: string;
  kpiId: string;
  date: string;
  value: number;
}

export interface Kpi {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  description: string;
  formula: string;
  currentValue: number;
  target: number;
  unit: string;
  frequency: string;
  owner: string;
  source: string;
  status: KpiStatus;
}

export interface Meeting {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  date: string;
  minutes: string;
  agreements: string[];
  owners: string[];
  nextMeeting: string;
  decisions: string[];
  risks: string[];
}

export interface Deliverable {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  description: string;
  dueDate: string;
  status: "pendiente" | "en revision" | "aprobado" | "rechazado";
  owner: string;
  link: string;
  comments: string;
  approvedByClient: boolean;
}

export interface Report {
  id: string;
  type:
    | "ejecutivo cliente"
    | "avance proyecto"
    | "kpis"
    | "tareas atrasadas"
    | "crm comercial"
    | "mensual consultoria";
  title: string;
  period: string;
  status: "listo" | "borrador";
  summary: string;
  generatedAt?: string;
}

export interface AppData {
  organization: Organization;
  users: AppUser[];
  leads: Lead[];
  clients: Client[];
  contacts: Contact[];
  interactions: Interaction[];
  intakeForms: IntakeForm[];
  diagnoses: Diagnosis[];
  recipes: Recipe[];
  projects: Project[];
  phases: ProjectPhase[];
  tasks: Task[];
  kpis: Kpi[];
  kpiMeasurements: KpiMeasurement[];
  meetings: Meeting[];
  deliverables: Deliverable[];
  reports: Report[];
  clientHistory: ClientHistory[];
  consultants: Consultant[];
  packages: ConsultingPackage[];
}
