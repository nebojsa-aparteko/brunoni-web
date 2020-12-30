import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';
import { Currency } from '../model/Payment';
import { CommissionStatus } from '../model/Commission';
import { DateRange } from '../components/daterangepicker/types';
import { LAST_3_MONTHS } from './filterActions';

export interface CommissionFilterContext {
  carriers: Carrier[];
  currency: Currency[];
  commissionStatus: CommissionStatus[];
  dateRange?: DateRange;
}

export const COMMISSION_FILTERS_INITIAL_STATE = {
  currency: [Currency.USD],
  commissionStatus: [CommissionStatus.INVOICED],
  dateRange: LAST_3_MONTHS,
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
