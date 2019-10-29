import React, { Fragment, useEffect } from 'react';

const Routes: React.FC = () => {
  useEffect(() => {
    (async () => {
      const result = await fetch('http://localhost:8080');
      console.log(result);
    })();
  }, []);

  return <Fragment></Fragment>;
};

export default Routes;
