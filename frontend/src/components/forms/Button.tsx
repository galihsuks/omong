import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "model1" | "model2" | "model3";
type IconPosition = "left" | "right";

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  className?: string;
};

type ActionButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: never;
  };

type LinkButtonProps = BaseProps & {
  to: string;
  disabled?: boolean;
  onClick?: () => void;
};

type ButtonProps = ActionButtonProps | LinkButtonProps;

const variantClassMap: Record<ButtonVariant, string> = {
  model1: "bg-white/10 text-white font-semibold",
  model2: "border border-white text-white font-semibold",
  model3: "text-white font-semibold",
};

function getBaseClass(variant: ButtonVariant, disabled?: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition",
    "hover:opacity-90",
    "focus:outline-none focus:ring-2 focus:ring-white/40",
    variantClassMap[variant],
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");
}

function contentWithIcon(
  children: ReactNode,
  icon?: ReactNode,
  iconPosition: IconPosition = "left",
) {
  if (!icon) return <>{children}</>;
  return iconPosition === "left" ? (
    <>
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </>
  ) : (
    <>
      <span>{children}</span>
      <span className="shrink-0">{icon}</span>
    </>
  );
}

export function Button(props: ButtonProps) {
  const { children, variant = "model1", icon, iconPosition = "left", className } = props;

  const baseClass = `${getBaseClass(variant, "disabled" in props ? props.disabled : false)} ${className ?? ""}`;
  const content = contentWithIcon(children, icon, iconPosition);

  if ("to" in props && props.to) {
    if (props.disabled) {
      return (
        <span className={baseClass} aria-disabled="true">
          {content}
        </span>
      );
    }

    return (
      <Link to={props.to} onClick={props.onClick} className={baseClass}>
        {content}
      </Link>
    );
  }

  const { to: _to, ...buttonProps } = props;
  return (
    <button {...buttonProps} className={baseClass}>
      {content}
    </button>
  );
}
