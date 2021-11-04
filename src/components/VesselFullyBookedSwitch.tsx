import React, { useEffect, useState } from 'react';
import firebase from '../firebase';
import { Switch, Typography } from '@material-ui/core';
import useVesselWithVoyageById from '../hooks/useVesselWithVoyageById';
import { useSnackbar } from 'notistack';

const setFullyBookedStatus = (docId: string, newValue: boolean) => {
  return firebase
    .firestore()
    .collection('vesselWithVoyage')
    .doc(docId)
    .update('isFullyBooked', newValue);
};

const VesselFullyBookedSwitch: React.FC<Props> = ({ vessel }) => {
  const vesselWithVoyage = useVesselWithVoyageById(vessel);
  const [isFullyBooked, setIsFullyBooked] = useState(vesselWithVoyage?.isFullyBooked || false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setIsFullyBooked(vesselWithVoyage?.isFullyBooked || false);
  }, [vesselWithVoyage?.isFullyBooked]);

  const toggleFullyBooked = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await setFullyBookedStatus(vessel, !vesselWithVoyage?.isFullyBooked);
    } catch (e) {
      console.error('Failed to switch', e.message);
      enqueueSnackbar(<Typography color="inherit"> {e.message}</Typography>, {
        variant: 'error',
        autoHideDuration: 3000,
      });
    }
  };

  return <Switch color="primary" onClick={toggleFullyBooked} checked={isFullyBooked} />;
};

interface Props {
  vessel: string;
}

export default VesselFullyBookedSwitch;
