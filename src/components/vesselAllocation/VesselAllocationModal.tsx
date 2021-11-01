import React, { useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  Paper,
  PaperProps,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useVesselAllocationStyles } from './VesselAllocationButton';
import Draggable from 'react-draggable';
import { RouteSearchResultVoyageInfo } from '../../model/route-search/RouteSearchResults';
import VesselAllocationTable from './VesselAllocationTable';
import useVesselWithVoyageById from '../../hooks/useVesselWithVoyageById';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BookingRequest } from '../../model/BookingRequest';
import { Alert } from '@material-ui/lab';
import NextPreviousVesselTable from './NextPreviousVesselTable';

interface VesselAllocationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  vesselVoyage: RouteSearchResultVoyageInfo;
  service?: string;
  bookingRequest?: BookingRequest;
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#dialog-vessel-allocation" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const VesselAllocationModal: React.FC<VesselAllocationModalProps> = ({
  isOpen,
  closeModal,
  vesselVoyage,
  service,
  bookingRequest,
}) => {
  const classes = useVesselAllocationStyles();

  const vesselVoyageString = useMemo(() => `${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr}`, [
    vesselVoyage?.VesselName,
    vesselVoyage?.VoyageNr,
  ]);
  const vesselAllocation = useVesselWithVoyageById(vesselVoyageString);

  const handleCloseModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    closeModal();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseModal}
      PaperComponent={PaperComponent}
      aria-labelledby="dialog-vessel-allocation"
      maxWidth="md"
    >
      <Box className={classes.dialogBody} onClick={event => event.stopPropagation()}>
        <DialogTitle
          disableTypography
          id="dialog-vessel-allocation"
          style={{ cursor: 'move' }}
          onClick={event => event.stopPropagation()}
        >
          <Typography variant="h4">Vessel Allocation</Typography>
          {vesselAllocation && vesselAllocation.isFullyBooked && (
            <Alert severity="warning" className={classes.fullyBookedWarning}>
              This vessel is fully booked!
            </Alert>
          )}
          <IconButton onClick={handleCloseModal} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography style={{ textAlign: 'center' }}>
            Vessel:{' '}
            {`${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr} (${vesselVoyage.Carrier})` +
              (service ? ` / ${service}` : '')}
          </Typography>
          <Box mb={2} />
          <Box flex={1} display="flex" flexDirection="column" m={1}>
            <ExpansionPanel defaultExpanded={true}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Allocation</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ padding: 0 }}>
                {vesselAllocation && <VesselAllocationTable vessel={vesselAllocation} vesselVoyage={vesselVoyage} />}
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <Box mb={2} />
            <ExpansionPanel TransitionProps={{ mountOnEnter: true }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Previous & Next Vessel</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ display: 'flex', justifyContent: 'center', padding: 0 }}>
                {vesselAllocation && (
                  <NextPreviousVesselTable vessel={vesselAllocation} bookingRequest={bookingRequest} />
                )}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default VesselAllocationModal;
