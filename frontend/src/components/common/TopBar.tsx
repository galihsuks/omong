import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function TopBar({ title, subtitle, right }: Props) {
  return (
    <header className="px-6 pt-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-base font-semibold text-white">{title}</h1>
          {subtitle && (
            <p
              className={`text-xs ${subtitle === "Online" ? "font-semibold text-cyan-300" : "text-slate-300"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div>{right}</div>
      </div>
    </header>
  );
}
