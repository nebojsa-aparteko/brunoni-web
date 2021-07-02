import { Quote } from '../../providers/QuoteGroupsProvider';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { BookingRequest } from '../../model/BookingRequest';
import React, { useContext, useMemo } from 'react';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import { isNil, omitBy } from 'lodash/fp';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, TextField, Typography } from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import CarrierInput from '../inputs/CarrierInput';
import getTermsForCarrier from '../../utilities/getTermsForCarrier';
import ChargeCodes from '../../contexts/ChargeCodes';
import { useClientById } from '../../hooks/useClient';
import { Controller, useFormContext } from 'react-hook-form';
import { defaultValidationRules } from '../controlledInputs/FormTextField';
import { OnlineBookingInputs } from './OnlineBookingContainer';

const ShippingInfo: React.FC<Props> = ({ quote, schedule, handleNext, bookingRequest, setBookingRequest }) => {
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const carrierName = schedule?.OriginInfo.VoyageInfo.Carrier.toLowerCase();
  const chargeCodes = useContext(ChargeCodes);
  const client = useClientById(quote?.clientId);

  const scheduleCarrier = useMemo(
    () =>
      carriers?.find(carrier => carrier.name.toLowerCase() === carrierName) ||
      carriers?.find(carrier => carrier.id.toLowerCase() === carrierName),
    [carrierName, carriers],
  );
  const originPort = useMemo(
    () =>
      schedule && ports
        ? ports?.find(port => port.id === schedule.OriginInfo.Port.ID)
        : quote
        ? quote.origin
        : undefined,
    [ports, quote, schedule],
  );
  const destinationPort = useMemo(
    () =>
      schedule && ports
        ? ports?.find(port => port.id === schedule.DestinationInfo.Port.ID)
        : quote
        ? quote.destination
        : undefined,
    [ports, quote, schedule],
  );
  const carrier = useMemo(() => (scheduleCarrier ? scheduleCarrier : quote ? quote.carrier : undefined), [
    quote,
    scheduleCarrier,
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useFormContext();

  const handleContinue = (data: OnlineBookingInputs) => {
    setBookingRequest(
      omitBy(isNil)({
        ...bookingRequest,
        origin: data.originPort,
        destination: data.destinationPort,
        carrier: data.carrier,
        quoteNumber: data.quoteNumber,
        customerReference: data.customerReference,
        client,
        schedule: schedule,
        quoteDetails: quote?.quoteDetails,
      }) as BookingRequest,
    );
    handleNext();
  };

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item sm={4} xs={12}>
        <Controller
          rules={defaultValidationRules}
          control={control}
          name="originPort"
          defaultValue={originPort}
          render={({ field: { onChange, value } }) => (
            <PortInput
              label="Origin"
              ports={ports || []}
              onChange={onChange}
              value={value}
              margin="dense"
              formError={errors.originPort}
            />
          )}
        />
      </Grid>
      <Grid item sm={4} xs={12}>
        <Controller
          rules={defaultValidationRules}
          control={control}
          name="destinationPort"
          defaultValue={destinationPort}
          render={({ field: { onChange, value } }) => (
            <PortInput
              label="Destination"
              ports={ports || []}
              onChange={onChange}
              value={value}
              margin="dense"
              formError={errors.destinationPort}
            />
          )}
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <Controller
          rules={defaultValidationRules}
          control={control}
          name="carrier"
          defaultValue={carrier}
          render={({ field: { onChange, value } }) => (
            <CarrierInput
              label="Carrier"
              carriers={carriers}
              onChange={onChange}
              value={value}
              margin="dense"
              formError={errors.carrier}
            />
          )}
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <Controller
          control={control}
          name="quoteNumber"
          defaultValue={quote?.id || ''}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Quote number (optional)"
              variant="outlined"
              fullWidth
              type="number"
              margin="dense"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <Controller
          control={control}
          name="customerReference"
          defaultValue={''}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Your reference (optional)"
              variant="outlined"
              fullWidth
              margin="dense"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Grid>
      <Grid container>
        <FormControl>
          <FormControlLabel
            control={
              <Controller
                rules={defaultValidationRules}
                control={control}
                name="acceptedTerms"
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <Checkbox color="primary" onChange={e => onChange(e.target.checked)} checked={value} />
                )}
              />
            }
            label={
              <Box display={'flex'} flexDirection={'row'} alignItems={'center'} style={{ cursor: 'default' }}>
                <Typography>
                  I accept the{' '}
                  <Button target="_blank" href={getTermsForCarrier(carrier?.id)} color={'primary'}>
                    Terms and Conditions
                  </Button>
                </Typography>
                {errors.acceptedTerms && <Typography color={'error'}>{defaultValidationRules.required}</Typography>}
              </Box>
            }
          />
        </FormControl>
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={handleSubmit(handleContinue)} disabled={!isDirty}>
          Next
        </Button>
      </Grid>
    </Grid>
  );
};

interface Props {
  quote?: Quote;
  schedule?: RouteSearchResult;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default ShippingInfo;
