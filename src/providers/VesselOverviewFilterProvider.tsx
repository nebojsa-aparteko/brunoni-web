import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';
import { BookingCategory } from '../model/Booking';
import { addDays, subDays } from 'date-fns';
import { DateRange } from '../components/daterangepicker/types';

export interface VesselContextFilters {
  carrier: Carrier | undefined;
  category: BookingCategory;
  dateRange: DateRange;
}

export const VESSEL_FILTERS_INITIAL_STATE = {
  carrier: undefined,
  category: BookingCategory.Export,
  dateRange: { startDate: subDays(new Date(), 5), endDate: addDays(new Date(), 5) } as DateRange,
} as VesselContextFilters;

const VesselOverviewFilterContext = createContext<
  [VesselContextFilters, Dispatch<SetStateAction<VesselContextFilters>> | undefined]
>([VESSEL_FILTERS_INITIAL_STATE, undefined]);

const VesselOverviewFilterProvider = (props: any) => {
  const [state, setState] = useState<VesselContextFilters>(VESSEL_FILTERS_INITIAL_STATE);

  return (
    <VesselOverviewFilterContext.Provider value={[state, setState]}>
      {props.children}
    </VesselOverviewFilterContext.Provider>
  );
};

export const useVesselFilterContext = () => {
  const context = React.useContext(VesselOverviewFilterContext);
  if (context === undefined) {
    throw new Error('useVesselFilterContext must be used within a VesselOverviewFilterProvider');
  }
  return context;
};

export default VesselOverviewFilterProvider;
