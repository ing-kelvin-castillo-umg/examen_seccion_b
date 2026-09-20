"use client";

import React from "react";
import { Clock } from "lucide-react";

interface InactivityWarningModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onContinue: () => void;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  secondsRemaining,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 text-center">
        <div className="w-12 h-12 rounded-2xl bg-warning-100 text-warning-600 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-2">¿Sigues ahí?</h3>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Tu sesión se cerrará en{" "}
          <span className="font-bold text-neutral-900">{secondsRemaining}</span>{" "}
          {secondsRemaining === 1 ? "segundo" : "segundos"} por inactividad.
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Continuar sesión
        </button>
      </div>
    </div>
  );
};
