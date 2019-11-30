import React, { useState } from 'react';
import DetailedRouteSearchParams from '../model/get-quotes/DetailedRouteSearchParams';

const RouteSearchContext = React.createContext<[DetailedRouteSearchParams, any]>([
  { date: new Date(), weeks: 4, containers: [] },
  (state: any) => {
    console.log('sdsaa', state);
  },
]);

const RouteSearchProvider = (props: any) => {
  const [state, setState] = useState({ date: new Date(), weeks: 4, containers: [] });
  const setStateFn = (state: any) => {
    console.log('seeting new state', state);
    setState(state);
  };
  return <RouteSearchContext.Provider value={[state, setStateFn]}>{props.children}</RouteSearchContext.Provider>;
};

export { RouteSearchContext, RouteSearchProvider };
