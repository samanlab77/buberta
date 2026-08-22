"use client";

import { createContext, useContext } from "react";
import { type SesiUser } from "@/lib/api";

const SesiContext = createContext<SesiUser | null>(null);

export const SesiProvider = SesiContext.Provider;

export function useSesi(): SesiUser | null {
  return useContext(SesiContext);
}
