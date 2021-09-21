import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import inttraLogo from '../../assets/inttra-vector-logo.svg';
import {
  Box,
  Card,
  Checkbox,
  Container as MUIContainer,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import formatDate from 'date-fns/format';
import theme from '../../theme';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { withStyles } from '@material-ui/styles';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../model/BookingRequest';
import Avatar from 'react-avatar';
import { useHistory } from 'react-router';
import CloseIcon from '@material-ui/icons/Close';
import BookingRequestChecklistContent from './checklist/BookingRequestChecklistContent';
import { ActivityLogProvider } from '../bookings/checklist/ActivityLogContext';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import { isDashboardUser } from '../../model/UserRecord';
import VesselAllocationButton from '../VesselAllocationButton';
import { getVoyageInfo } from './BookingRequestView';
import useUser from '../../hooks/useUser';
import PinnedCommentsButton from './PinnedCommentsButton';
import TagsPreviewList from '../tags/TagsPreviewList';
import ActingAs from '../../contexts/ActingAs';
import Tags from '../../contexts/Tags';
import { ItineraryItem } from '../../model/route-search/RouteSearchResults';

const useStyles = makeStyles(() => ({
  button: {
    position: 'relative',
  },
  progressButton: {
    position: 'absolute',
  },
  tableRowHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  progress: {
    width: '100%',
    backgroundColor: 'white',
    border: '1px solid #ccc',
  },
  progressBar: {
    width: '0%',
    height: '20px',
    backgroundColor: 'green',
  },
  avatarCell: {
    textAlign: 'center',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    display: 'block',
  },
  textEmphasized: {
    textTransform: 'uppercase',
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  inttraLogo: {
    width: '4em',
    marginRight: '10px',
  },
  checkListBackdrop: {
    zIndex: 1,
  },
  dialogBody: {
    width: theme.spacing(100),
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
  },
  actionBarGridItem: {
    marginRight: 0,
    textAlign: 'right',
  },
  divider: {
    marginTop: theme.spacing(2),
  },
  card: {
    marginTop: '2em',
    marginLeft: '1px',
    marginRight: '1px',
    marginBottom: '1px',
  },
  statusContainer: {
    backgroundColor: 'rgb(43,132,215)',
    paddingLeft: '5px',
    paddingRight: '5px',
    width: 'fit-content',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
}));

interface BookingRequestRowProps {
  bookingRequest: BookingRequest;
  isAdmin?: boolean;
  preventDefaultClick?: boolean;
  selectedRequests: string[];
  onSelectRequest: (bookingRequestId: string) => void;
  onProgressClick?: any;
}

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      cursor: 'pointer',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      '&:hover': {
        backgroundColor: 'rgba(161,213,255,0.20) !important',
      },
      '&:focus': {
        outline: 'none',
      },
      '&:nth-of-type(even)': {
        backgroundColor: theme.palette.background.default,
      },
    },
  }),
)(Box);

interface ProgressDialogProps {
  isOpen: boolean;
  bookingRequest: BookingRequest;
  handleClose: any;
}

interface ShipmentProgressProps {
  bookingRequest: BookingRequest;
}

export const BookingRequestProgress: React.FC<ShipmentProgressProps> = ({ bookingRequest }) => {
  const classes = useStyles();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  const { checklistItemCount, checklistCheckedCount } = bookingRequest;
  const { checklistItemCountCustomer, checklistCheckedCountCustomer } = bookingRequest;

  const getProgress = () => {
    let bar: string;
    let count: string;
    if (isAdmin) {
      bar = `${((checklistCheckedCount || 0) / (checklistItemCount || 1)) * 100}%`;
      count = `${checklistCheckedCount || 0}/${checklistItemCount || 1}`;
    } else {
      bar = `${((checklistCheckedCountCustomer || 0) / (checklistItemCountCustomer || 1)) * 100}%`;
      count = `${checklistCheckedCountCustomer || 0}/${checklistItemCountCustomer || 1}`;
    }
    return [bar, count];
  };

  return (
    <div>
      <div className={classes.progress}>
        <div className={classes.progressBar} role="progressbar" style={{ width: getProgress()[0] }} />
      </div>
      <Typography variant="subtitle2">{getProgress()[1]}</Typography>
    </div>
  );
};

export const BookingRequestProgressDialog: React.FC<ProgressDialogProps> = ({
  isOpen,
  handleClose,
  bookingRequest,
}) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <span className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{bookingRequest?.carrier?.name.toUpperCase()}</Typography>
          {bookingRequest && bookingRequest.blNumber ? (
            <Typography variant="h6">BL Number: {bookingRequest.blNumber}</Typography>
          ) : null}
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <BookingRequestChecklistContent bookingRequest={bookingRequest} isCommentIconHidden={true} />
        </DialogContent>
      </span>
    </Dialog>
  );
};

export const BookingRequestRow: React.FC<BookingRequestRowProps> = ({
  isAdmin,
  bookingRequest,
  preventDefaultClick,
  selectedRequests,
  onSelectRequest,
  onProgressClick,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const availableTags = useContext(Tags);
  const [tags, setTags] = useState(
    availableTags &&
      availableTags.filter(tag => bookingRequest.assignedTags && bookingRequest.assignedTags.includes(tag.id)),
  );

  const [, userRecord] = useUser();

  const showDeliveryRef = () => {
    if (!bookingRequest.containers || !bookingRequest.containers.some(c => c.deliveryReference)) return null;
    return (
      <Box display={'flex'} alignItems={'flex-end'} mr={'auto'} ml={'1.5em'}>
        <Typography style={{ marginRight: '.5em' }} variant={'body2'}>
          {bookingRequest.containers.length > 1 ? 'Delivery Refs.' : 'Delivery Ref.'}
        </Typography>
        {bookingRequest.containers?.map((c, i) => (
          <Typography key={i} variant={'body2'} style={{ marginRight: '.2em' }}>
            {i === bookingRequest.containers!.length - 1 ? c.deliveryReference : c.deliveryReference + ' / '}
          </Typography>
        ))}
      </Box>
    );
  };

  useEffect(
    () =>
      setTags(
        availableTags &&
          availableTags.filter(tag => bookingRequest.assignedTags && bookingRequest.assignedTags.includes(tag.id)),
      ),
    [availableTags, bookingRequest.assignedTags],
  );

  const handleRowClick = useCallback(
    (id: string) => {
      if (!preventDefaultClick) {
        history.push(`/booking-requests/${id}`);
      }
    },
    [history, preventDefaultClick],
  );

  const getOriginPort = () => {
    return (bookingRequest.itinerary?.placeOfReceipt
      ? bookingRequest.itinerary.placeOfReceipt
      : bookingRequest.itinerary?.portOfLoading && bookingRequest.itinerary.portOfLoading) as ItineraryItem | undefined;
  };

  const getDestinationPort = () => {
    return (bookingRequest.itinerary?.finalDestinationPort
      ? bookingRequest.itinerary.finalDestinationPort
      : bookingRequest.itinerary?.portOfDischarge && bookingRequest.itinerary.portOfDischarge) as
      | ItineraryItem
      | undefined;
  };

  return (
    <StyledTableRow
      tabIndex={-1}
      onClick={() => handleRowClick(bookingRequest.id!)}
      style={{
        position: 'relative',
        display: 'flex',
        backgroundColor: bookingRequest.isUnread ? 'rgba(161,213,255,0.25)' : undefined,
        border: !bookingRequest.assignedUser && '2px solid #00b0ff',
        borderRadius: !bookingRequest.assignedUser && '7px',
      }}
    >
      <Box style={{ position: 'absolute', right: 28, left: 'auto' }}>
        <TagsPreviewList tags={tags} />
      </Box>
      <Checkbox
        checked={bookingRequest.id ? selectedRequests.includes(bookingRequest.id) : false}
        onClick={event => {
          event.stopPropagation();
          bookingRequest.id && onSelectRequest(bookingRequest.id);
        }}
        style={{ margin: 'auto' }}
      />
      <Grid container item spacing={2} xs={12} style={{ paddingTop: '10px', paddingLeft: '12px' }}>
        <Grid item lg={12} xs={12}>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <span className={classes.tableRowHeader}>
              <Typography variant="h5">Request No. {bookingRequest.id}</Typography>
            </span>
            {showDeliveryRef()}
            {bookingRequest.intraRefNumber && <img src={inttraLogo} alt="inttra logo" className={classes.inttraLogo} />}
          </Box>
        </Grid>
        <Grid item lg={12} xs={12}>
          <Grid container spacing={1}>
            <Grid item md={2} xs={12}>
              <InfoBoxItem
                title="Carrier"
                label1={
                  bookingRequest && bookingRequest.carrier && bookingRequest.carrier.name
                    ? bookingRequest.carrier?.name.toUpperCase()
                    : ''
                }
                gutterBottom
              />
            </Grid>
            <Grid item md={3} xs={12}>
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
            {bookingRequest.vessel && (
              <Grid item container md={3} xs={12} direction={'row'}>
                <Grid item>
                  <InfoBoxItem
                    title="Vessel"
                    label1={bookingRequest.vessel ? bookingRequest.vessel.toUpperCase() : ''}
                    label2={bookingRequest.voyage ? bookingRequest.voyage.toUpperCase() : ''}
                    gutterBottom
                  />
                </Grid>
                {isDashboardUser(userRecord) && (
                  <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                    <VesselAllocationButton vesselVoyage={getVoyageInfo(bookingRequest.schedule)} />
                  </Grid>
                )}
              </Grid>
            )}
            {bookingRequest.statusText && (
              <Grid item md={2} xs={12}>
                <InfoBoxItem title="Status" label1={bookingRequest.statusText.toUpperCase()} gutterBottom />
              </Grid>
            )}
            {bookingRequest.createdBy && (
              <Grid item md={1} xs={12}>
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
            <Grid item md={1} xs={12}>
              <InfoBoxItem
                title="Progress"
                label1={
                  <Box id="bookingProgressBkgTable" onClick={onProgressClick} style={{ width: '64px' }}>
                    <BookingRequestProgress bookingRequest={bookingRequest} />
                  </Box>
                }
                gutterBottom
              />
            </Grid>
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
              <InfoBoxItem
                title={isAdmin ? 'Customer reference' : 'Reference'}
                label1={bookingRequest.customerReference || '-'}
                gutterBottom
              />
            </Grid>
            <Grid item container md={3} xs={12}>
              <Grid item xs={6}>
                <InfoBoxItem
                  IconComponent={ChevronRightIcon}
                  title="Origin"
                  label1={getOriginPort()?.Port.HarbourName + ', ' + getOriginPort()?.Port.Land}
                  label2={bookingRequest.itinerary && `ETS: ${getOriginPort()?.DepartureDate}`}
                  gutterBottom
                />
              </Grid>
              <Grid item xs={6}>
                <InfoBoxItem
                  IconComponent={LastPageIcon}
                  title="Destination"
                  label1={getDestinationPort()?.Port.HarbourName + ', ' + getDestinationPort()?.Port.Land}
                  label2={bookingRequest.itinerary && `ETA: ${getDestinationPort()?.ArrivalDate}`}
                  gutterBottom
                />
              </Grid>
            </Grid>
            <Grid item md={2} xs={12}>
              <InfoBoxItem
                title="Created On"
                label1={bookingRequest.createdAt ? formatDate(bookingRequest.createdAt, 'dd.MM.yyyy HH:mm') : ''}
                gutterBottom
              />
            </Grid>
            <Grid item md={1} xs={12}>
              <InfoBoxItem
                title="Last updated"
                label1={bookingRequest.updatedAt ? formatDistanceToNowConfigured(bookingRequest.updatedAt) : ''}
                gutterBottom
              />
            </Grid>
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

const BookingRequestsTable: React.FC<BookingRequestsTableProps> = ({
  bookingRequests,
  isAdmin,
  selectedRequests,
  onSelectRequest,
}) => {
  const classes = useStyles();
  const [dialogData, setDialogData] = useState<BookingRequest | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<unknown>, bookingRequest: BookingRequest) => {
      event.stopPropagation();
      setIsDialogOpen(true);
      setDialogData(bookingRequest);
    },
    [setIsDialogOpen, setDialogData],
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  return (
    <Fragment>
      {!bookingRequests ? (
        <MUIContainer maxWidth="md">
          <Paper>
            <ChartsCircularProgress />
          </Paper>
        </MUIContainer>
      ) : (
        bookingRequests.map(bookingRequest => (
          <Card id="bookingSummaryBkgTable" className={classes.card} key={bookingRequest.id}>
            <BookingRequestRow
              isAdmin={isAdmin}
              bookingRequest={bookingRequest}
              selectedRequests={selectedRequests}
              onSelectRequest={onSelectRequest}
              onProgressClick={(event: React.MouseEvent<unknown>) => handleProgressClick(event, bookingRequest)}
            />
          </Card>
        ))
      )}
      {isDialogOpen && dialogData && (
        <ActivityLogProvider>
          <BookingRequestProgressDialog
            isOpen={isDialogOpen}
            handleClose={handleDialogClose}
            bookingRequest={dialogData}
          />
        </ActivityLogProvider>
      )}
    </Fragment>
  );
};

interface BookingRequestsTableProps {
  bookingRequests: BookingRequest[] | undefined;
  isAdmin?: boolean;
  selectedRequests: string[];
  onSelectRequest: (bookingRequestId: string) => void;
}

export default BookingRequestsTable;
