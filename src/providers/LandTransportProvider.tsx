import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { LandTransportFilterContext } from './LandTransportFilterProvider';
import { R } from '../components/landTransport/LandTransportSearch';
import useUser from '../hooks/useUser';
import useGlobalAppState from '../hooks/useGlobalAppState';

export const LandTransportContext = createContext<[R[], Dispatch<SetStateAction<R[]>>, string[]]>([[], () => {}, []]);
const LandTransportProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<R[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [user] = useUser();
  const [, dispatch] = useGlobalAppState();
  useEffect(() => {
    user
      .getIdToken()
      .then(token => getAllLocations(token))
      .then(setLocations)
      .finally(() => console.log('Locations', locations));
  }, [getAllLocations]);
  const [filters] = useContext(LandTransportFilterContext);

  const filteredRoutes = useMemo(() => {
    let temp = state;
    if (filters.transportModes.some(value => value.checked)) {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      temp = temp.filter(value =>
        value.props.transportMode.some(p =>
          filters.transportModes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
    if (filters.containerTypes.some(value => value.checked)) {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      temp = temp.filter(value =>
        value.props.equSize.some(p =>
          filters.containerTypes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
    if (filters.equipmentGroupTypes.some(value => value.checked)) {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      temp = temp.filter(value =>
        value.props.equGroup.some(p =>
          filters.equipmentGroupTypes
            .filter(t => t.checked)
            .map(t => t.name.toUpperCase())
            .includes(p),
        ),
      );
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
    console.log('Filtering not transportModes');
    return temp;
  }, [state, filters, dispatch]);
  return (
    <LandTransportContext.Provider value={[filteredRoutes, setState, locations]}>
      {children}
    </LandTransportContext.Provider>
  );
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
