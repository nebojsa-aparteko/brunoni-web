import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import Carrier from '../model/Carrier';
import Carriers from '../contexts/Carriers';
import { getISOWeek, getYear } from 'date-fns';
import { containerTypesValues } from '../model/EquipmentControl';

export interface EquipmentControlFilterContext {
  carrier?: Carrier;
  country: string[];
  location?: string;
  week: number;
  year: number;
  containerTypes: string[];
}

export const TASK_FILTERS_INITIAL_STATE = {
  country: [],
  week: getISOWeek(new Date()),
  year: getYear(new Date()),
  containerTypes: containerTypesValues,
} as EquipmentControlFilterContext;

const EquipmentControlFilterProviderContext = createContext<
  [EquipmentControlFilterContext, Dispatch<SetStateAction<EquipmentControlFilterContext>>]
>([TASK_FILTERS_INITIAL_STATE, () => {}]);

const EquipmentControlFilterProvider = (props: any) => {
  const carriers = useContext(Carriers);
  const [state, setState] = useState<EquipmentControlFilterContext>({
    ...TASK_FILTERS_INITIAL_STATE,
    carrier: carriers?.[0],
  });
  useEffect(() => {
    if (!carriers) return;
    setState(prevState => ({ ...prevState, carrier: carriers[0] }));
  }, [carriers]);

  return (
    <EquipmentControlFilterProviderContext.Provider value={[state, setState]}>
      {props.children}
    </EquipmentControlFilterProviderContext.Provider>
  );
};

export const useEquipmentControlFilterProviderContext = () => {
  const context = React.useContext(EquipmentControlFilterProviderContext);
  if (context === undefined) {
    throw new Error(
      'EquipmentControlFilterProviderContext must be used within a EquipmentControlFilter',
    );
  }
  return context;
};

export default EquipmentControlFilterProvider;
