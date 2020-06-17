import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

export interface MyDayContextFilters {}

export const MY_DAY_FILTERS_INITIAL_STATE = {} as MyDayContextFilters;

const MyDayFilterContext = createContext<
  [MyDayContextFilters, Dispatch<SetStateAction<MyDayContextFilters>> | undefined]
>([MY_DAY_FILTERS_INITIAL_STATE, undefined]);

const MyDayFilterProvider = (props: any) => {
  const [state, setState] = useState<MyDayContextFilters>(MY_DAY_FILTERS_INITIAL_STATE);

  return <MyDayFilterContext.Provider value={[state, setState]}>{props.children}</MyDayFilterContext.Provider>;
};

export const useMyDayFilterContext = () => {
  const context = React.useContext(MyDayFilterContext);
  if (context === undefined) {
    throw new Error('useLoadListFilterContext must be used within a LoadListFilterProvider');
  }
  return context;
};

export default MyDayFilterProvider;
