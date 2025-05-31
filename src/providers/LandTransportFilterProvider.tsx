import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

export const LAND_TRANSPORT_FILTERS_INITIAL_STATE = {
  transfers: [],
  companies: [],
  transportModes: [],
  containerTypes: [],
  equipmentGroupTypes: [],
} as LandTransportFilter;

export const LandTransportFilterContext = createContext<
  [LandTransportFilter, Dispatch<SetStateAction<LandTransportFilter>>]
>([LAND_TRANSPORT_FILTERS_INITIAL_STATE, () => {}]);

const LandTransportFilterProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<LandTransportFilter>(LAND_TRANSPORT_FILTERS_INITIAL_STATE);
  return (
    <LandTransportFilterContext.Provider value={[state, setState]}>
      {children}
    </LandTransportFilterContext.Provider>
  );
};

export interface LandTransportFilter {
  transfers: Collection[];
  companies: Collection[];
  transportModes: Collection[];
  containerTypes: Collection[];
  equipmentGroupTypes: Collection[];
}

export interface Collection {
  name: string;
  checked: boolean;
}

export default LandTransportFilterProvider;
