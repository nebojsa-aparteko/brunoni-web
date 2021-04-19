import TableBody from '@material-ui/core/TableBody';
import { createStyles, makeStyles, Table } from '@material-ui/core';
import React from 'react';
import { TableRowData } from '../bookings/ContainerDetails';
import { BookingRequest } from '../../model/BookingRequest';
import { useClientById } from '../../hooks/useClient';

const useStyles = makeStyles(() =>
  createStyles({
    portTermsTable: {
      width: '100%',
    },
  }),
);

const BookingRequestPortTerms: React.FC<Props> = ({ bookingRequest }) => {
  const classes = useStyles();
  const client = useClientById(bookingRequest.createdBy.alphacomClientId);

  return (
    <Table size="small" aria-label="a dense table" className={classes.portTermsTable}>
      <colgroup>
        <col style={{ width: '14%' }} />
        <col style={{ width: '86%' }} />
      </colgroup>
      <TableBody>
        {bookingRequest.schedule?.OriginInfo.Port.PortAgent && (
          <React.Fragment>
            <TableRowData label={'Liner Port Agent'} content={bookingRequest.schedule?.OriginInfo.Port.PortAgent} />
            <TableRowData
              label={'FOB Delivery By'}
              content={bookingRequest.schedule?.OriginInfo.Port.PortAgent.split('<br/>')[0]}
            />
          </React.Fragment>
        )}
        {client && <TableRowData label={'VGM Submission By'} content={client.name + ', ' + client.city} />}
      </TableBody>
    </Table>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestPortTerms;
