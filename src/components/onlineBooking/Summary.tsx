import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import firebase from '../../firebase';
import React, { useCallback } from 'react';
import useUser from '../../hooks/useUser';
import { Button, Divider, Grid, makeStyles, Theme } from '@material-ui/core';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import Stepper from '@material-ui/core/Stepper';
import ItineraryItem from '../ItineraryItem';
import RouteDeadlines from '../routeSearch/RouteDeaadlines';
import RouteSummary from '../routeSearch/RouteSummary';
import InfoBoxItem from '../InfoBoxItem';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';

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

const createRequest = (bookingRequest: BookingRequest) =>
  firebase
    .firestore()
    .collection('booking-requests')
    .add(bookingRequest);

const Summary: React.FC<Props> = ({ handlePrevious, bookingRequest, setBookingRequest }) => {
  const classes = useStyles();
  const [, userRecord] = useUser();

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
    };
    omitEmptyDeep(writableRequest);
    setBookingRequest(writableRequest);
    try {
      bookingRequest &&
        createRequest(writableRequest)
          .then(() => console.log(JSON.stringify(writableRequest)))
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
              <Grid container item xs={12} title={'Containers'}>
                {bookingRequest.containers.map(container => (
                  <Grid item xs={4}>
                    <InfoBoxItem
                      title={
                        <>
                          {`${container.quantity} x ${container.containerType?.description}`}
                          {container.commodityType && ` - ${container.commodityType?.name}`}
                        </>
                      }
                      label1={
                        <>
                          {(container.pickupLocation || container.pickupDate) && ` (`}
                          {container.pickupLocation &&
                            `${container.pickupLocation?.city}, ${container.pickupLocation?.countryCode}`}
                          {container.pickupDate &&
                            ` - ${formatDateSafe(container.pickupDate as Date, DateFormats.LONG)}`}
                          {(container.pickupLocation || container.pickupDate) && `)`}
                        </>
                      }
                      label2={
                        <>
                          {container.containerType &&
                            container.containerType?.description &&
                            container.containerType?.description.includes('S.O.') &&
                            'Container is shipper owned'}
                          {container.imo &&
                            container.imo.length > 0 &&
                            container.imo.map(
                              (imoItem: IMO) =>
                                `(${'IMO Class: ' + imoItem.IMOClass} - ${'PG Number: ' +
                                  imoItem.PGNumber} - ${'UN Number: ' + imoItem.UNNumber} )`,
                            )}
                          {container.oog &&
                            container.oog.length > 0 &&
                            container.oog.map(
                              (oogItem: OOG) =>
                                `(${'Length: ' + oogItem.length} - ${'Width: ' + oogItem.width} - ${'Height: ' +
                                  oogItem.height} - ${'Weight: ' + oogItem.weight})`,
                            )}
                        </>
                      }
                      gutterBottom
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </>
          )}
          <Grid container item xs={8}>
            {/*<Container maxWidth={"sm"}>*/}
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
          Finish
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
