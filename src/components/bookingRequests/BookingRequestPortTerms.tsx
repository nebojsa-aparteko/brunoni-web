import TableBody from '@material-ui/core/TableBody';
import { createStyles, FormControlLabel, makeStyles, Radio, RadioGroup, Table } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import set from 'lodash/fp/set';
import { useClientById } from '../../hooks/useClient';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { TableRowData, userRepresentation } from './BookingRequestSummary';
import Client from '../../model/Client';
import { UserRecordMin } from '../../model/UserRecord';

const useStyles = makeStyles(() =>
  createStyles({
    portTermsTable: {
      width: '100%',
    },
  }),
);

const getClientRepresentation = (client: Client) => {
  return client.name + (client.name && client.city && ', ') + client.city;
};

const BookingRequestPortTerms: React.FC<Props> = () => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const client = useClientById(bookingRequest?.createdBy?.alphacomClientId);
  const [selectedVGMSubmission, setSelectedVGMSubmission] = useState<string | UserRecordMin | undefined>(
    bookingRequest?.vgmSubmittedBy
      ? typeof bookingRequest.vgmSubmittedBy === 'string'
        ? 'client'
        : 'admin'
      : 'client',
  );
  const [VGMSubmissionValue, setVGMSubmissionValue] = useState<string | JSX.Element | undefined>(
    bookingRequest?.vgmSubmittedBy
      ? typeof bookingRequest.vgmSubmittedBy === 'string'
        ? bookingRequest.vgmSubmittedBy
        : userRepresentation(bookingRequest?.vgmSubmittedBy)
      : client && getClientRepresentation(client),
  );

  useEffect(() => {
    setSelectedVGMSubmission(
      bookingRequest?.vgmSubmittedBy
        ? typeof bookingRequest.vgmSubmittedBy === 'string'
          ? 'client'
          : 'admin'
        : 'client',
    );
    setVGMSubmissionValue(
      bookingRequest?.vgmSubmittedBy
        ? typeof bookingRequest.vgmSubmittedBy === 'string'
          ? bookingRequest.vgmSubmittedBy
          : userRepresentation(bookingRequest?.vgmSubmittedBy)
        : client && getClientRepresentation(client),
    );
  }, [bookingRequest?.vgmSubmittedBy]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVGMSubmission(event.target.value);
    setVGMSubmissionValue(
      event.target.value === 'client'
        ? client && getClientRepresentation(client)
        : userRepresentation(bookingRequest?.assignedUser),
    );
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(
        set(
          'vgmSubmittedBy',
          event.target.value === 'client' ? client && getClientRepresentation(client) : bookingRequest?.assignedUser,
        )(bookingRequest),
      );
  };

  return (
    <Table size="small" aria-label="a dense table" className={classes.portTermsTable}>
      <colgroup>
        <col style={{ width: '14%' }} />
        <col style={{ width: '86%' }} />
      </colgroup>
      <TableBody>
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
          label={'VGM Submission By'}
          content={
            editing ? (
              <RadioGroup
                name="vgmSubmission"
                value={selectedVGMSubmission}
                onChange={handleChange}
                style={{ display: 'flex', flexDirection: 'row' }}
              >
                <FormControlLabel value="client" control={<Radio />} label="Client" />
                <FormControlLabel
                  value="admin"
                  control={<Radio />}
                  label={
                    process.env.REACT_APP_BRAND === 'brunoni'
                      ? 'Brunoni'
                      : process.env.REACT_APP_BRAND === 'allmarine'
                      ? 'Allmarine'
                      : 'Admin'
                  }
                />
              </RadioGroup>
            ) : (
              VGMSubmissionValue || 'Undefined'
            )
          }
        />
      </TableBody>
    </Table>
  );
};

interface Props {}

export default BookingRequestPortTerms;
