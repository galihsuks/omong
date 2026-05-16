import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  label: string;
  value: string;
  meta?: string;
};

type SearchSelectProps = {
  label?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
  value?: string;
  options: SelectOption[];
  onChange: (nextValue: string) => void;
  searchValue: string;
  onSearchChange: (keyword: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
};

export function SearchSelect({
  label,
  placeholder = "Select option",
  leftIcon,
  value,
  options,
  onChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyText = "No options",
  loading,
  disabled,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateDropdownPosition() {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }

    function handleOutside(event: MouseEvent) {
      const targetNode = event.target as Node;
      const clickedInsideWrapper = wrapperRef.current?.contains(targetNode);
      const clickedInsideDropdown = dropdownRef.current?.contains(targetNode);
      if (clickedInsideWrapper || clickedInsideDropdown) return;
      setOpen(false);
    }

    if (open) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    window.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open]);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value],
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-xs text-slate-200">
          {label}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((state) => !state)}
        className="group flex w-full items-center gap-2 border-b border-white/90 bg-transparent px-1 py-2 text-left text-sm text-white focus:border-white disabled:opacity-60"
      >
        {leftIcon && <span className="text-slate-200">{leftIcon}</span>}
        <span className={`flex-1 truncate ${selectedLabel ? "text-white" : "text-slate-300"}`}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="z-[60] rounded-xl border border-white/15 bg-slate-900 p-2 shadow-xl"
            style={{
              position: "fixed",
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-white/15 px-2 py-1.5">
            <Search size={14} className="text-slate-300" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <p className="px-2 py-2 text-xs text-slate-300">Loading...</p>
            ) : options.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-300">{emptyText}</p>
            ) : (
              options.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-white hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate">{option.label}</p>
                      {option.meta && (
                        <p className="truncate text-[11px] text-slate-300">{option.meta}</p>
                      )}
                    </div>
                    {selected && <Check size={14} className="shrink-0 text-cyan-300" />}
                  </button>
                );
              })
            )}
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
