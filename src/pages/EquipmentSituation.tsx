import React, { Fragment } from 'react';
import EquipmentSituationView from '../components/EquipmentSituation';
import Helmet from 'react-helmet';

const EquipmentSituation: React.FC = () => (
  <Fragment>
    <Helmet>
      <title>{`Equipment Situation | ${
        process.env.REACT_APP_BRAND ? process.env.REACT_APP_BRAND.toUpperCase() : ''
      }`}</title>
    </Helmet>
    <EquipmentSituationView />
  </Fragment>
);

export default EquipmentSituation;
