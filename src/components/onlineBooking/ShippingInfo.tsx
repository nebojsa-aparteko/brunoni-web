import { Quote, QuoteDetail } from '../../providers/QuoteGroupsProvider';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { BookingRequest, FreightDetail } from '../../model/BookingRequest';
import React, { useContext, useMemo } from 'react';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import { flow, get, isNil, omitBy, set } from 'lodash/fp';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, TextField, Typography } from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import CarrierInput from '../inputs/CarrierInput';
import getTermsForCarrier from '../../utilities/getTermsForCarrier';
import { FreightDetailGroup } from '../../model/Booking';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import { useClientById } from '../../hooks/useClient';
import sortBy from 'lodash/sortBy';
import { Controller, useFormContext } from 'react-hook-form';
import { defaultValidationRules } from '../controlledInputs/FormTextField';
import { OnlineBookingInputs } from './OnlineBookingContainer';
import Ctg from '../../model/Container';
import ContainerDetails from '../../model/ContainerDetails';

export const getRelevantFreightDetails = (quoteDetails: QuoteDetail[], chargeCodes: ChargeCode[] | undefined) => {
  const filteredQuoteDetails = quoteDetails.filter(
    (detail: QuoteDetail) =>
      ![
        'VGM manual submission',
        'Umbuchungsgebühr',
        'Stornierungsgebühr',
        'Zertifikat',
        'Rebooking Fee',
        'Cancellation Fee',
        'House-Bill of Lading',
        'Certificate',
      ].includes(detail.Description) && !['Inkl.', 'incl.'].includes(detail.Currency),
  );
  return sortBy(filteredQuoteDetails, (detail: QuoteDetail) => +detail.Pos).map((quoteDetail, index) => {
    const chargeCode =
      (quoteDetail.ChargeID &&
        chargeCodes &&
        (chargeCodes.find(code => code.chargeCodeId === quoteDetail.ChargeID) as ChargeCode | undefined)) ||
      undefined;
    return omitBy(isNil)({
      Anz: 1,
      SeqNr: index + 1,
      Txt: quoteDetail.Description,
      Currency: quoteDetail.Currency,
      UnitValue: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
      Unit: quoteDetail.CostUnit,
      Group: FreightDetailGroup.EXTERNAL,
      Total: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
      Internal1: chargeCode && chargeCode.internal1 === 'TRUE' ? true : undefined,
    }) as FreightDetail;
  });
};

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
    const containers = calculateContainers(bookingRequest?.containers);

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
        freightDetails:
          quote && quote.quoteDetails
            ? flow(
                getRelevantFreightDetailsFromQuote,
                updateFreightDetails.bind(this, containers),
                transformFreightDetails.bind(this, containers),
              )(quote?.quoteDetails || [])
            : undefined,
      }) as BookingRequest,
    );
    handleNext();
  };

  const calculateContainers = (containers?: (Ctg & ContainerDetails)[]) =>
    containers?.reduce(
      (previousValue, currentValue) => {
        const lastValue = get(currentValue.containerType?.name || '')(previousValue) || 0;
        const lastTEU = get('TEU')(previousValue) || 0;
        const lastTotal = get('Total')(previousValue) || 0;
        if (currentValue.containerType?.name)
          return flow(
            set(currentValue.containerType.name, lastValue + +currentValue.quantity),
            set(
              'TEU',
              lastTEU +
                (currentValue.containerType?.id
                  ? (currentValue.containerType.id.startsWith('2') ? 1 : 2) * currentValue.quantity
                  : 0),
            ),
            set('Total', lastTotal + +currentValue.quantity),
          )(previousValue);
        return previousValue;
      },
      { TEU: 0, Total: 0 },
    ) || { TEU: 0, Total: 0 };
  const isRelevantFreight = (
    freightDetail: QuoteDetail,
    containers: { TEU: number; Total: number; [key: string]: number },
  ) => {
    if (!freightDetail.CostUnit?.includes("'")) return true;
    return Object.entries(containers).some(
      ([key, value]) => value > 0 && [`PRO ${key}`, `PER ${key}`].includes(freightDetail.CostUnit?.toUpperCase() || ''),
    );
  };

  const getRelevantFreightDetailsFromQuote = (quoteDetails: QuoteDetail[]) =>
    quoteDetails.filter(
      detail =>
        ![
          'VGM manual submission',
          'Umbuchungsgebühr',
          'Stornierungsgebühr',
          'Zertifikat',
          'Rebooking Fee',
          'Cancellation Fee',
          'House-Bill of Lading',
          'Certificate',
        ].includes(detail.Description) && !['Inkl.', 'incl.'].includes(detail.Currency),
    );

  const transformFreightDetails = (
    containers: { TEU: number; Total: number; [key: string]: number },
    freightDetails: QuoteDetail[],
  ): FreightDetail[] =>
    freightDetails?.map((quoteDetail, index) =>
      omitBy(isNil)({
        Anz: getQuantity(containers, quoteDetail.CostUnit),
        SeqNr: index + 1,
        Txt: quoteDetail.Description,
        Currency: quoteDetail.Currency,
        UnitValue: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
        Unit: quoteDetail.CostUnit,
        Group: FreightDetailGroup.EXTERNAL,
        Total: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
        // Internal1: chargeCode && chargeCode.internal1 === 'TRUE' ? true : undefined,
      }),
    ) as FreightDetail[];

  const getQuantity = (containers: { TEU: number; Total: number; [key: string]: number }, costUnit?: string) => {
    switch (costUnit) {
      case 'PRO TEU':
      case 'PER TEU':
        return containers.TEU;
      case 'PER CONTAINER':
      case 'PRO CONTAINER':
        return containers.Total;
      default:
        console.log(containers[costUnit?.split(' ')?.pop() || '']);
        return containers[costUnit?.split(' ')?.pop() || ''] || 1;
    }
  };

  const updateFreightDetails = (
    containers: { TEU: number; Total: number; [key: string]: number },
    freightDetails: QuoteDetail[],
  ) => {
    // get relevant
    // recalculate
    // sort
    // reduce it by unnecessary freights and sort
    console.log(containers);
    return freightDetails.reduce((previousValue, currentValue) => {
      if (isRelevantFreight(currentValue, containers)) {
        return previousValue.concat(currentValue);
      } else {
        return previousValue;
      }
    }, [] as QuoteDetail[]);
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
