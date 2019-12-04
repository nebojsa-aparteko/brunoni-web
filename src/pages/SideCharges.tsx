import React, { Fragment, useContext } from 'react';
import SideChargesView from '../components/SideCharges';
import Helmet from 'react-helmet';
import Carriers from '../contexts/Carriers';

const SideCharges: React.FC = () => {
  const carriers = useContext(Carriers);

  return (
    <Fragment>
      <Helmet>
        <title>{`Side Charges | ${
          process.env.REACT_APP_BRAND ? process.env.REACT_APP_BRAND.toUpperCase() : ''
        }`}</title>
      </Helmet>
      <SideChargesView carriers={carriers} />
    </Fragment>
  );
};

export default SideCharges;
