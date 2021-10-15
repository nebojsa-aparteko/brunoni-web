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
import NextPreviousVesselTable from './NextPreviousVesselTable';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface VesselAllocationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  vesselVoyage: RouteSearchResultVoyageInfo;
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#dialog-vessel-allocation" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const VesselAllocationModal: React.FC<VesselAllocationModalProps> = ({ isOpen, closeModal, vesselVoyage }) => {
  const classes = useVesselAllocationStyles();

  const vesselVoyageString = useMemo(() => `${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr}`, [
    vesselVoyage?.VesselName,
    vesselVoyage?.VoyageNr,
  ]);
  const vessel = useVesselWithVoyageById(vesselVoyageString);

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
          <IconButton onClick={handleCloseModal} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography style={{ textAlign: 'center' }}>
            Vessel: {`${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr} (${vesselVoyage.Carrier})`}
          </Typography>
          <Box mb={2} />
          <Box flex={1} display="flex" flexDirection="column" m={1}>
            <ExpansionPanel TransitionProps={{ mountOnEnter: true }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Allocation</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>{vessel && <VesselAllocationTable vessel={vessel} />}</ExpansionPanelDetails>
            </ExpansionPanel>
            <Box mb={2} />
            <ExpansionPanel TransitionProps={{ mountOnEnter: true }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5">Previous & Next Vessel</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ display: 'flex', justifyContent: 'center' }}>
                {vessel && <NextPreviousVesselTable vessel={vessel} />}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default VesselAllocationModal;
