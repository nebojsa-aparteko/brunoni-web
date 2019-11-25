import React, { useEffect, useState } from 'react';
import Context from '../contexts/Ports';
import Port from '../model/Port';

interface Props {
  children: React.ReactNode;
}

const PortsProvider: React.FC<Props> = ({ children }) => {
  const [ports, setPorts] = useState<Port[] | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ports`, { signal });
      const body = await response.json();
      setPorts(body.Ports as Port[]);
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return <Context.Provider value={ports}>{children}</Context.Provider>;
};

export default PortsProvider;
