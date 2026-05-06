import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  leftIcon?: ReactNode;
  type?: "text" | "email" | "password" | "number" | "search";
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { id, label, leftIcon, type = "text", className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const renderedType = useMemo(() => {
    if (type !== "password") return type;
    return showPassword ? "text" : "password";
  }, [showPassword, type]);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs text-slate-200">
          {label}
        </label>
      )}
      <div className="group flex items-center gap-2 border-b border-white/90 bg-transparent px-1 py-2 focus-within:border-white">
        {leftIcon && <span className="text-slate-200">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={renderedType}
          className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-300 ${className ?? ""}`}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-slate-200 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
});
