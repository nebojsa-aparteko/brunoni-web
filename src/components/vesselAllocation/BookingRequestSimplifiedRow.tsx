import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import {
  getDestinationPort,
  getOriginPort,
  showDeliveryRef,
  StyledTableRow,
} from '../bookingRequests/BookingRequestsTable';
import { Box, Divider, Grid, Typography } from '@material-ui/core';
import inttraLogo from '../../assets/inttra-vector-logo.svg';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import formatDate from 'date-fns/format';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import Avatar from 'react-avatar';
import { isDashboardUser } from '../../model/UserRecord';
import PinnedCommentsButton from '../bookingRequests/PinnedCommentsButton';
import { useVesselAllocationStyles } from './VesselAllocationButton';
import { BookingRequest } from '../../model/BookingRequest';
import theme from '../../theme';

interface BookingRequestRowProps {
  bookingRequest: BookingRequest;
  preventDefaultClick?: boolean;
}

export const BookingRequestSimplifiedRow: React.FC<BookingRequestRowProps> = ({
  bookingRequest,
  preventDefaultClick,
}) => {
  const classes = useVesselAllocationStyles();
  const navigate = useNavigate();

  const [, userRecord] = useUser();

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        const win: Window | null = window.open(`/booking-requests/${id}`, '_blank');
        win && win.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, preventDefaultClick],
  );

  return (
    <StyledTableRow
      tabIndex={-1}
      onClick={() => handleRowClick(bookingRequest.id!)}
      style={{
        position: 'relative',
        display: 'flex',
        backgroundColor: bookingRequest.isUnread ? 'rgba(161,213,255,0.25)' : 'white',
        border: !bookingRequest.assignedUser
          ? '2px solid #00b0ff'
          : `2px solid ${theme.palette.grey[400]}`,
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
            {bookingRequest.intraRefNumber && (
              <img src={inttraLogo} alt="inttra logo" className={classes.inttraLogo} />
            )}
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
                    ? (
                        bookingRequest.createdBy.firstName +
                        ' ' +
                        bookingRequest.createdBy.lastName
                      ).toUpperCase()
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
                  label2={
                    bookingRequest.itinerary &&
                    `ETS: ${getOriginPort(bookingRequest.itinerary)?.DepartureDate}`
                  }
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
                    bookingRequest.itinerary &&
                    `ETA: ${getDestinationPort(bookingRequest.itinerary)?.ArrivalDate}`
                  }
                  gutterBottom
                />
              </Grid>
            </Grid>
            {bookingRequest.statusText && (
              <Grid item md={2} xs={12}>
                <InfoBoxItem
                  title="Status"
                  label1={bookingRequest.statusText.toUpperCase()}
                  gutterBottom
                />
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
                label1={
                  bookingRequest.quoteNumber
                    ? bookingRequest.quoteNumber
                    : bookingRequest.agreementNo || '-'
                }
                gutterBottom
              />
            </Grid>
            <Grid item md={3} xs={12}>
              <InfoBoxItem
                title={'Customer reference'}
                label1={bookingRequest.customerReference || '-'}
                gutterBottom
              />
            </Grid>
            <Grid item container md={5} xs={12}>
              <Grid item xs={6}>
                <InfoBoxItem
                  title="Created On"
                  label1={
                    bookingRequest.createdAt
                      ? formatDate(bookingRequest.createdAt, 'dd.MM.yyyy HH:mm')
                      : ''
                  }
                  gutterBottom
                />
              </Grid>
              <Grid item xs={6}>
                <InfoBoxItem
                  title="Last updated"
                  label1={
                    bookingRequest.updatedAt
                      ? formatDistanceToNowConfigured(bookingRequest.updatedAt)
                      : ''
                  }
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
                      name={
                        bookingRequest.createdBy?.firstName +
                        ' ' +
                        bookingRequest.createdBy?.lastName
                      }
                      title={`${bookingRequest.createdBy?.firstName + ' ' + bookingRequest.createdBy?.lastName} <${
                        bookingRequest.createdBy?.emailAddress
                          ? bookingRequest.createdBy?.emailAddress
                          : null
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
