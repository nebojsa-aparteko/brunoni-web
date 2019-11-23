import React, { useEffect, useState } from 'react';
import Context from '../contexts/Carriers';
import Carrier from '../model/Carrier';

interface Props {
  children: React.ReactNode;
}

const CarriersProvider: React.FC<Props> = ({ children }) => {
  const [carriers, setCarriers] = useState<Carrier[] | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/carriers`, { signal });
      const body = await response.json();
      setCarriers(body.Carriers as Carrier[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <Context.Provider value={carriers}>{children}</Context.Provider>;
};

export default CarriersProvider;
