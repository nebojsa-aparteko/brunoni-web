import React, { useCallback, useMemo, useState } from 'react';
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
import AddIcon from '@material-ui/icons/Add';
import BookingUploadDialog from './BookingUploadDialog';
import { isDashboardUser } from '../../model/UserRecord';
import useUser from '../../hooks/useUser';
import useModal from '../../hooks/useModal';

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
  const methods = useForm();
  const [, userRecord] = useUser();
  const { closeModal, isOpen, openModal } = useModal();
  const [quote] = React.useState(() => {
    const quoteJson = localStorage.getItem('quote');
    return quoteJson ? (JSON.parse(quoteJson) as Quote) : undefined;
  });

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | undefined>();

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
          {isDashboardUser(userRecord) && (
            <Button onClick={openModal} color="primary" variant="contained" startIcon={<AddIcon />}>
              Upload HTML booking files
            </Button>
          )}
        </ContainerView>
      </FormProvider>
      {isOpen && <BookingUploadDialog isOpen={isOpen} handleClose={closeModal} />}
    </>
  );
};

export default OnlineBookingContainer;
