import React, { useEffect, useState } from 'react';
import Context from '../contexts/Locations';
import { Location } from '../model/get-quotes/Location';

interface Props {
  children: React.ReactNode;
}

const initialState = process.env.NODE_ENV !== 'production' ? require('../test/LocationsDataTest.json') : undefined;

const LocationsProvider: React.FC<Props> = ({ children }) => {
  const [locations, setLocations] = useState<Location[] | undefined>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/locations`, { signal });
      const body = await response.json();
      setLocations(body['ws-pul'] as Location[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <Context.Provider value={locations}>{children}</Context.Provider>;
};

export default LocationsProvider;
