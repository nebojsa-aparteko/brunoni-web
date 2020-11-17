import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';
import { WeeklyPaymentStatus } from '../model/WeeklyPayment';
import { startOfDay } from 'date-fns/fp';
import { Currency } from '../model/Payment';
import { CommissionStatus } from '../model/Commission';

export interface WeeklyPaymentFilterContext {
  carrier: Carrier;
  paymentDate: Date;
  currency: Currency[];
  status: WeeklyPaymentStatus[];
  commissionStatus: CommissionStatus[];
}

export const TASK_FILTERS_INITIAL_STATE = {
  currency: [Currency.USD],
  paymentDate: startOfDay(new Date()),
  status: [WeeklyPaymentStatus.IN_PROGRESS, WeeklyPaymentStatus.BLOCKED],
  commissionStatus: [CommissionStatus.INVOICED],
} as WeeklyPaymentFilterContext;

const WeeklyPaymentFilterProviderContext = createContext<
  [WeeklyPaymentFilterContext, Dispatch<SetStateAction<WeeklyPaymentFilterContext>> | undefined]
>([TASK_FILTERS_INITIAL_STATE, undefined]);

const WeeklyPaymentFilterProvider = (props: any) => {
  const [state, setState] = useState<WeeklyPaymentFilterContext>({
    ...TASK_FILTERS_INITIAL_STATE,
  });

  return (
    <WeeklyPaymentFilterProviderContext.Provider value={[state, setState]}>
      {props.children}
    </WeeklyPaymentFilterProviderContext.Provider>
  );
};

export const useWeeklyPaymentFilterProviderContext = () => {
  const context = React.useContext(WeeklyPaymentFilterProviderContext);
  if (context === undefined) {
    throw new Error('useWeeklyPaymentFilterProviderContext must be used within a WeeklyProviderFilterProvider');
  }
  return context;
};

export default WeeklyPaymentFilterProvider;
