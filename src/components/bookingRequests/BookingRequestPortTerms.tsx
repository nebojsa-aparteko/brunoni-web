import TableBody from '@material-ui/core/TableBody';
import {
  Box,
  createStyles,
  FormControlLabel,
  makeStyles,
  Radio,
  RadioGroup,
  Table,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import set from 'lodash/fp/set';
import { useClientById } from '../../hooks/useClient';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { TableRowData } from './BookingRequestSummary';
import Client from '../../model/Client';
import { BookingRequest, BookingRequestLabels, VGMSubmittedBy } from '../../model/BookingRequest';
import isString from '../../utilities/isString';

const useStyles = makeStyles(() =>
  createStyles({
    portTermsTable: {
      width: '100%',
    },
  }),
);

export const getRepresentationFromClient = (client: Client) =>
  client.name + (client.name && client.city && ', ') + client.city;

const ClientRepresentation: React.FC<{ client: Client | string }> = ({ client }) => {
  const tempClient = useClientById(isString(client) ? client : '') || client;
  const [clientRepresentation, setClientRepresentation] = useState(
    tempClient && getRepresentationFromClient(tempClient),
  );

  useEffect(() => {
    setClientRepresentation(tempClient && getRepresentationFromClient(tempClient));
  }, [tempClient]);

  return <>{clientRepresentation}</>;
};

const BookingRequestPortTerms: React.FC<Props> = () => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookingRequest(prevState => set('vgmSubmittedBy', event.target.value)(prevState as BookingRequest));
  };

  const handleAdminLabel = () => {
    switch (process.env.REACT_APP_BRAND) {
      case 'brunoni':
        return 'Brunoni';
      case 'allmarine':
        return 'Allmarine';
      default:
        return 'Admin';
    }
  };

  return (
    <Table size="small" aria-label="a dense table" className={classes.portTermsTable}>
      <TableBody>
        {/*TODO change port to be taken from portOfLoading instead of OriginInfo*/}
        {bookingRequest?.schedule?.OriginInfo.Port.PortAgent && (
          <React.Fragment>
            <TableRowData label={'Liner Port Agent'} content={bookingRequest?.schedule?.OriginInfo.Port.PortAgent} />
            <TableRowData
              label={'FOB Delivery By'}
              content={bookingRequest?.schedule?.OriginInfo.Port.PortAgent.split('<br/>')[0]}
            />
          </React.Fragment>
        )}
        <TableRowData
          label={BookingRequestLabels.vgmSubmittedBy}
          content={
            editing ? (
              <RadioGroup
                name="vgmSubmission"
                value={bookingRequest?.vgmSubmittedBy}
                onChange={handleChange}
                style={{ display: 'flex', flexDirection: 'row' }}
              >
                <FormControlLabel value={VGMSubmittedBy.CLIENT} control={<Radio />} label="Client" />
                <Box display={'flex'} alignItems={'center'}>
                  <FormControlLabel
                    value={VGMSubmittedBy.ADMIN}
                    control={<Radio />}
                    disabled={!bookingRequest?.assignedUser}
                    label={handleAdminLabel()}
                  />
                  {!bookingRequest?.assignedUser ? (
                    <Typography color={'error'}>Please assign Watcher (Assigned agent) first</Typography>
                  ) : null}
                </Box>
              </RadioGroup>
            ) : bookingRequest?.vgmSubmittedBy === VGMSubmittedBy.CLIENT && bookingRequest.client ? (
              <ClientRepresentation client={bookingRequest.client} />
            ) : bookingRequest?.vgmSubmittedBy === VGMSubmittedBy.ADMIN &&
              bookingRequest.assignedUser?.alphacomClientId ? (
              <ClientRepresentation client={bookingRequest.assignedUser?.alphacomClientId!} />
            ) : (
              'Undefined'
            )
          }
        />
      </TableBody>
    </Table>
  );
};

interface Props {}

export default BookingRequestPortTerms;
