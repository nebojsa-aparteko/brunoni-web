import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../store/GlobalStore';
import firebase from '../firebase';
import { Switch } from '@material-ui/core';
import useVesselWithVoyageById from '../hooks/useVesselWithVoyageById';

const setFullyBookedStatus = (docId: string, newValue: boolean) => {
  return firebase
    .firestore()
    .collection('vesselWithVoyage')
    .doc(docId)
    .update('isFullyBooked', newValue);
};

const VesselFullyBookedSwitch: React.FC<Props> = ({ vessel }) => {
  const [, dispatch] = useContext(GlobalContext);
  const vesselWithVoyage = useVesselWithVoyageById(vessel);
  const [isFullyBooked, setIsFullyBooked] = useState(vesselWithVoyage?.isFullyBooked || false);

  useEffect(() => {
    setIsFullyBooked(vesselWithVoyage?.isFullyBooked || false);
  }, [vesselWithVoyage?.isFullyBooked]);

  const toggleFullyBooked = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch({ type: 'START_GLOBAL_LOADING' });
    setFullyBookedStatus(vessel, !vesselWithVoyage?.isFullyBooked).finally(() =>
      dispatch({ type: 'STOP_GLOBAL_LOADING' }),
    );
  };

  return <Switch color="primary" onClick={toggleFullyBooked} checked={isFullyBooked} />;
};

interface Props {
  vessel: string;
}

export default VesselFullyBookedSwitch;
