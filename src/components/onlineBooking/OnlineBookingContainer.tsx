import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container as ContainerView,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Theme,
} from '@material-ui/core';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { TabPanel } from '../../pages/BookingsPage';
import { BookingRequest } from '../../model/BookingRequest';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import ShippingInfo from './ShippingInfo';
import CargoInfo from './CargoInfo';
import AdditionalInfo from './AdditionalInfo';
import Summary from './Summary';
import { FormProvider, useForm } from 'react-hook-form';
import { set } from 'lodash/fp';
import AddIcon from '@material-ui/icons/Add';
import BookingUploadDialog from './BookingUploadDialog';
import {
  getNumberOfContainersAndSets,
  getQuantity,
  isQuantityAutomatic,
} from '../bookingRequests/BookingRequestFreightDetails';
import ContainerTypes from '../../contexts/ContainerTypes';
import ContainerType from '../../model/ContainerType';

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

const getUpdatedFreightDetails = (
  bookingRequest: BookingRequest,
  containersAndSets: number[],
  containerTypeNames: string[] | undefined,
) => {
  return bookingRequest && bookingRequest.freightDetails
    ? bookingRequest.freightDetails.map(freightDetail =>
        set(
          'Anz',
          freightDetail.Unit && bookingRequest && bookingRequest.containers
            ? getQuantity(
                bookingRequest?.containers,
                freightDetail.Unit,
                containersAndSets,
                isQuantityAutomatic(freightDetail.Unit, containerTypeNames) || false,
              ) || freightDetail.Anz
            : freightDetail.Anz,
        )(freightDetail),
      )
    : undefined;
};

const getSteps = () => ['General Information', 'Cargo Details', 'Additional Information', 'Summary'];

const OnlineBookingContainer = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const methods = useForm();
  const containerTypes = useContext(ContainerTypes) as ContainerType[];

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const quoteJson = localStorage.getItem('quote');
  const [quote] = React.useState(quoteJson ? (JSON.parse(quoteJson) as Quote) : undefined);

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | undefined>();
  const [containerTypeNames, setContainerTypeNames] = useState(
    containerTypes ? containerTypes.map(containerType => containerType.name) : undefined,
  );

  const scheduleJson = localStorage.getItem('schedule');
  const [schedule] = React.useState(scheduleJson ? (JSON.parse(scheduleJson) as RouteSearchResult) : undefined);

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  useEffect(() => {
    const newContainerTypeNames = containerTypes ? containerTypes.map(containerType => containerType.name) : undefined;
    setContainerTypeNames(newContainerTypeNames);
  }, [containerTypes]);

  useEffect(() => {
    const updatedFreightDetails =
      bookingRequest &&
      getUpdatedFreightDetails(bookingRequest, getNumberOfContainersAndSets(bookingRequest), containerTypeNames);
    bookingRequest &&
      updatedFreightDetails &&
      setBookingRequest(set('freightDetails', updatedFreightDetails)(bookingRequest));
  }, [bookingRequest?.containers]);

  return (
    <>
      <FormProvider {...methods}>
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
                <ShippingInfo
                  quote={quote}
                  schedule={schedule}
                  handleNext={handleNext}
                  bookingRequest={bookingRequest}
                  setBookingRequest={setBookingRequest}
                />
              </TabPanel>
              <TabPanel value={activeStep} index={1}>
                <CargoInfo
                  quote={quote}
                  handlePrevious={handleBack}
                  handleNext={handleNext}
                  bookingRequest={bookingRequest}
                  setBookingRequest={setBookingRequest}
                />
              </TabPanel>
              <TabPanel value={activeStep} index={2}>
                <AdditionalInfo
                  handlePrevious={handleBack}
                  handleNext={handleNext}
                  bookingRequest={bookingRequest}
                  setBookingRequest={setBookingRequest}
                />
              </TabPanel>
              <TabPanel value={activeStep} index={3}>
                <Summary
                  handlePrevious={handleBack}
                  handleNext={handleNext}
                  bookingRequest={bookingRequest}
                  setBookingRequest={setBookingRequest}
                />
              </TabPanel>
            </Box>
          </Paper>
          <Button onClick={() => setIsDialogOpen(true)} color="primary" variant="contained" startIcon={<AddIcon />}>
            Upload HTML booking files
          </Button>
        </ContainerView>
      </FormProvider>
      {isDialogOpen && <BookingUploadDialog isOpen={isDialogOpen} handleClose={handleDialogClose} />}
    </>
  );
};

export default OnlineBookingContainer;
