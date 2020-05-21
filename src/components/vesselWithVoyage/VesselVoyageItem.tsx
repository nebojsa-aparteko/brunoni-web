import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Paper,
  Typography,
} from '@material-ui/core';
import theme from '../../theme';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import { normalizeBooking } from '../../providers/BookingsProvider';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { chunk } from 'lodash/fp';

const CHUNK_SIZE = 10;

const SeparatorArrow = () => (
  <Box mx={4} display="flex" flexDirection="column" alignItems="center">
    →
  </Box>
);

const getBookings = (bookings: string[]) =>
  firebase
    .firestore()
    .collection('bookings')
    .where('ERP-BkgRef', 'in', bookings)
    .get();

const findCarrierId = (items: any[]) => {
  const obj = items.find(u => u.erpCarrierId && u.erpServiceId);
  return obj ? `${obj.erpCarrierId} ${obj.erpServiceId}` : undefined;
};

const VesselVoyageItem: React.FC<Props> = ({ vessel, items, expanded, handleExpand }) => {
  const entries = useMemo(() => Object.entries(items), [items]);
  // const bookingsIds = useMemo(
  //   () =>
  //     chunk(CHUNK_SIZE)(
  //       Object.entries(items).reduce(
  //         (previousValue, currentValue) => previousValue.concat(currentValue[1].map((v: any) => v.bookingId)),
  //         [] as string[],
  //       ),
  //     ),
  //   [items],
  // );
  // const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);
  // useEffect(() => {
  //   (async () => {
  //     if (expanded === vessel) {
  //       setBookings(
  //         (await getBookings(bookingsIds[(bookings?.length || 0) / CHUNK_SIZE])).docs.map(bkg =>
  //           normalizeBooking(bkg.data()),
  //         ),
  //       );
  //     }
  //   })();
  // }, [vessel, expanded, bookingsIds]);

  // const handleSeeMore = async () => {
  //   const bkgs = (await getBookings(bookingsIds[(bookings?.length || 0) / CHUNK_SIZE])).docs.map(bkg =>
  //     normalizeBooking(bkg.data()),
  //   );
  //   setBookings(prevState => (prevState || []).concat(bkgs));
  // };

  return (
    // <ExpansionPanel
    //   style={{ padding: 4, marginBottom: 4 }}
    //   expanded={expanded === vessel}
    //   onChange={handleExpand(vessel)}
    // >
    //   <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
    //     <Box display="flex" my={2}>
    //       <Box display="flex" alignItems="center">
    //         <DirectionsBoatIcon style={{ marginRight: theme.spacing(1) }} />
    //         <Box display="flex" flexDirection="column">
    //           <Typography style={{ width: theme.spacing(30) }}>{vessel}</Typography>
    //           {entries[0][1].erpCarrierId && entries[0][1].erpServiceId && (
    //             <Typography
    //               style={{ width: theme.spacing(30) }}
    //             >{`${entries[0][1].erpCarrierId} ${entries[0][1].erpServiceId}`}</Typography>
    //           )}
    //         </Box>
    //       </Box>
    //       {entries.map(([pol, items]: any, index: number) => (
    //         <Fragment key={`${vessel}-${pol}`}>
    //           {index > 0 && <SeparatorArrow />}
    //           <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
    //             <Typography variant="subtitle1">{pol}</Typography>
    //             <Typography variant="body1">{`ETS ${formatDateSafe(items?.[0].ets, DateFormats.LONG)}`}</Typography>
    //           </Box>
    //         </Fragment>
    //       ))}
    //       {entries[entries.length - 1][1][0].pod && (
    //         <Fragment>
    //           <SeparatorArrow />
    //           <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
    //             <Typography variant="subtitle1">{entries[entries.length - 1][1][0].pod}</Typography>
    //             <Typography variant="body1">{`ETA ${formatDateSafe(
    //               entries[entries.length - 1][1][0].eta,
    //               DateFormats.LONG,
    //             )}`}</Typography>
    //           </Box>
    //         </Fragment>
    //       )}
    //     </Box>
    //   </ExpansionPanelSummary>
    //   <ExpansionPanelDetails>
    //     <Box display="flex" flexDirection="column">
    //       {bookings ? (
    //         <Box display="flex" flexDirection="column">
    //           {bookings.map((booking, index) => (
    //             <BookingRow booking={booking} key={`${booking['ERP-BkgRef']}-${index}`} />
    //           ))}
    //           {bookings && (bookingsIds.length - 1) * CHUNK_SIZE > bookings.length && (
    //             <Button color="primary" onClick={handleSeeMore}>
    //               See more...
    //             </Button>
    //           )}
    //         </Box>
    //       ) : (
    //         <ChartsCircularProgress />
    //       )}
    //     </Box>
    //   </ExpansionPanelDetails>
    // </ExpansionPanel>
    <Paper style={{ padding: 4, marginBottom: 4 }}>
      <Box display="flex" my={2}>
        <Box display="flex" alignItems="center">
          <DirectionsBoatIcon style={{ marginRight: theme.spacing(1) }} />
          <Box display="flex" flexDirection="column">
            <Typography style={{ width: theme.spacing(30) }}>{vessel}</Typography>
            {findCarrierId(entries[0][1]) && (
              <Typography style={{ width: theme.spacing(30) }}>{findCarrierId(entries[0][1])}</Typography>
            )}
          </Box>
        </Box>
        {entries.map(([pol, items]: any, index: number) => (
          <Fragment key={`${vessel}-${pol}`}>
            {index > 0 && <SeparatorArrow />}
            <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
              <Typography variant="subtitle1">{pol}</Typography>
              <Typography variant="body1">{`ETS ${formatDateSafe(items?.[0].ets, DateFormats.LONG)}`}</Typography>
            </Box>
          </Fragment>
        ))}
        {entries[entries.length - 1][1][0].pod && (
          <Fragment>
            <SeparatorArrow />
            <Box display="flex" flexDirection="column" mx={2} style={{ width: theme.spacing(15) }}>
              <Typography variant="subtitle1">{entries[entries.length - 1][1][0].pod}</Typography>
              <Typography variant="body1">{`ETA ${formatDateSafe(
                entries[entries.length - 1][1][0].eta,
                DateFormats.LONG,
              )}`}</Typography>
            </Box>
          </Fragment>
        )}
      </Box>
    </Paper>
  );
};

export default VesselVoyageItem;

interface Props {
  vessel: string;
  items: any[];
  expanded: string | false;
  handleExpand: (name: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => void;
}
