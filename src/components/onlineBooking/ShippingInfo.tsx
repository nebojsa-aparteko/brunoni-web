import { Quote } from '../../providers/QuoteGroupsProvider';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { BookingRequest } from '../../model/BookingRequest';
import React, { useContext, useMemo } from 'react';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import { isNil, omitBy, set } from 'lodash/fp';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import CarrierInput from '../inputs/CarrierInput';
import getTermsForCarrier from '../../utilities/getTermsForCarrier';
import { useClientById } from '../../hooks/useClient';
import { Controller, useFormContext } from 'react-hook-form';
import { defaultValidationRules } from '../controlledInputs/FormTextField';
import { OnlineBookingInputs } from './OnlineBookingContainer';
import { getQuoteDocRef } from './MissingFields';
import useModal from '../../hooks/useModal';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import { getRelatedQuotes, QuotePickerModal } from '../bookingRequests/BookingRequestFreightDetails';
import useNormalizeQuote from '../../hooks/useNormalizedQuote';
import { takeQuoteDetails } from './Summary';
import ChargeCodes from '../../contexts/ChargeCodes';

const ShippingInfo: React.FC<Props> = ({ quote, schedule, handleNext, bookingRequest, setBookingRequest }) => {
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const carrierName = schedule?.OriginInfo.VoyageInfo.Carrier.toLowerCase();
  const client = useClientById(quote?.clientId);
  const { isOpen, closeModal, openModal } = useModal();
  const chargeCodes = useContext(ChargeCodes);
  const normalize = useNormalizeQuote();

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
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  const updateBookingRequest = (data: OnlineBookingInputs) => {
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
        quoteDetails: quote?.quoteDetails || bookingRequest?.quoteDetails,
      }) as BookingRequest,
    );
  };

  const showGetQuote = () => {
    const watched = ['originPort', 'destinationPort', 'carrier'];
    const res = watch(watched);
    return res.every(e => !isNil(e) && e !== '') && !watch('quoteNumber');
  };

  const shouldGetQuote = (data: OnlineBookingInputs): boolean => {
    return (
      !!data.quoteNumber && data.quoteNumber !== '' && data.quoteNumber !== bookingRequest?.quoteNumber?.toString()
    );
  };

  const getQuote = async (data: OnlineBookingInputs) => {
    const quoteRef = await getQuoteDocRef(data.quoteNumber);
    if (quoteRef.exists) {
      const normalizedQuote = normalize(quoteRef.data()) as Quote;
      setBookingRequest((prevState: any) => set('containers', normalizedQuote.containers)(prevState as BookingRequest));
      setBookingRequest((prevState: any) => set('quoteNumber', normalizedQuote.id)(prevState as BookingRequest));
      setBookingRequest((prevState: any) =>
        set('quoteDetails', normalizedQuote.quoteDetails)(prevState as BookingRequest),
      );
    }
  };

  const handleContinue = async (data: OnlineBookingInputs) => {
    updateBookingRequest(data);
    if (shouldGetQuote(data)) {
      await getQuote(data);
    }
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
        <Box display={'flex'} alignItems={'center'}>
          {showGetQuote() && (
            <Tooltip title={'Load quote'} placement={'left'}>
              <IconButton
                onClick={async () => {
                  await updateBookingRequest(getValues() as OnlineBookingInputs);
                  openModal();
                }}
              >
                <ImportContactsIcon />
              </IconButton>
            </Tooltip>
          )}
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
        </Box>
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit(handleContinue)}
          disabled={!watch('acceptedTerms')}
        >
          Next
        </Button>
      </Grid>
      {isOpen && (
        <QuotePickerModal
          isOpen={isOpen}
          handleClose={closeModal}
          onlineBooking={true}
          setBookingRequest={setBookingRequest}
          // @ts-ignore
          fetchQuotes={() => getRelatedQuotes(bookingRequest!)}
        />
      )}
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
