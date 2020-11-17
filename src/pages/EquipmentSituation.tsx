import React, { Fragment } from 'react';
import EquipmentSituationView from '../components/EquipmentSituation';
import Meta from '../components/Meta';

const EquipmentSituation: React.FC = () => (
  <Fragment>
    <Meta title="Equipment Situation" />
    <EquipmentSituationView />
  </Fragment>
);

export default EquipmentSituation;
