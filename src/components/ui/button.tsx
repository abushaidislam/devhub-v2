import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./button.module.css";

type ButtonVariant = "default" | "secondary" | "tertiary" | "error" | "warning";
type ButtonSize = "tiny" | "small" | "medium" | "large";
type ButtonShape = "rounded" | "square" | "circle";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "prefix"> & {
    children?: ReactNode;
  };

export function Button({
  children,
  className,
  variant = "default",
  size = "medium",
  shape,
  loading = false,
  prefix,
  suffix,
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    shape ? styles[shape] : "",
    loading ? styles.loading : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {prefix ? <span className={styles.icon} aria-hidden="true">{prefix}</span> : null}
      <span className={styles.content}>{loading ? "Loading…" : children}</span>
      {suffix ? <span className={styles.icon} aria-hidden="true">{suffix}</span> : null}
    </button>
  );
}

export type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href" | "prefix"> & {
    href: string;
    children?: ReactNode;
  };

export function ButtonLink({
  children,
  className,
  href,
  variant = "default",
  size = "medium",
  shape,
  prefix,
  suffix,
  ...props
}: ButtonLinkProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    shape ? styles[shape] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link {...props} href={href} className={classes}>
      {prefix ? <span className={styles.icon} aria-hidden="true">{prefix}</span> : null}
      <span className={styles.content}>{children}</span>
      {suffix ? <span className={styles.icon} aria-hidden="true">{suffix}</span> : null}
    </Link>
  );
}
