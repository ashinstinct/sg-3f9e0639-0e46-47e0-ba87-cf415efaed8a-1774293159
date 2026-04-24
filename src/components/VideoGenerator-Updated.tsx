import { useState, useRef } from "react";
import { Loader2, X, Menu, ChevronUp, ChevronDown } from "lucide-react";
...
              {showModelDropdown && (
                <div className="absolute bottom-full mb-2 left-0 right-0 max-h-56 overflow-y-auto z-50 rounded-t-2xl bg-[#1a1a2e]/95 border border-[#667eea]/30 backdrop-blur-xl">
                  {filteredModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                        setSelectedReference(model.refs[0]);
                        setShowModelMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/80 hover:text-white hover:bg-[#667eea]/20 border-b border-white/5 last:border-b-0 transition-all"
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
]]>

[Tool result trimmed: kept first 100 chars and last 100 chars of 21533 chars.]