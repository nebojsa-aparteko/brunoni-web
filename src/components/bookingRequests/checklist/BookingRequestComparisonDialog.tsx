import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useEffect } from 'react';
import { ChecklistItemValueDocument } from '../../bookings/checklist/ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import BookingRequestViewMainContent, { remark } from '../BookingRequestViewMainContent';
import { renderDocument } from '../../bookings/documentApproval/ComparisonDialogContent';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestProvider, {
  useBookingRequestContext,
} from '../../../providers/BookingRequestProvider';
import Page from '../../bookings/Page';
import { getBookingRequestTitle } from '../BookingRequestView';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
import BookingRequestSummary from '../BookingRequestSummary';
import ContainerDetails from '../../onlineBooking/ContainerDetails';
import BookingRequestPortTerms from '../BookingRequestPortTerms';
import BookingRequestClosings from '../BookingRequestClosings';
import BookingRequestSpecialRemarks from '../BookingRequestSpecialRemarks';
import BookingRequestFreightDetails from '../BookingRequestFreightDetails';
import theme from '../../../theme';
import { isDashboardUser } from '../../../model/UserRecord';
import useUser from '../../../hooks/useUser';
import EditButton from '../../EditButton';
import useBookingRequest from '../../../hooks/useBookingRequest';

const useStyles = makeStyles(() => ({
  dialogPaper: {
    minHeight: '100vh',
    maxHeight: '100vh',
    minWidth: '100vw',
    maxWidth: '100vw',
  },
  dialogTitleBar: {
    height: '48px',
  },
  fileNumber: {
    alignSelf: 'baseline',
    margin: theme.spacing(2),
    marginBottom: '0px',
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogContent: {
    display: 'flex',
    flexFlow: 'column',
  },
  bookingViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    overflow: 'scroll',
  },
  remark: {
    whiteSpace: 'pre-wrap',
    marginTop: 8,
  },
}));

const BookingRequestRepresentation: React.FC<BookingRequestRepresentationProps> = ({
  bookingRequest,
  isPrintWithCost,
  showWarningMessage,
}) => {
  const classes = useStyles();

  const [bookingRequestState, setBookingRequestState] = useBookingRequestContext();

  useEffect(() => {
    bookingRequest && setBookingRequestState(bookingRequest);
  }, [bookingRequest]);

  return bookingRequestState ? (
    <Page title={getBookingRequestTitle(bookingRequestState)}>
      <SimpleExpansionPanel label={'Booking Request Summary'} defaultExpanded={true}>
        <BookingRequestSummary editing={false} />
      </SimpleExpansionPanel>
      <SimpleExpansionPanel label={'Cargo Details'} defaultExpanded={true}>
        {bookingRequestState.containers && (
          <>
            <Box marginTop="2em" marginBottom="2em">
              <Divider />
            </Box>
            <ContainerDetails
              containers={bookingRequestState.containers}
              bookingRequest={bookingRequestState}
              setBookingRequest={setBookingRequestState}
              editing={false}
            />
          </>
        )}
      </SimpleExpansionPanel>
      <SimpleExpansionPanel
        label={'Port Terms, Closings And Special Remarks'}
        defaultExpanded={true}
      >
        <Box flex={1} display="flex" flexDirection="column">
          <BookingRequestPortTerms />

          <BookingRequestClosings />

          <BookingRequestSpecialRemarks />
        </Box>
      </SimpleExpansionPanel>

      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>
      <BookingRequestFreightDetails
        freightDetails={bookingRequestState.freightDetails}
        showWarningMessage={showWarningMessage}
      />
      <Typography variant="body2" className={classes.remark}>
        {remark}
      </Typography>
    </Page>
  ) : null;
};

interface BookingRequestRepresentationProps {
  bookingRequest: BookingRequest;
  isPrintWithCost: boolean;
  showWarningMessage?: boolean;
}

interface ContentProps {
  document?: ChecklistItemValueDocument;
  secondBookingRequest?: BookingRequest;
}

const ComparisonDialogContent = ({ document, secondBookingRequest }: ContentProps) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      spacing={1}
      className={classes.dialogContent}
      style={{ flex: 1, minHeight: 0, padding: 16, paddingLeft: 22 }}
    >
      <Grid item md style={{ display: 'flex', overflow: 'hidden' }}>
        <Grid
          container
          direction="row"
          spacing={1}
          style={{ flex: 1, overflow: 'hidden', width: '100%', minHeight: 0 }}
        >
          <Grid item xs={12} md={6} className={classes.bookingViewContainer}>
            <Box component={Paper} display={'column'}>
              <Typography variant={'h3'} style={{ margin: '.5em' }}>
                Current Booking Request
              </Typography>
              <BookingRequestViewMainContent isPrintWithCost={false} />
            </Box>
          </Grid>

          {document && (
            <Grid item xs={12} md={6} style={{ display: 'flex', minHeight: 0, height: '100%' }}>
              <Box component={Paper} display={'column'}>
                <Typography variant={'h3'} style={{ margin: '.5em' }}>
                  File
                </Typography>
                {renderDocument(
                  document,
                  document?.name.split('.').pop()?.toLowerCase(),
                  'rightDocumentContainer',
                )}
              </Box>
            </Grid>
          )}
          {!document && secondBookingRequest && (
            <Grid item xs={12} md={6} className={classes.bookingViewContainer}>
              <BookingRequestProvider>
                <Box component={Paper} display={'column'}>
                  <Typography variant={'h3'} style={{ margin: '.5em' }}>
                    Initial Booking Request
                  </Typography>
                  <BookingRequestRepresentation
                    bookingRequest={secondBookingRequest}
                    isPrintWithCost={false}
                  />
                </Box>
              </BookingRequestProvider>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const BookingRequestComparisonDialog: React.FC<Props> = ({
  document,
  secondBookingRequest,
  isOpen,
  bookingRequestId,
  handleClose,
}) => {
  const classes = useStyles();
  const userRecord = useUser()[1];
  const [bookingRequestState, setBookingRequestState, editing] = useBookingRequestContext();
  const { br } = useBookingRequest(bookingRequestId);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="xl"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle
        disableTypography
        id="dialog-title-check-list"
        className={classes.dialogTitleBar}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}
      >
        <Box display={'flex'} alignItems={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography
              variant="h4"
              className={classes.fileNumber}
            >{`File No: ${bookingRequestId}`}</Typography>
            {editing && isDashboardUser(userRecord) ? (
              <TextField
                defaultValue={''}
                label="Agreement No."
                margin="dense"
                variant="outlined"
                value={bookingRequestState.agreementNo}
                onChange={e =>
                  setBookingRequestState(prev => ({
                    ...prev,
                    agreementNo: e.target.value,
                  }))
                }
                autoFocus
                className={classes.fileNumber}
              />
            ) : (
              <Typography variant={'h4'} className={classes.fileNumber}>
                {bookingRequestState.agreementNo !== ''
                  ? 'Agreement No. ' + bookingRequestState.agreementNo
                  : 'Agreement No. [To be assigned]'}
              </Typography>
            )}
          </Box>
          <Box display={'flex'} alignItems={'center'}>
            <EditButton bookingRequest={br} />
          </Box>
        </Box>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ComparisonDialogContent document={document} secondBookingRequest={secondBookingRequest} />
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestComparisonDialog;

interface Props {
  document?: ChecklistItemValueDocument;
  secondBookingRequest?: BookingRequest;
  isOpen: boolean;
  handleClose: () => void;
  bookingRequestId: string;
}
