import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LandTransportFilterContext } from './LandTransportFilterProvider';
import { R } from '../components/landTransport/LandTransportSearch';
import useLandTransportLocations from '../hooks/useLandTransportLocations';
import { debounce } from 'lodash/fp';

interface LandTransportContextI {
  filteredLandTransportRoutes: R[];
  setLandTransportRoutes: Dispatch<SetStateAction<R[]>>;
  fromLocationInputState: string;
  setFromLocationInputState: React.Dispatch<React.SetStateAction<string>>;
  toLocationInputState: string;
  setToLocationInputState: React.Dispatch<React.SetStateAction<string>>;
  fromLocations: string[];
  toLocations: string[];
  loadingLocations: boolean;
  setLoadingLocations: Dispatch<React.SetStateAction<boolean>>;
  loadingRoutes: boolean;
  setLoadingRoutes: Dispatch<React.SetStateAction<boolean>>;
}

const INITIAL_STATE = {
  filteredLandTransportRoutes: [],
  setLandTransportRoutes: () => {},
  fromLocationInputState: '',
  setFromLocationInputState: () => {},
  toLocationInputState: '',
  setToLocationInputState: () => {},
  fromLocations: [],
  toLocations: [],
  loadingLocations: false,
  setLoadingLocations: () => {},
  loadingRoutes: false,
  setLoadingRoutes: () => {},
};

export const LandTransportContext = createContext<LandTransportContextI>(INITIAL_STATE);
const LandTransportProvider: React.FC = ({ children }) => {
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [landTransportRoutes, setLandTransportRoutes] = useState<R[]>([]);

  const [fromLocationInputState, setFromLocationInputState] = useState('');
  const [fromLocations, setFromLocations] = useState<string[]>([]);

  const [toLocationInputState, setToLocationInputState] = useState('');
  const [toLocations, setToLocations] = useState<string[]>([]);

  const [filters] = useContext(LandTransportFilterContext);
  const { getLocationsByName } = useLandTransportLocations();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getFromLocations = useCallback(
    debounce(500)(() => {
      if (fromLocationInputState.length >= 2) {
        setLoadingLocations(true);
        getLocationsByName(fromLocationInputState)
          .then(setFromLocations)
          .finally(() => setLoadingLocations(false));
      }
    }),
    [fromLocationInputState],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getToLocations = useCallback(
    debounce(500)(() => {
      if (toLocationInputState.length >= 2) {
        setLoadingLocations(true);
        getLocationsByName(toLocationInputState)
          .then(setToLocations)
          .finally(() => setLoadingLocations(false));
      }
    }),
    [toLocationInputState],
  );

  useEffect(() => {
    getFromLocations();
  }, [getFromLocations]);

  useEffect(() => {
    getToLocations();
  }, [getToLocations]);

  const filteredLandTransportRoutes = useMemo(() => {
    let temp = landTransportRoutes;
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
  }, [landTransportRoutes, filters]);
  return (
    <LandTransportContext.Provider
      value={{
        filteredLandTransportRoutes,
        setLandTransportRoutes,
        fromLocationInputState,
        setFromLocationInputState,
        toLocationInputState,
        setToLocationInputState,
        fromLocations,
        toLocations,
        loadingLocations,
        setLoadingLocations,
        loadingRoutes,
        setLoadingRoutes,
      }}
    >
      {children}
    </LandTransportContext.Provider>
  );
};

export default LandTransportProvider;
