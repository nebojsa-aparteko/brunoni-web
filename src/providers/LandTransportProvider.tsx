import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { LandTransportFilterContext } from './LandTransportFilterProvider';
import { R } from '../components/landTransport/LandTransportSearch';
import useUser from '../hooks/useUser';

export const LandTransportContext = createContext<
  [R[], Dispatch<SetStateAction<R[]>>, string[], boolean, Dispatch<React.SetStateAction<boolean>>]
>([[], () => {}, [], false, () => {}]);
const LandTransportProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<R[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [user] = useUser();
  useEffect(() => {
    user
      .getIdToken()
      .then(token => getAllLocations(token))
      .then(setLocations)
      .finally(() => console.log('Got Locations'));
  }, [user]);

  const [filters] = useContext(LandTransportFilterContext);

  const filteredRoutes = useMemo(() => {
    let temp = state;
    if (filters.transportModes.some(value => value.checked)) {
      temp = temp.filter(value =>
        value.props.transportMode.some(p =>
          filters.transportModes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
    }
    if (filters.containerTypes.some(value => value.checked)) {
      temp = temp.filter(value =>
        value.props.equSize.some(p =>
          filters.containerTypes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
    }
    if (filters.equipmentGroupTypes.some(value => value.checked)) {
      temp = temp.filter(value =>
        value.props.equGroup.some(p =>
          filters.equipmentGroupTypes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
    }
    console.log('Filtering not transportModes');
    return temp;
  }, [state, filters]);
  return (
    <LandTransportContext.Provider value={[filteredRoutes, setState, locations, loading, setLoading]}>
      {children}
    </LandTransportContext.Provider>
  );
};

export default LandTransportProvider;

const getAllLocations = async (token: string): Promise<string[]> => {
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
      return await response.json();
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return [];
    }
  } catch (e) {
    console.error('Failed to perform request', e);
    return [];
  }
};
