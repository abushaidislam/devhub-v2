import type { HTMLAttributes, ReactNode } from "react";
import styles from "./badge.module.css";

type BadgeVariant = "gray" | "blue" | "green" | "teal" | "purple" | "amber" | "red" | "pink";
type BadgeContrast = "default" | "low" | "inverted";
type BadgeSize = "sm" | "md" | "lg";
type DotStatus = "neutral" | "info" | "success" | "warning" | "error";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  contrast?: BadgeContrast;
  size?: BadgeSize;
  icon?: ReactNode;
};

export function Badge({
  children,
  className,
  variant = "gray",
  contrast = "default",
  size = "md",
  icon,
  ...props
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[variant],
    styles[contrast],
    styles[size],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span {...props} className={classes}>
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}

export type StatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  status?: DotStatus;
  label?: string;
};

export function StatusDot({
  status = "neutral",
  label,
  className,
  title,
  ...props
}: StatusDotProps) {
  const classes = [styles.dot, styles[`dot-${status}`], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      {...props}
      className={classes}
      role={label ? "img" : undefined}
      aria-label={label}
      title={title ?? label}
    />
  );
}
