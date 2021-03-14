import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import EquipmentControlContainer from '../components/equipmentControl/EquipmentControlContainer';
import EquipmentControlFilterProvider from '../providers/EquipmentControlFilterProvider';

const EquipmentControlPage = () => {
  return (
    <Fragment>
      <Meta title="Equipment Control" />
      <EquipmentControlFilterProvider>
        <EquipmentControlContainer />
      </EquipmentControlFilterProvider>
    </Fragment>
  );
};

export default EquipmentControlPage;
