import TableBody from '@material-ui/core/TableBody';
import { createStyles, makeStyles, Table, Theme } from '@material-ui/core';
import React from 'react';
import { TableRowData } from '../bookings/ContainerDetails';
import { BookingRequest } from '../../model/BookingRequest';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    portTermsTable: {
      width: '100%',
    },
  }),
);

const BookingRequestPortTerms: React.FC<Props> = ({ bookingRequest }) => {
  const classes = useStyles();

  return (
    <Table size="small" aria-label="a dense table" className={classes.portTermsTable}>
      <colgroup>
        <col style={{ width: '14%' }} />
        <col style={{ width: '86%' }} />
      </colgroup>
      <TableBody>
        {bookingRequest.schedule?.OriginInfo.Port.PortAgent && (
          <TableRowData label={'Liner Port Agent'} content={bookingRequest.schedule?.OriginInfo.Port.PortAgent} />
        )}
        {/*<TableRowData label={'FOB Delivery By'} content={portTerms.FOBDeliveryBy} />*/}
        {/*<TableRowData label={'VGM Submission By'} content={portTerms.VGMSubmByTxt} />*/}
      </TableBody>
    </Table>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestPortTerms;
