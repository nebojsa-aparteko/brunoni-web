import React, { useCallback } from 'react';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { Box, Divider, Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import useModal from '../../hooks/useModal';
import { RouteSearchResultVoyageInfo } from '../../model/route-search/RouteSearchResults';
import { BookingRequest } from '../../model/BookingRequest';
import InfoBoxItem from '../InfoBoxItem';
import {
  getDestinationPort,
  getOriginPort,
  showDeliveryRef,
  StyledTableRow,
} from '../bookingRequests/BookingRequestsTable';
import { useHistory } from 'react-router';
import useUser from '../../hooks/useUser';
import inttraLogo from '../../assets/inttra-vector-logo.svg';
import { isDashboardUser } from '../../model/UserRecord';
import Avatar from 'react-avatar';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import formatDate from 'date-fns/format';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import PinnedCommentsButton from '../bookingRequests/PinnedCommentsButton';
import theme from '../../theme';
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

interface BookingRequestRowProps {
  bookingRequest: BookingRequest;
  preventDefaultClick?: boolean;
}

export const BookingRequestRow: React.FC<BookingRequestRowProps> = ({ bookingRequest, preventDefaultClick }) => {
  const classes = useVesselAllocationStyles();
  const history = useHistory();

  const [, userRecord] = useUser();

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        const win: Window | null = window.open(`/booking-requests/${id}`, '_blank');
        win && win.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, preventDefaultClick],
  );

  return (
    <StyledTableRow
      tabIndex={-1}
      onClick={() => handleRowClick(bookingRequest.id!)}
      style={{
        position: 'relative',
        display: 'flex',
        backgroundColor: bookingRequest.isUnread ? 'rgba(161,213,255,0.25)' : 'white',
        border: !bookingRequest.assignedUser ? '2px solid #00b0ff' : `2px solid ${theme.palette.grey[400]}`,
        marginBottom: theme.spacing(1),
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

const VesselAllocationButton: React.FC<VesselAllocationButtonProps> = ({ vesselVoyage }) => {
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
        <VesselAllocationModal isOpen={isOpen} closeModal={closeModal} vesselVoyage={vesselVoyage} />
      )}
    </Box>
  );
};

export default VesselAllocationButton;

interface VesselAllocationButtonProps {
  vesselVoyage?: RouteSearchResultVoyageInfo;
}
