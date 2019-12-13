import React, { Fragment, useContext } from 'react';
import SideChargesView from '../components/SideCharges';
import Carriers from '../contexts/Carriers';
import Meta from '../components/Meta';

const AdminSideCharges: React.FC = () => {
  const carriers = useContext(Carriers);

  return (
    <Fragment>
      <Meta title="Side Charges" />
      <SideChargesView carriers={carriers} />
    </Fragment>
  );
};

export default AdminSideCharges;
