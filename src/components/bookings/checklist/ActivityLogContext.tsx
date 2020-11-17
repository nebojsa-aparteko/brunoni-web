import { ChecklistItem, ChecklistItemValueDocument, DocumentValue } from './ChecklistItemModel';
import React, { createContext, useContext, useState } from 'react';

type State = {
  checklistReference?: ChecklistItem;
  documentReference?: ChecklistItemValueDocument | DocumentValue;
  rejected?: boolean;
  internal?: boolean;
  isAccountingActivity?: boolean;
};

const ActivityLogStateContext = createContext<
  { state: State | undefined; setState: (state: State | undefined) => void } | undefined
>(undefined);

interface Props {
  children: React.ReactNode;
}

export const ActivityLogProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<State>();

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
