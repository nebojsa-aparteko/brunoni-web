import React from 'react';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';
import useLocalStorage from '../utilities/useLocalStorage';
import addDays from 'date-fns/addDays';

const RouteSearchContext = React.createContext<[DetailedRouteSearchParams, any]>([
  { date: new Date(), weeks: 4, containers: [] },
  (state: any) => {},
]);

const RouteSearchProvider = (props: any) => {
  const [state, setState] = useLocalStorage(
    'routeSearchData',
    { date: addDays(new Date(), 2), weeks: 4, containers: [] },
    false,
  );
  const setStateFn = (state: any) => {
    setState(state);
  };
  return <RouteSearchContext.Provider value={[state, setStateFn]}>{props.children}</RouteSearchContext.Provider>;
};

export { RouteSearchContext, RouteSearchProvider };
