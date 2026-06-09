import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import PathFinderQuizDialog from "./PathFinderQuizDialog";

interface Ctx {
  open: () => void;
}

const QuizContext = createContext<Ctx | null>(null);

export function PathFinderQuizProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  return (
    <QuizContext.Provider value={{ open }}>
      {children}
      <PathFinderQuizDialog open={isOpen} onOpenChange={setOpen} />
    </QuizContext.Provider>
  );
}

export function usePathFinderQuiz(): Ctx {
  const ctx = useContext(QuizContext);
  if (!ctx) return { open: () => console.warn("PathFinderQuizProvider not mounted") };
  return ctx;
}
