import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';
import { startOfDay } from 'date-fns/fp';
import { Currency } from '../model/Payment';
import { CommissionStatus } from '../model/Commission';

export interface CommissionFilterContext {
  carrier: Carrier;
  paymentDate: Date;
  currency: Currency[];
  commissionStatus: CommissionStatus[];
}

export const COMMISSION_FILTERS_INITIAL_STATE = {
  currency: [Currency.USD],
  paymentDate: startOfDay(new Date()),
  commissionStatus: [CommissionStatus.INVOICED],
} as CommissionFilterContext;

const CommissionFilterProviderContext = createContext<
  [CommissionFilterContext, Dispatch<SetStateAction<CommissionFilterContext>>]
>([COMMISSION_FILTERS_INITIAL_STATE, () => {}]);

const CommissionFilterProvider = (props: any) => {
  const [state, setState] = useState<CommissionFilterContext>({
    ...COMMISSION_FILTERS_INITIAL_STATE,
  });

  return (
    <CommissionFilterProviderContext.Provider value={[state, setState]}>
      {props.children}
    </CommissionFilterProviderContext.Provider>
  );
};

export const useCommissionFilterProviderContext = () => {
  const context = React.useContext(CommissionFilterProviderContext);
  if (context === undefined) {
    throw new Error('useWeeklyPaymentFilterProviderContext must be used within a WeeklyProviderFilterProvider');
  }
  return context;
};

export default CommissionFilterProvider;
