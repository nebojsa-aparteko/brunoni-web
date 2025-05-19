import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import RouteFromCity from '../model/RouteFromCity';

const LandTransportSemiAutomaticContext = createContext<
  [RouteFromCity[], Dispatch<SetStateAction<RouteFromCity[]>>]
>([[], () => {}]);

const LandTransportSemiAutomaticProvider: React.FC = ({ children }) => {
  const [selectedDistances, setSelectedDistances] = useState<RouteFromCity[]>([]);

  return (
    <LandTransportSemiAutomaticContext.Provider value={[selectedDistances, setSelectedDistances]}>
      {children}
    </LandTransportSemiAutomaticContext.Provider>
  );
};

export const useLandTransportSemiAutomaticContext = () => {
  const context = React.useContext(LandTransportSemiAutomaticContext);
  if (context === undefined) {
    throw new Error(
      'useLandTransportSemiAutomaticContext must be used within a LandTransportSemiAutomaticProvider',
    );
  }
  return context;
};

export default LandTransportSemiAutomaticProvider;
