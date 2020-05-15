import React, { Fragment } from 'react';
import VesselVoyageContainer from '../components/vesselWithVoyage/VesselVoyageContainer';
import Meta from '../components/Meta';

const VesselWithVoyagePage = () => {
  return (
    <Fragment>
      <Meta title="Vessel Overview" />
      <VesselVoyageContainer />
    </Fragment>
  );
};

export default VesselWithVoyagePage;
