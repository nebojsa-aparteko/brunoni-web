import React, { useEffect, useState } from 'react';
import Context from '../contexts/CommodityTypes';
import { CommodityType } from '../model/get-quotes/CommodityType';
import useTestData from '../utilities/useTestData';

interface Props {
  children: React.ReactNode;
}

const CommodityTypesProvider: React.FC<Props> = ({ children }) => {
  const [containerTypes, setCommodityTypes] = useState<CommodityType[] | undefined>(
    useTestData<CommodityType[]>('commodityTypes'),
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/commodityTypes`, { signal });
      const body = await response.json();
      setCommodityTypes(body.CommodityTypes as CommodityType[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <Context.Provider value={containerTypes}>{children}</Context.Provider>;
};

export default CommodityTypesProvider;
