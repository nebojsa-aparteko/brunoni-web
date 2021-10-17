import React from 'react';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import useModal from '../../hooks/useModal';
import { RouteSearchResultVoyageInfo } from '../../model/route-search/RouteSearchResults';
import VesselAllocationModal from './VesselAllocationModal';

export const useVesselAllocationStyles = makeStyles(theme => ({
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogBody: {
    minWidth: theme.spacing(100),
    width: 'auto',
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  expansionPanel: {
    display: 'flex',
    alignItems: 'center',
  },
  hidePrint: {
    '@media print': {
      display: 'none',
    },
  },
  tableRowHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inttraLogo: {
    width: '4em',
    height: '2em',
    marginRight: '10px',
    objectFit: 'cover',
  },
  tableRow: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}));

const VesselAllocationButton: React.FC<VesselAllocationButtonProps> = ({ vesselVoyage, service }) => {
  const { closeModal, openModal, isOpen } = useModal();
  const classes = useVesselAllocationStyles();

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    openModal();
  };

  return (
    <Box className={classes.hidePrint}>
      <IconButton color="primary" aria-label="check vessel space" onClick={event => handleOpenModal(event)}>
        <DirectionsBoatIcon />
      </IconButton>
      {vesselVoyage && isOpen && (
        <VesselAllocationModal isOpen={isOpen} closeModal={closeModal} vesselVoyage={vesselVoyage} service={service} />
      )}
    </Box>
  );
};

export default VesselAllocationButton;

interface VesselAllocationButtonProps {
  vesselVoyage?: RouteSearchResultVoyageInfo;
  service?: string;
}
