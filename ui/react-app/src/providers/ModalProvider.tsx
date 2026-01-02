import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ModalContextType {
  isNewDebateModalOpen: boolean;
  openNewDebateModal: () => void;
  closeNewDebateModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isNewDebateModalOpen, setIsNewDebateModalOpen] = useState(false);

  const openNewDebateModal = () => setIsNewDebateModalOpen(true);
  const closeNewDebateModal = () => setIsNewDebateModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isNewDebateModalOpen,
        openNewDebateModal,
        closeNewDebateModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
