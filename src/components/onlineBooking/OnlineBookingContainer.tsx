import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container as ContainerView,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Theme,
} from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import CarrierInput from '../inputs/CarrierInput';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import Port from '../../model/Port';
import Carrier from '../../model/Carrier';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { TabPanel } from '../../pages/BookingsPage';
import { isNil, omitBy } from 'lodash/fp';
import DropZone from '../DropZone';
import ContainerInput from '../inputs/ContainerInput';
import ListInput from '../inputs/ListInput';
import Container from '../../model/Container';
import ContainerDetails from '../../model/ContainerDetails';
import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import useUser from '../../hooks/useUser';
import { ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import firebase from '../../firebase';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  content: {
    width: '100%',
  },
}));

const createRequest = (bookingRequest: BookingRequest) => {
  console.log(bookingRequest);
  return firebase
    .firestore()
    .collection('booking-requests')
    .add(bookingRequest);
};

const ShippingInfo = (
  quote: Quote | undefined,
  schedule: RouteSearchResult | undefined,
  handleNext: () => void,
  bookingRequest: BookingRequest | undefined,
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>,
) => {
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const carrierName = schedule?.OriginInfo.VoyageInfo.Carrier.toLowerCase();

  const scheduleCarrier = useMemo(
    () =>
      carriers?.find(carrier => carrier.name.toLowerCase() === carrierName) ||
      carriers?.find(carrier => carrier.id.toLowerCase() === carrierName),
    [carrierName, carriers],
  );

  const [originPort, setOriginPort] = useState<Port | undefined>(
    schedule && ports ? ports?.find(port => port.id === schedule.OriginInfo.Port.ID) : quote ? quote.origin : undefined,
  );
  const [destinationPort, setDestinationPort] = useState<Port | undefined>(
    schedule && ports
      ? ports?.find(port => port.id === schedule.DestinationInfo.Port.ID)
      : quote
      ? quote.destination
      : undefined,
  );
  const [carrier, setCarrier] = useState<Carrier | undefined>(
    scheduleCarrier ? scheduleCarrier : quote ? quote.carrier : undefined,
  );
  const [customerReference, setCustomerReference] = useState<string | undefined>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleContinue = () => {
    setBookingRequest(
      omitBy(isNil)({
        ...bookingRequest,
        origin: originPort,
        destination: destinationPort,
        carrier: carrier,
        quoteNumber: quote ? quote.id : undefined,
        customerReference: customerReference,
        schedule: schedule,
      }) as BookingRequest,
    );
    handleNext();
  };

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item sm={4} xs={12}>
        <PortInput
          label="Origin"
          ports={ports || []}
          value={originPort}
          onChange={newPort => setOriginPort(newPort || undefined)}
          margin="dense"
        />
      </Grid>
      <Grid item sm={4} xs={12}>
        <PortInput
          label="Destination"
          ports={ports || []}
          value={destinationPort}
          onChange={newPort => setDestinationPort(newPort || undefined)}
          margin="dense"
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <CarrierInput
          label={'Carrier'}
          carriers={carriers}
          onChange={carrier => setCarrier(carrier || undefined)}
          value={carrier}
          margin="dense"
        />
      </Grid>
      {quote && (
        <Grid item sm={2} xs={12}>
          <TextField
            label="Quote Number"
            defaultValue={quote?.id}
            fullWidth
            type="number"
            variant="outlined"
            margin="dense"
          />
        </Grid>
      )}
      <Grid item sm={3} xs={12}>
        <TextField
          label="Customer reference (optional)"
          fullWidth
          variant="outlined"
          margin="dense"
          value={customerReference}
          onChange={event => setCustomerReference(event.target.value)}
        />
      </Grid>
      <Grid container>
        <FormControlLabel
          control={<Checkbox color="primary" value={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />}
          label="I accept Terms of Service"
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          disabled={!acceptedTerms || !(originPort && destinationPort && carrier)}
          onClick={handleContinue}
        >
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

const CargoInfo = (
  quote: Quote | undefined,
  handleNext: () => void,
  handlePrevious: () => void,
  bookingRequest: BookingRequest | undefined,
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>,
) => {
  const addButton = useRef<HTMLButtonElement>();
  const listInput = useRef<unknown>();
  const [containers, setContainers] = useState<(Container & ContainerDetails)[]>(
    quote && quote.containers
      ? quote.containers.map(container => {
          return { imo: [false], oog: [false], ...container };
        })
      : [],
  );

  const handleContinue = () => {
    const writableContainers = containers.map(container => {
      return { ...container, imo: null, oog: null };
    });
    setBookingRequest(
      omitBy(isNil)({
        ...bookingRequest,
        containers: writableContainers,
        imo: checkRequestForIMO(containers) || undefined,
        soc: checkRequestForSOC(containers) || undefined,
      }) as BookingRequest,
    );
    handleNext();
  };

  return (
    <Grid container direction="column" spacing={4} style={{ width: '100%' }}>
      <ListInput
        listRef={listInput}
        addButtonRef={addButton}
        ItemInput={ContainerInput}
        ItemInputProps={{ showLocations: true, isDetailedInput: true }}
        addText="Add Container"
        defaultItemValue={{ quantity: 1, imo: [false], oog: [false] }}
        value={containers}
        onChange={setContainers}
      />
      <Grid item>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleContinue}>
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

const checkRequestForIMO = (containers: (Container & ContainerDetails)[] | undefined) =>
  containers && containers.some((container: Container & ContainerDetails) => container.imo && container.imo[0]);

const checkRequestForSOC = (containers: (Container & ContainerDetails)[] | undefined) =>
  containers &&
  containers.some(
    (container: Container & ContainerDetails) =>
      container.containerType &&
      container.containerType?.description &&
      container.containerType?.description.includes('S.O.'),
  );

const AdditionalInfo = (
  handlePrevious: () => void,
  bookingRequest: BookingRequest | undefined,
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>,
) => {
  const [additionalInfo, setAdditionalInfo] = useState<string | undefined>();
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

  const handleFinish = () => {
    const writableRequest = {
      ...bookingRequest,
      additionalInfo: additionalInfo,
      createdAt: new Date(),
      createdBy: getShortUserData(),
      status: BookingRequestStatus.REQUESTED,
    };
    omitEmptyDeep(writableRequest);
    setBookingRequest(writableRequest as BookingRequest);
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
      <Grid container item direction="row" spacing={4} xs={12}>
        <Grid item sm={4} xs={12}>
          <TextField
            label="Special Requests or Comments"
            variant="outlined"
            margin="dense"
            rows={4}
            multiline
            fullWidth
            value={additionalInfo}
            onChange={event => setAdditionalInfo(event.target.value)}
          />
        </Grid>
        <Grid container item sm={3} xs={12} direction="column" spacing={1} style={{ margin: 4 }}>
          {bookingRequest?.soc && (
            <Grid item>
              <DropZone label="Upload Certificate" storageBasePath={'booking-requests/certificates'} internal={false} />
            </Grid>
          )}
          {bookingRequest?.imo && (
            <Grid item>
              <DropZone
                label="Upload IMO Documents"
                storageBasePath={'booking-requests/IMO-documents'}
                internal={false}
              />
            </Grid>
          )}
          <Grid item>
            <DropZone
              label="Upload Additional Documents"
              storageBasePath={'booking-requests/additional-documents'}
              internal={false}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={handlePrevious}>
          Previous
        </Button>
        <Button variant="contained" color="primary" onClick={handleFinish}>
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

const getSteps = () => ['General Information', 'Cargo Details', 'Additional Information'];

const OnlineBookingContainer = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const quoteJson = localStorage.getItem('quote');
  const [quote] = React.useState(quoteJson ? (JSON.parse(quoteJson) as Quote) : undefined);

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | undefined>();

  const scheduleJson = localStorage.getItem('schedule');
  const [schedule] = React.useState(scheduleJson ? (JSON.parse(scheduleJson) as RouteSearchResult) : undefined);

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  return (
    <ContainerView className={classes.root}>
      <Paper>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box p={3} className={classes.content}>
          <TabPanel value={activeStep} index={0}>
            {ShippingInfo(quote, schedule, handleNext, bookingRequest, setBookingRequest)}
          </TabPanel>
          <TabPanel value={activeStep} index={1}>
            {CargoInfo(quote, handleNext, handleBack, bookingRequest, setBookingRequest)}
          </TabPanel>
          <TabPanel value={activeStep} index={2}>
            {AdditionalInfo(handleBack, bookingRequest, setBookingRequest)}
          </TabPanel>
        </Box>
      </Paper>
    </ContainerView>
  );
};

export default OnlineBookingContainer;
