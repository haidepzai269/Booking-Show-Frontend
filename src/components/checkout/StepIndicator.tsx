"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { id: 1, label: "Bắp & Nước", icon: "🍿" },
  { id: 2, label: "Mã Giảm Giá", icon: "🏷️" },
  { id: 3, label: "Thanh Toán", icon: "💳" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full bg-black/30 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, idx) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isTodo = step.id > currentStep;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Node */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500
                      ${isDone ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]" : ""}
                      ${isActive ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-110" : ""}
                      ${isTodo ? "bg-zinc-800 text-zinc-500 border border-zinc-700" : ""}
                    `}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                    ) : (
                      <span className="text-xs sm:text-sm">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300
                      ${isDone ? "text-green-500" : ""}
                      ${isActive ? "text-orange-400" : ""}
                      ${isTodo ? "text-zinc-600" : ""}
                    `}
                  >
                    <span className="hidden sm:inline">{step.icon} </span>
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex items-center mx-2 sm:mx-4 pb-6">
                    <div
                      className={`h-[2px] w-8 sm:w-16 rounded-full transition-all duration-500
                        ${step.id < currentStep ? "bg-green-500" : "bg-zinc-700"}
                      `}
                    />
                    <div
                      className={`h-0 w-0 border-y-4 border-y-transparent transition-all duration-500 border-l-[6px]
                        ${step.id < currentStep ? "border-l-green-500" : "border-l-zinc-700"}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
