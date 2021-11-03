import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { TransportModeLabels } from '../model/land-transport/TransportMode';
const transfers = [
  {
    name: 'Show direct lines only',
    checked: false,
  },
  {
    name: '1 Transfer',
    checked: false,
  },
  {
    name: '2+ Transfers',
    checked: false,
  },
];

const companies = [
  {
    name: 'Contargo',
    checked: false,
  },
  {
    name: 'Swissterminal AG',
    checked: false,
  },
  {
    name: 'Maritime transport Ltd.',
    checked: false,
  },
  {
    name: 'IBA logistics Group',
    checked: false,
  },
  {
    name: 'Distrifresh B.V',
    checked: false,
  },
  {
    name: 'Company 1',
    checked: false,
  },
  {
    name: 'Company 2',
    checked: false,
  },
  {
    name: 'Company 3',
    checked: false,
  },
];

export const LAND_TRANSPORT_FILTERS_INITIAL_STATE = {
  transfers,
  companies,
  transportModes: Object.values(TransportModeLabels).map(val => ({ checked: false, name: val })),
  containerTypes: ["20'", "40'"].map(v => ({ checked: false, name: v })),
  equipmentGroupTypes: ['GENERAL PURPOSE', 'REEFER', 'SPECIAL'].map(v => ({ checked: false, name: v })),
} as LandTransportFilter;

export const LandTransportFilterContext = createContext<
  [LandTransportFilter, Dispatch<SetStateAction<LandTransportFilter>>]
>([LAND_TRANSPORT_FILTERS_INITIAL_STATE, () => {}]);

const LandTransportFilterProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<LandTransportFilter>(LAND_TRANSPORT_FILTERS_INITIAL_STATE);

  return (
    <LandTransportFilterContext.Provider value={[state, setState]}>{children}</LandTransportFilterContext.Provider>
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
