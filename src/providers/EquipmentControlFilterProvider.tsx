import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';

export interface EquipmentControlFilterContext {
  carrier: Carrier;
}

export const TASK_FILTERS_INITIAL_STATE = {} as EquipmentControlFilterContext;

const EquipmentControlFilterProviderContext = createContext<
  [EquipmentControlFilterContext, Dispatch<SetStateAction<EquipmentControlFilterContext>>]
>([TASK_FILTERS_INITIAL_STATE, () => {}]);

const EquipmentControlFilter = (props: any) => {
  const [state, setState] = useState<EquipmentControlFilterContext>({
    ...TASK_FILTERS_INITIAL_STATE,
  });

  return (
    <EquipmentControlFilterProviderContext.Provider value={[state, setState]}>
      {props.children}
    </EquipmentControlFilterProviderContext.Provider>
  );
};

export const useWeeklyPaymentFilterProviderContext = () => {
  const context = React.useContext(EquipmentControlFilterProviderContext);
  if (context === undefined) {
    throw new Error('EquipmentControlFilterProviderContext must be used within a EquipmentControlFilter');
  }
  return context;
};

export default EquipmentControlFilter;
