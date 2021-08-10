import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { RouteSearchResult } from '../model/land-transport/RouteSearchResult';
import { LandTransportFilterContext } from './LandTransportFilterProvider';

export const LandTransportContext = createContext<[RouteSearchResult[], Dispatch<SetStateAction<RouteSearchResult[]>>]>(
  [[], () => {}],
);

const LandTransportProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<RouteSearchResult[]>([]);
  const [filters] = useContext(LandTransportFilterContext);

  return <LandTransportContext.Provider value={[state, setState]}>{children}</LandTransportContext.Provider>;
};

export default LandTransportProvider;
