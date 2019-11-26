import React, { useEffect, useState } from 'react';
import Context from '../contexts/ContainerTypes';
import { ContainerType } from '../model/get-quotes/ContainerType';

interface Props {
  children: React.ReactNode;
}

const initialState = process.env.NODE_ENV !== 'production' ? require('../test/ContainerTypesDataTest.json') : undefined;

const ContainerTypesProvider: React.FC<Props> = ({ children }) => {
  const [containerTypes, setContainerTypes] = useState<ContainerType[] | undefined>(initialState);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/containerTypes`, { signal });
      const body = await response.json();
      setContainerTypes(body.ContainerTypes as ContainerType[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <Context.Provider value={containerTypes}>{children}</Context.Provider>;
};

export default ContainerTypesProvider;
