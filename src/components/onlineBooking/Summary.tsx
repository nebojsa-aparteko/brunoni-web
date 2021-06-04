import { BookingRequest, BookingRequestStatus, VGMSubmittedBy } from '../../model/BookingRequest';
import React, { useCallback, useMemo } from 'react';
import useUser from '../../hooks/useUser';
import { Button, Divider, Grid, makeStyles, Theme } from '@material-ui/core';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { ActivityLogUserData, ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import Stepper from '@material-ui/core/Stepper';
import ItineraryItem from '../ItineraryItem';
import RouteDeadlines from '../routeSearch/RouteDeaadlines';
import RouteSummary from '../routeSearch/RouteSummary';
import ContainersList from './ContainersList';
import { useHistory } from 'react-router';
import firebase from 'firebase';
import { format } from 'date-fns';
import useSaveFiles from '../../hooks/useSaveFiles';
import { saveFilesToFirestore } from '../bookings/InternalStorage';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import { BookingReqFiles } from './OnlineBookingContainer';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
  carrierAvatar: {
    width: '.75em',
    height: '.75em',
    marginRight: theme.spacing(1),
  },
  deadlines: {
    marginBottom: theme.spacing(2),
  },
  stepper: {
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
}));

export const createRequest = async (bookingRequest: BookingRequest) => {
  const autoIncrementId = await getBookingRequestId();
  const generatedId = `${autoIncrementId}`.padStart(4, '0');
  const id = `req-${format(new Date(), 'yyyyMM')}${generatedId}`;
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set({
      id,
      ...bookingRequest,
    });
  return id;
};

export const getBookingRequestId = async () => {
  let counter = 0;
  const path = format(new Date(), 'yyyy-MM');
  await firebase
    .database()
    .ref(`/booking-request-ids/${path}`)
    .transaction(value => {
      counter = value || 1;
      return +value + 1;
    });

  return counter;
};

const Summary: React.FC<Props> = ({ handlePrevious, bookingRequest, setBookingRequest, files }) => {
  const classes = useStyles();
  const history = useHistory();
  const [, userRecord] = useUser();
  const [, dispatch] = useGlobalAppState();

  const getShortUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const storageBasePath = useMemo((): string => {
    return [`bookings-requests-documents-internal`, bookingRequest?.id].join('/');
  }, [bookingRequest]);

  const { saveFiles } = useSaveFiles(storageBasePath);

  const handleCreateRequest = () => {
    const writableRequest = {
      ...bookingRequest,
      createdAt: new Date(),
      createdBy: getShortUserData(),
      status: BookingRequestStatus.REQUESTED,
      vgmSubmittedBy: VGMSubmittedBy.CLIENT,
      archived: false,
    } as BookingRequest;
    omitEmptyDeep(writableRequest);
    setBookingRequest(writableRequest);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      bookingRequest &&
        createRequest(writableRequest)
          .then(async docReference => {
            try {
              const documents = (await saveFiles([
                ...files.additional,
                ...files.certificate,
                ...files.imo,
              ])) as ChecklistItemValueDocument[];
              const values = documents.map(
                item =>
                  ({
                    uploadedBy: userRecord,
                    uploadedAt: new Date(),
                    name: item.name,
                    url: item.url,
                    storedName: item.storedName,
                  } as ChecklistItemValueDocument),
              );
              values.map(value => saveFilesToFirestore('bookings-requests', docReference, value));
            } catch (e) {
              return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to upload file!' });
            } finally {
              history.push(`/booking-requests/${docReference}`);
            }
          })
          .catch(error => {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
            console.error(error);
          })
          .finally(() => {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
          });
    } catch (error) {
      console.error('useFirestoreCollection threw an error', error);
      return null;
    }
  };

  return (
    <Grid container direction="column" spacing={4}>
      {bookingRequest && bookingRequest?.schedule && (
        <Grid container item direction="row" spacing={4} xs={12}>
          <Grid container item xs={8} title={'General Information'}>
            <RouteSummary route={bookingRequest?.schedule} />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {bookingRequest.containers && (
            <>
              <ContainersList containers={bookingRequest?.containers} />
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </>
          )}
          <Grid container item xs={8}>
            <Grid item container xs={12} spacing={2} className={classes.deadlines}>
              <RouteDeadlines route={bookingRequest.schedule} />
            </Grid>
            <Grid item xs={12}>
              <Stepper orientation="vertical" className={classes.stepper}>
                {bookingRequest?.schedule!.OriginInfo && (
                  <ItineraryItem noLine={false} itineraryItem={bookingRequest?.schedule!.OriginInfo} />
                )}
                {bookingRequest?.schedule!.IntermediatePortInfos.map((intermediatePortInfo, i) => (
                  <ItineraryItem key={i} noLine={false} itineraryItem={intermediatePortInfo} />
                ))}
                {bookingRequest?.schedule!.DestinationInfo && (
                  <ItineraryItem noLine={true} itineraryItem={bookingRequest?.schedule!.DestinationInfo} />
                )}
              </Stepper>
            </Grid>
            {/*</Container>*/}
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleCreateRequest}>
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  files: BookingReqFiles;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default Summary;
