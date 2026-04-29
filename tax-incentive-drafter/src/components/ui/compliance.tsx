import * as React from "react";
import { cn } from "@/lib/utils";

type PanelProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "aside" | "div";
  compact?: boolean;
};

export function Panel({
  as: Comp = "section",
  compact = false,
  className,
  ...props
}: PanelProps) {
  const Component = Comp as React.ElementType;

  return (
    <Component
      className={cn(
        "rounded-lg border border-[#d7decb] bg-white shadow-[0_1px_2px_rgba(16,23,18,0.08)]",
        compact ? "p-4" : "p-5",
        className,
      )}
      {...props}
    />
  );
}

const badgeStyles = {
  neutral: "border-[#d7decb] bg-[#f6f8f2] text-[#58645a]",
  success: "border-[#abd9b7] bg-[#effaf1] text-[#235c33]",
  warning: "border-[#ead49b] bg-[#fff8df] text-[#745318]",
  info: "border-[#b8d7f0] bg-[#edf7ff] text-[#1b5d88]",
  danger: "border-[#f1b5a7] bg-[#fff1ee] text-[#9d2f1e]",
} as const;

type StatusBadgeProps = React.ComponentProps<"span"> & {
  tone?: keyof typeof badgeStyles;
};

export function StatusBadge({
  tone = "neutral",
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold leading-none",
        badgeStyles[tone],
        className,
      )}
      {...props}
    />
  );
}

type MetricBlockProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  className?: string;
};

export function MetricBlock({
  label,
  value,
  detail,
  icon: Icon,
  className,
}: MetricBlockProps) {
  return (
    <Panel as="article" compact className={cn("min-h-[116px]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#66705f]">{label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-[#18201b]">
            {value}
          </p>
          {detail ? <p className="mt-1 text-sm text-[#66705f]">{detail}</p> : null}
        </div>
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#eef3e8] text-[#1f5d3a]">
            <Icon size={16} aria-hidden={true} />
          </span>
        ) : null}
      </div>
    </Panel>
  );
}

const actionStyles = {
  primary: "border-[#1f5d3a] bg-[#1f5d3a] text-white hover:bg-[#17472c]",
  secondary:
    "border-[#cbd3c3] bg-white text-[#263029] hover:bg-[#eef2e8]",
  muted:
    "border-[#d7decb] bg-[#f6f8f2] text-[#66705f] hover:bg-[#eef2e8]",
} as const;

type ActionButtonProps = React.ComponentProps<"button"> & {
  variant?: keyof typeof actionStyles;
};

export function ActionButton({
  variant = "primary",
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        actionStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function actionLinkClass(
  variant: keyof typeof actionStyles = "primary",
  className?: string,
) {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition",
    actionStyles[variant],
    className,
  );
}

export function InlineMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#5b6f5e]",
        className,
      )}
      {...props}
    />
  );
}
