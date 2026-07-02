import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    neutral: "border-brand-mist bg-brand-paper text-brand-charcoal",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-brand-gold/50 bg-brand-gold/15 text-brand-charcoal",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-brand-navy/20 bg-brand-navy/10 text-brand-navy",
    dark: "border-brand-charcoal bg-brand-charcoal text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize",
        tones[tone] ?? tone,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("rounded-lg border border-brand-mist bg-white shadow-sm", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-brand-mist px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-brand-charcoal">{title}</h2>
        {description ? <p className="mt-1 text-sm text-brand-charcoal/60">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const accents = {
    neutral: "border-brand-mist",
    green: "border-emerald-300",
    yellow: "border-brand-gold",
    red: "border-rose-300",
    blue: "border-brand-navy/40",
  };
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", accents[tone])}>
      <p className="text-xs font-medium uppercase tracking-wide text-brand-charcoal/55">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-brand-charcoal">{value}</p>
      <p className="mt-1 text-sm text-brand-charcoal/60">{detail}</p>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-brand-navy">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-gold" />
          Leading Connections OS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-brand-charcoal sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-charcoal/70">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand-navy text-white shadow-sm shadow-brand-navy/20",
        variant === "secondary" && "border border-brand-mist bg-white text-brand-charcoal",
        variant === "ghost" && "text-brand-charcoal/70 hover:bg-brand-mist/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-brand-mist bg-white px-3 text-sm text-brand-charcoal outline-none transition placeholder:text-brand-charcoal/35 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-md border border-brand-mist bg-white px-3 py-2 text-sm text-brand-charcoal outline-none transition placeholder:text-brand-charcoal/35 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-brand-mist bg-white px-3 text-sm text-brand-charcoal outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25",
        props.className,
      )}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-brand-charcoal/80">
      {label}
      {children}
    </label>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-brand-mist p-8 text-center">
      <h3 className="text-sm font-semibold text-brand-charcoal">{title}</h3>
      <p className="mt-1 text-sm text-brand-charcoal/60">{detail}</p>
    </div>
  );
}
