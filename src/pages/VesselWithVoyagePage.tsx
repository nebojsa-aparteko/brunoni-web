import React, { Fragment } from 'react';
import VesselVoyageContainer from '../components/vesselWithVoyage/VesselVoyageContainer';
import Meta from '../components/Meta';
import VesselOverviewFilterProvider from '../providers/VesselOverviewFilterProvider';

const VesselWithVoyagePage = () => {
  return (
    <Fragment>
      <Meta title="Vessel Overview" />
      <VesselOverviewFilterProvider>
        <VesselVoyageContainer />
      </VesselOverviewFilterProvider>
    </Fragment>
  );
};

export default VesselWithVoyagePage;
