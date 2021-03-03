import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import EquipmentControlContainer from '../components/equipmentControl/EquipmentControlContainer';

const EquipmentControlPage = () => {
  return (
    <Fragment>
      <Meta title="Equipment Control" />
      <EquipmentControlContainer />
    </Fragment>
  );
};

export default EquipmentControlPage;
