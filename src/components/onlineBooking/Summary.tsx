import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import React, { useCallback } from 'react';
import useUser from '../../hooks/useUser';
import { Button, Divider, Grid, makeStyles, Theme } from '@material-ui/core';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import Stepper from '@material-ui/core/Stepper';
import ItineraryItem from '../ItineraryItem';
import RouteDeadlines from '../routeSearch/RouteDeaadlines';
import RouteSummary from '../routeSearch/RouteSummary';
import ContainersList from './ContainersList';
import { useHistory } from 'react-router';
import firebase from 'firebase';
import { format } from 'date-fns';
import { useClientById } from '../../hooks/useClient';

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

const Summary: React.FC<Props> = ({ handlePrevious, bookingRequest, setBookingRequest }) => {
  const classes = useStyles();
  const history = useHistory();
  const [, userRecord] = useUser();
  const client = useClientById(userRecord?.alphacomClientId);

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

  const handleCreateRequest = () => {
    const writableRequest = {
      ...bookingRequest,
      createdAt: new Date(),
      createdBy: getShortUserData(),
      status: BookingRequestStatus.REQUESTED,
      vgmSubmittedBy: client ? client.name + (client.name && client.city && ', ') + client.city : undefined,
      archived: false,
    };
    omitEmptyDeep(writableRequest);
    setBookingRequest(writableRequest);
    try {
      bookingRequest &&
        createRequest(writableRequest)
          .then(docReference => history.push(`/booking-requests/${docReference}`))
          .catch(error => console.log(error));
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
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default Summary;
