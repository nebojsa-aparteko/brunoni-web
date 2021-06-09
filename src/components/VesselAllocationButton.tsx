import React, { useMemo } from 'react';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import useModal from '../hooks/useModal';
import CloseIcon from '@material-ui/icons/Close';
import { RouteSearchResultVoyageInfo } from '../model/route-search/RouteSearchResults';
import useVesselWithVoyageById from '../hooks/useVesselWithVoyageById';
import VesselAllocation from '../model/VesselAllocation';

const useStyles = makeStyles(theme => ({
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
    minHeight: theme.spacing(60),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
}));

const VesselAllocationModal: React.FC<VesselAllocationModal> = ({ isOpen, closeModal, vesselVoyage }) => {
  const classes = useStyles();
  const vessel = useVesselWithVoyageById(`${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr}`);
  const allocation = useMemo(() => countAllocation(vessel), [vessel]);
  return (
    <Dialog open={isOpen} onClose={closeModal} aria-labelledby="dialog-vessel-allocation" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Vessel Allocation</Typography>
          <IconButton onClick={closeModal} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography style={{ textAlign: 'center' }}>
            Vessel: {`${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr}`}
          </Typography>
          <Box mb={2} />
          {vessel && (
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell align="right">TEU</TableCell>
                    <TableCell align="right">TON</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Allocation
                    </TableCell>
                    <TableCell align="right">{vessel.teuAllocation}</TableCell>
                    <TableCell align="right">{vessel.weightAllocation}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Booked
                    </TableCell>
                    <TableCell align="right">
                      {vessel.teuBooked} <PercentData percent={vessel.teuPercent} />
                    </TableCell>
                    <TableCell align="right">
                      {vessel.weightBooked} <PercentData percent={vessel.weightPercent} />
                    </TableCell>
                  </TableRow>
                  {vessel.requested && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Requested Bookings (Status: Requested)
                      </TableCell>
                      <TableCell align="right">{vessel.requested.quantity}</TableCell>
                      <TableCell align="right">{vessel.requested.weight}</TableCell>
                    </TableRow>
                  )}
                  {vessel.inProgress && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Requested Bookings (Status: In Progress)
                      </TableCell>
                      <TableCell align="right">{vessel.inProgress.quantity}</TableCell>
                      <TableCell align="right">{vessel.inProgress.weight}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Total
                    </TableCell>
                    <TableCell align="right">{allocation.total.teu}</TableCell>
                    <TableCell align="right">{allocation.total.ton}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Left to Book
                    </TableCell>
                    <TableCell align="right">{allocation.difference.teu}</TableCell>
                    <TableCell align="right">{allocation.difference.ton}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

const VesselAllocationButton: React.FC<VesselAllocationButtonProps> = ({ vesselVoyage }) => {
  const { closeModal, openModal, isOpen } = useModal();
  return (
    <>
      <IconButton color="primary" aria-label="check vessel space" onClick={openModal}>
        <DirectionsBoatIcon />
      </IconButton>
      {vesselVoyage && isOpen && (
        <VesselAllocationModal isOpen={isOpen} closeModal={closeModal} vesselVoyage={vesselVoyage} />
      )}
    </>
  );
};

export default VesselAllocationButton;

const PercentData = ({ percent }: { percent: string }) => (
  <Box>
    <Typography style={{ color: +percent > 100 ? 'red' : 'green' }}>{`(${percent} %)`}</Typography>
  </Box>
);

interface VesselAllocationButtonProps {
  vesselVoyage?: RouteSearchResultVoyageInfo;
}

interface VesselAllocationModal {
  isOpen: boolean;
  closeModal: () => void;
  vesselVoyage: RouteSearchResultVoyageInfo;
}

const countAllocation = (allocation?: VesselAllocation) => {
  if (!allocation) return { total: { teu: 0, ton: 0 }, difference: { teu: 0, ton: 0 } };
  const allocationTotal = {
    teu: (allocation.inProgress?.quantity || 0) + (allocation.requested?.quantity || 0) + +allocation.teuBooked,
    ton: (allocation.inProgress?.weight || 0) + (allocation.requested?.weight || 0) + +allocation.weightBooked,
  };

  return {
    total: allocationTotal,
    difference: {
      teu: +allocation.teuAllocation - allocationTotal.teu,
      ton: +allocation.weightAllocation - allocationTotal.ton,
    },
  };
};
