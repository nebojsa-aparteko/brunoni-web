import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import {
  Box,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  PaperProps,
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
import Draggable from 'react-draggable';
import useBookingRequests from '../hooks/useBookingRequests';
import { BookingRequest, BookingRequestStatusCode } from '../model/BookingRequest';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import InfoBoxItem from './InfoBoxItem';
import {
  getDestinationPort,
  getOriginPort,
  showDeliveryRef,
  StyledTableRow,
} from './bookingRequests/BookingRequestsTable';
import { useHistory } from 'react-router';
import useUser from '../hooks/useUser';
import inttraLogo from '../assets/inttra-vector-logo.svg';
import { isDashboardUser } from '../model/UserRecord';
import Avatar from 'react-avatar';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import formatDate from 'date-fns/format';
import { formatDistanceToNowConfigured } from '../utilities/formattingHelpers';
import PinnedCommentsButton from './bookingRequests/PinnedCommentsButton';

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
}));

interface BookingsOverviewTableProps {
  bookingRequests: BookingRequest[];
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#dialog-vessel-allocation" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

interface BookingRequestRowProps {
  bookingRequest: BookingRequest;
  preventDefaultClick?: boolean;
}

export const BookingRequestRow: React.FC<BookingRequestRowProps> = ({ bookingRequest, preventDefaultClick }) => {
  const classes = useStyles();
  const history = useHistory();

  const [, userRecord] = useUser();

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        const win: Window | null = window.open(`/booking-requests/${id}`, '_blank');
        win && win.focus();
      }
    },
    [history, preventDefaultClick],
  );

  return (
    <StyledTableRow
      tabIndex={-1}
      onClick={() => handleRowClick(bookingRequest.id!)}
      style={{
        position: 'relative',
        display: 'flex',
        backgroundColor: bookingRequest.isUnread ? 'rgba(161,213,255,0.25)' : undefined,
        border: !bookingRequest.assignedUser && '2px solid #00b0ff',
      }}
    >
      <Grid container item xs={12}>
        <Grid item lg={12} xs={12}>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <span className={classes.tableRowHeader}>
              <Typography variant="h5">Request No. {bookingRequest.id}</Typography>
            </span>
            {bookingRequest && showDeliveryRef(bookingRequest)}
            {bookingRequest.intraRefNumber && <img src={inttraLogo} alt="inttra logo" className={classes.inttraLogo} />}
          </Box>
        </Grid>
        <Grid item lg={12} xs={12}>
          <Grid container spacing={1}>
            <Grid item md={4} xs={12}>
              <InfoBoxItem
                title="Client"
                label1={
                  bookingRequest && bookingRequest.client && bookingRequest.client.name
                    ? bookingRequest.client.name.toUpperCase()
                    : ''
                }
                label2={
                  bookingRequest &&
                  bookingRequest.createdBy &&
                  (bookingRequest.createdBy.firstName || bookingRequest.createdBy.lastName)
                    ? (bookingRequest.createdBy.firstName + ' ' + bookingRequest.createdBy.lastName).toUpperCase()
                    : ''
                }
                gutterBottom
              />
            </Grid>
            <Grid item container md={6} xs={12}>
              <Grid item xs={6}>
                <InfoBoxItem
                  IconComponent={ChevronRightIcon}
                  title="Origin"
                  label1={
                    getOriginPort(bookingRequest.itinerary)?.Port.HarbourName +
                    ', ' +
                    getOriginPort(bookingRequest.itinerary)?.Port.Land
                  }
                  label2={bookingRequest.itinerary && `ETS: ${getOriginPort(bookingRequest.itinerary)?.DepartureDate}`}
                  gutterBottom
                />
              </Grid>
              <Grid item xs={6}>
                <InfoBoxItem
                  IconComponent={LastPageIcon}
                  title="Destination"
                  label1={
                    getDestinationPort(bookingRequest.itinerary)?.Port.HarbourName +
                    ', ' +
                    getDestinationPort(bookingRequest.itinerary)?.Port.Land
                  }
                  label2={
                    bookingRequest.itinerary && `ETA: ${getDestinationPort(bookingRequest.itinerary)?.ArrivalDate}`
                  }
                  gutterBottom
                />
              </Grid>
            </Grid>
            {bookingRequest.statusText && (
              <Grid item md={2} xs={12}>
                <InfoBoxItem title="Status" label1={bookingRequest.statusText.toUpperCase()} gutterBottom />
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider style={{ paddingTop: '0px', paddingBottom: '0px' }} />
            </Grid>
            <Grid item md={2} xs={12}>
              <InfoBoxItem
                title={
                  bookingRequest.quoteNumber
                    ? 'Quote Number'
                    : bookingRequest.agreementNo
                    ? 'Agreement No.'
                    : 'Quote Number'
                }
                label1={bookingRequest.quoteNumber ? bookingRequest.quoteNumber : bookingRequest.agreementNo || '-'}
                gutterBottom
              />
            </Grid>
            <Grid item md={3} xs={12}>
              <InfoBoxItem title={'Customer reference'} label1={bookingRequest.customerReference || '-'} gutterBottom />
            </Grid>
            <Grid item container md={5} xs={12}>
              <Grid item xs={6}>
                <InfoBoxItem
                  title="Created On"
                  label1={bookingRequest.createdAt ? formatDate(bookingRequest.createdAt, 'dd.MM.yyyy HH:mm') : ''}
                  gutterBottom
                />
              </Grid>
              <Grid item xs={6}>
                <InfoBoxItem
                  title="Last updated"
                  label1={bookingRequest.updatedAt ? formatDistanceToNowConfigured(bookingRequest.updatedAt) : ''}
                  gutterBottom
                />
              </Grid>
            </Grid>
            {bookingRequest.createdBy && (
              <Grid item md={2} xs={12}>
                <InfoBoxItem
                  title="Created By"
                  label1={
                    <Avatar
                      name={bookingRequest.createdBy?.firstName + ' ' + bookingRequest.createdBy?.lastName}
                      title={`${bookingRequest.createdBy?.firstName + ' ' + bookingRequest.createdBy?.lastName} <${
                        bookingRequest.createdBy?.emailAddress ? bookingRequest.createdBy?.emailAddress : null
                      }>`}
                      size="40"
                      round={true}
                      style={{ paddingLeft: '9px' }}
                    />
                  }
                  gutterBottom
                />
              </Grid>
            )}
            {isDashboardUser(userRecord) &&
              bookingRequest.pinnedCommentsCount &&
              bookingRequest.pinnedCommentsCount > 0 && (
                <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                  <PinnedCommentsButton bookingRequestId={bookingRequest.id} />
                </Grid>
              )}
          </Grid>
        </Grid>
      </Grid>
    </StyledTableRow>
  );
};

const BookingsOverviewTable: React.FC<BookingsOverviewTableProps> = ({ bookingRequests }) => {
  return (
    <Table size="small" aria-label="requests">
      <TableBody>
        {bookingRequests.map(request => (
          <BookingRequestRow bookingRequest={request} />
        ))}
      </TableBody>
    </Table>
  );
};

const VesselAllocationModal: React.FC<VesselAllocationModalProps> = ({ isOpen, closeModal, vesselVoyage }) => {
  const classes = useStyles();
  const vesselVoyageString = useMemo(() => `${vesselVoyage?.VesselName} ${vesselVoyage?.VoyageNr}`, [
    vesselVoyage?.VesselName,
    vesselVoyage?.VoyageNr,
  ]);
  const vessel = useVesselWithVoyageById(vesselVoyageString);
  const allocation = useMemo(() => countAllocation(vessel), [vessel]);

  const [openConfirmed, setOpenConfirmed] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [openInProgress, setOpenInProgress] = useState(false);

  const [confirmedRequests, setConfirmedRequests] = useState<BookingRequest[] | undefined>(undefined);
  const [requestedRequests, setRequestedRequests] = useState<BookingRequest[] | undefined>(undefined);
  const [inProgressRequests, setInProgressRequests] = useState<BookingRequest[] | undefined>(undefined);

  const relevantBookingRequests = useBookingRequests(
    useCallback(
      query => {
        if (!vessel || !vessel?.vesselName || !vessel?.voyageNumber) return null;
        return query
          .where('itinerary.portOfLoading.VoyageInfo.VesselName', '==', vessel?.vesselName)
          .where('itinerary.portOfLoading.VoyageInfo.VoyageNr', '==', vessel?.voyageNumber)
          .where('statusCode', '<', BookingRequestStatusCode.ARCHIVED)
          .orderBy('statusCode', 'asc')
          .orderBy('createdAt', 'desc');
      },
      [vessel?.vesselName, vessel?.voyageNumber],
    ),
  );

  useEffect(() => {
    setConfirmedRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.CONFIRMED),
    );
    setRequestedRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.REQUESTED),
    );
    setInProgressRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.IN_PROGRESS),
    );
  }, [relevantBookingRequests]);

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
          {vessel && (
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">TEU</TableCell>
                    <TableCell align="right">TON</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell />
                    <TableCell component="th" scope="row">
                      Allocation
                    </TableCell>
                    <TableCell align="right">
                      {allocation.initial.teu !== 0 ? allocation.initial.teu : 'On Request'}
                    </TableCell>
                    <TableCell align="right">
                      {allocation.initial.weight !== 0 ? allocation.initial.weight : 'On Request'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={event => {
                          event.stopPropagation();
                          setOpenConfirmed(!openConfirmed);
                        }}
                        disabled={!confirmedRequests || confirmedRequests.length === 0}
                      >
                        {openConfirmed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      Confirmed Bookings
                    </TableCell>
                    <TableCell align="right">
                      {vessel.teuBooked || 0}{' '}
                      {vessel.teuPercent ? <PercentData percent={parseFloat(vessel.teuPercent).toFixed(1)} /> : null}
                    </TableCell>
                    <TableCell align="right">
                      {vessel.weightBooked ? parseFloat(vessel.weightBooked).toFixed(2) : 0}{' '}
                      {vessel.weightPercent ? (
                        <PercentData percent={parseFloat(vessel.weightPercent).toFixed(1)} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0, backgroundColor: '#f5f5f5' }} colSpan={4}>
                      {confirmedRequests && (
                        <Collapse in={openConfirmed} timeout="auto" unmountOnExit>
                          <BookingsOverviewTable bookingRequests={confirmedRequests} />
                        </Collapse>
                      )}
                    </TableCell>
                  </TableRow>
                  {vessel.requested && (
                    <React.Fragment>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={event => {
                              event.stopPropagation();
                              setOpenRequested(!openRequested);
                            }}
                            disabled={!requestedRequests || requestedRequests.length === 0}
                          >
                            {openRequested ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          Requested Bookings
                        </TableCell>
                        <TableCell align="right">{vessel.requested.quantity}</TableCell>
                        <TableCell align="right">
                          {vessel.requested.weight ? (vessel.requested.weight / 1000).toFixed(2) : 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ padding: 0, backgroundColor: '#f5f5f5' }} colSpan={6}>
                          {requestedRequests && (
                            <Collapse in={openRequested} timeout="auto" unmountOnExit>
                              <BookingsOverviewTable bookingRequests={requestedRequests} />
                            </Collapse>
                          )}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )}
                  {vessel.inProgress && (
                    <React.Fragment>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={event => {
                              event.stopPropagation();
                              setOpenInProgress(!openInProgress);
                            }}
                            disabled={!inProgressRequests || inProgressRequests.length === 0}
                          >
                            {openInProgress ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          In Progress Bookings
                        </TableCell>
                        <TableCell align="right">{vessel.inProgress.quantity}</TableCell>
                        <TableCell align="right">
                          {vessel.inProgress.weight ? (vessel.inProgress.weight / 1000).toFixed(2) : 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{
                            padding: 0,
                            backgroundColor: '#f5f5f5',
                          }}
                          colSpan={6}
                        >
                          {inProgressRequests && (
                            <Collapse in={openInProgress} timeout="auto" unmountOnExit>
                              <BookingsOverviewTable bookingRequests={inProgressRequests} />
                            </Collapse>
                          )}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )}
                  <TableRow>
                    <TableCell />
                    <TableCell component="th" scope="row">
                      Total
                    </TableCell>
                    <TableCell align="right">{allocation.total.teu || 0}</TableCell>
                    <TableCell align="right">{allocation.total.ton.toFixed(2) || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell />
                    <TableCell component="th" scope="row">
                      Left to Book
                    </TableCell>
                    <TableCell align="right">
                      {allocation.difference.teu !== 0 ? allocation.difference.teu : 'On Request'}
                    </TableCell>
                    <TableCell align="right">
                      {allocation.difference.ton !== 0 ? allocation.difference.ton.toFixed(2) : 'On Request'}
                    </TableCell>
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
  const classes = useStyles();

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
        <VesselAllocationModal isOpen={isOpen} closeModal={closeModal} vesselVoyage={vesselVoyage} />
      )}
    </Box>
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

interface VesselAllocationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  vesselVoyage: RouteSearchResultVoyageInfo;
}

const countAllocation = (allocation?: VesselAllocation) => {
  if (!allocation) return { initial: { teu: 0, weight: 0 }, total: { teu: 0, ton: 0 }, difference: { teu: 0, ton: 0 } };

  const initial = {
    teu: !isNaN(+allocation.teuAllocation) && +allocation.teuAllocation !== 0 ? +allocation.teuAllocation : 0,
    weight:
      !isNaN(+allocation.weightAllocation) && +allocation.weightAllocation !== 0 ? +allocation.weightAllocation : 0,
  };

  const allocationTotal = {
    teu: (allocation.inProgress?.quantity || 0) + (allocation.requested?.quantity || 0) + +(allocation.teuBooked || 0),
    ton:
      ((allocation.inProgress && allocation.inProgress.weight / 1000) || 0) +
      ((allocation.requested && allocation.requested.weight / 1000) || 0) +
      +(allocation.weightBooked || 0),
  };

  return {
    initial,
    total: allocationTotal,
    difference: {
      teu:
        !isNaN(initial.teu - allocationTotal.teu) && initial.teu !== 0
          ? +allocation.teuAllocation - allocationTotal.teu
          : 0,
      ton:
        !isNaN(initial.weight - allocationTotal.ton) && initial.weight !== 0
          ? +allocation.weightAllocation - allocationTotal.ton
          : 0,
    },
  };
};
