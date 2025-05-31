import React, { useCallback, useState } from 'react';
import {
  Box,
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
import Carrier from '../../model/Carrier';
import Port from '../../model/Port';

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

const steps = ['General Information', 'Cargo Details', 'Additional Information', 'Summary'];

const OnlineBookingContainer = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const methods = useForm<OnlineBookingInputs>();

  const [quote] = React.useState(() => {
    const quoteJson = localStorage.getItem('quote');
    return quoteJson ? (JSON.parse(quoteJson) as Quote) : undefined;
  });

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | undefined>();
  const [files, setFiles] = useState<BookingReqFiles>({
    additional: [],
    imo: [],
    certificate: [],
  });

  const [schedule] = React.useState(() => {
    const scheduleJson = localStorage.getItem('schedule');
    return scheduleJson ? (JSON.parse(scheduleJson) as RouteSearchResult) : undefined;
  });

  const handleNext = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }, []);

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
                  files={files}
                  setFiles={setFiles}
                />
              </TabPanel>
              <TabPanel value={activeStep} index={3}>
                <Summary
                  handlePrevious={handleBack}
                  handleNext={handleNext}
                  bookingRequest={bookingRequest}
                  files={files}
                  setBookingRequest={setBookingRequest}
                />
              </TabPanel>
            </Box>
          </Paper>
          {/*{activeStep === 0 && isDashboardUser(userRecord) && (*/}
          {/*  <Button onClick={openModal} color="primary" variant="contained" startIcon={<AddIcon />}>*/}
          {/*    Upload HTML booking files*/}
          {/*  </Button>*/}
          {/*)}*/}
        </ContainerView>
      </FormProvider>
    </>
  );
};

export interface OnlineBookingInputs {
  customerReference: string;
  quoteNumber: string;
  carrier: Carrier;
  originPort: Port;
  destinationPort: Port;
  acceptedTerms: boolean;
}

export interface BookingReqFiles {
  additional: File[];
  imo: File[];
  certificate: File[];
}

export default OnlineBookingContainer;
