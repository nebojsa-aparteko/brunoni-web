import { Quote, QuoteDetail } from '../../providers/QuoteGroupsProvider';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { BookingRequest } from '../../model/BookingRequest';
import React, { useContext, useMemo, useState } from 'react';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import Port from '../../model/Port';
import Carrier from '../../model/Carrier';
import { isNil, omitBy } from 'lodash/fp';
import { Button, Checkbox, FormControlLabel, Grid, TextField } from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import CarrierInput from '../inputs/CarrierInput';

const ShippingInfo: React.FC<Props> = ({ quote, schedule, handleNext, bookingRequest, setBookingRequest }) => {
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
        freightDetails:
          quote && quote.quoteDetails
            ? quote?.quoteDetails.filter(
                (detail: QuoteDetail) =>
                  !['VGM manual submission', 'Umbuchungsgebühr', 'Stornierungsgebühr', 'Zertifikat'].includes(
                    detail.Description,
                  ) && !detail.Currency.includes('Inkl.'),
              )
            : undefined,
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

interface Props {
  quote?: Quote;
  schedule?: RouteSearchResult;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default ShippingInfo;
