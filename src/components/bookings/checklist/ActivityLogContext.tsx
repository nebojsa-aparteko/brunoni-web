import { ChecklistItem, ChecklistItemValueDocument, DocumentValue } from './ChecklistItemModel';
import React, { createContext, useContext, useState } from 'react';

export type ActivityLogContextProps = {
  checklistReference?: ChecklistItem;
  documentReference?: ChecklistItemValueDocument | DocumentValue;
  rejected?: boolean;
  internal?: boolean;
  isAccountingActivity?: boolean;
};

const ActivityLogStateContext = createContext<
  | { state: ActivityLogContextProps | undefined; setState: (state: ActivityLogContextProps | undefined) => void }
  | undefined
>(undefined);

interface Props {
  children: React.ReactNode;
}

export const ActivityLogProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<ActivityLogContextProps>();

  return (
    <ActivityLogStateContext.Provider value={{ state: state, setState: setState }}>
      {children}
    </ActivityLogStateContext.Provider>
  );
};

export const useActivityLogState = () => {
  const context = useContext(ActivityLogStateContext);
  if (context === undefined) {
    throw new Error('useActivityLogState must be used within a ActivityLogProvider');
  }
  return context;
};
