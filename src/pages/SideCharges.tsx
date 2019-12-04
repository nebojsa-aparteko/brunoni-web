import React, { Fragment, useContext } from 'react';
import SideChargesView from '../components/SideCharges';
import Helmet from 'react-helmet';
import Carriers from '../contexts/Carriers';
import Meta from '../components/Meta';

const SideCharges: React.FC = () => {
  const carriers = useContext(Carriers);

  return (
    <Fragment>
      <Meta title="Side Charges" />
      <SideChargesView carriers={carriers} />
    </Fragment>
  );
};

export default SideCharges;
