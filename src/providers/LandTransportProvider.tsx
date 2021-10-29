import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { LandTransportFilterContext } from './LandTransportFilterProvider';
import { SegmentsEntity } from '../components/landTransport/LandTransportSearch';
import useUser from '../hooks/useUser';

export const LandTransportContext = createContext<
  [SegmentsEntity[][], Dispatch<SetStateAction<SegmentsEntity[][]>>, string[]]
>([[], () => {}, []]);

const LandTransportProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<SegmentsEntity[][]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [user] = useUser();
  useEffect(() => {
    user
      .getIdToken()
      .then(token => getAllLocations(token))
      .then(setLocations)
      .finally(() => console.log('Locations', locations));
  }, [getAllLocations]);
  const [filters] = useContext(LandTransportFilterContext);

  return <LandTransportContext.Provider value={[state, setState, locations]}>{children}</LandTransportContext.Provider>;
};

export default LandTransportProvider;

const getAllLocations = async (token: string) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/landTransport/allLocations`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const body = await response.json();
      return body;
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return body;
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};
