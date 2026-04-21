import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  logo?: string;
  tier: "free" | "pro";
}

interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onSelect: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ models, selected, onSelect, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = models.find((m) => m.id === selected) || models[0];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
      >
        {selectedModel.logo && (
          <img src={selectedModel.logo} alt="" className="w-5 h-5 rounded-full" />
        )}
        <span className="text-sm font-medium text-white">{selectedModel.name}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="max-h-[400px] overflow-y-auto py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-700/50 transition-colors text-left",
                  selected === model.id && "bg-slate-700/30"
                )}
              >
                {model.logo ? (
                  <img src={model.logo} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {model.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{model.name}</p>
                    {model.tier === "pro" && (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{model.description}</p>
                </div>
                {selected === model.id && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}