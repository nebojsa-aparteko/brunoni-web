import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookingRequest, BookingRequestStatusCode } from '../../model/BookingRequest';
import VesselAllocation from '../../model/VesselAllocation';
import useBookingRequests from '../../hooks/useBookingRequests';
import { BookingRequestSimplifiedRow } from './BookingRequestSimplifiedRow';
import useBookings from '../../hooks/useBookings';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import { RouteSearchResultVoyageInfo } from '../../model/route-search/RouteSearchResults';

const PercentData = ({ percent }: { percent: string }) => (
  <Box>
    <Typography style={{ color: +percent > 100 ? 'red' : 'green' }}>{`(${percent} %)`}</Typography>
  </Box>
);

const countAllocation = (allocation?: VesselAllocation) => {
  if (!allocation) return { initial: { teu: 0, weight: 0 }, total: { teu: 0, ton: 0 }, difference: { teu: 0, ton: 0 } };

  const initial = {
    teu: !isNaN(+allocation.teuAllocation) && +allocation.teuAllocation !== 0 ? +allocation.teuAllocation : 0,
    weight:
      !isNaN(+allocation.weightAllocation) && +allocation.weightAllocation !== 0 ? +allocation.weightAllocation : 0,
  };

  const allocationTotal = {
    teu: (allocation.inProgress?.quantity || 0) + (allocation.requested?.quantity || 0) + +(allocation.teuBooked || 0),
    ton:
      ((allocation.inProgress && allocation.inProgress.weight / 1000) || 0) +
      ((allocation.requested && allocation.requested.weight / 1000) || 0) +
      +(allocation.weightBooked || 0),
  };

  return {
    initial,
    total: allocationTotal,
    difference: {
      teu:
        !isNaN(initial.teu - allocationTotal.teu) && initial.teu !== 0
          ? +allocation.teuAllocation - allocationTotal.teu
          : 0,
      ton:
        !isNaN(initial.weight - allocationTotal.ton) && initial.weight !== 0
          ? +allocation.weightAllocation - allocationTotal.ton
          : 0,
    },
  };
};

const BookingsOverviewTable: React.FC<BookingsOverviewTableProps> = ({ bookings }) => {
  return (
    <Table size="small" aria-label="requests">
      <TableBody>
        {bookings.map((booking, index) => (
          <BookingRow booking={booking} key={index} />
        ))}
      </TableBody>
    </Table>
  );
};

const BookingRequestsOverviewTable: React.FC<BookingRequestsOverviewTableProps> = ({ bookingRequests }) => {
  return (
    <Table size="small" aria-label="requests">
      <TableBody>
        {bookingRequests.map((request, index) => (
          <BookingRequestSimplifiedRow bookingRequest={request} key={index} />
        ))}
      </TableBody>
    </Table>
  );
};

interface BookingsOverviewTableProps {
  bookings: Booking[];
}

interface BookingRequestsOverviewTableProps {
  bookingRequests: BookingRequest[];
}

export interface AllocationProps {
  vessel: VesselAllocation;
  vesselVoyage?: RouteSearchResultVoyageInfo;
}

const VesselAllocationTable: React.FC<AllocationProps> = ({ vessel, vesselVoyage }) => {
  const allocation = useMemo(() => countAllocation(vessel), [vessel]);

  const vesselName = useMemo(() => vesselVoyage?.VesselName, [vesselVoyage?.VesselName]);
  const voyageNumber = useMemo(() => vesselVoyage?.VoyageNr, [vesselVoyage?.VoyageNr]);

  const [openConfirmed, setOpenConfirmed] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [openInProgress, setOpenInProgress] = useState(false);

  const [requestedRequests, setRequestedRequests] = useState<BookingRequest[] | undefined>(undefined);
  const [inProgressRequests, setInProgressRequests] = useState<BookingRequest[] | undefined>(undefined);

  const relevantBookingRequests = useBookingRequests(
    useCallback(
      query => {
        const q = query;
        if (!vesselName || !voyageNumber) return undefined;
        return q
          .where('itinerary.portOfLoading.VoyageInfo.VesselName', '==', vesselName)
          .where('itinerary.portOfLoading.VoyageInfo.VoyageNr', '==', voyageNumber)
          .where('statusCode', '<=', BookingRequestStatusCode.IN_PROGRESS)
          .orderBy('statusCode', 'asc')
          .orderBy('createdAt', 'desc');
      },
      [vesselName, voyageNumber],
    ),
  );

  const relevantBookings = useBookings(
    useCallback(
      query => {
        const q = query;
        if (!vesselName || !voyageNumber) return undefined;
        return q
          .where('Vessel', '==', vesselName)
          .where('Voyage', '==', voyageNumber)
          .orderBy('BkgCreateTimeStamp', 'desc');
      },
      [vesselName, voyageNumber],
    ),
  );

  useEffect(() => {
    setRequestedRequests(
      relevantBookingRequests
        ? relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.REQUESTED)
        : [],
    );
    setInProgressRequests(
      relevantBookingRequests
        ? relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.IN_PROGRESS)
        : [],
    );
  }, [relevantBookingRequests]);

  return (
    <TableContainer>
      <Table aria-label="simple table">
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '40%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell align="right">TEU</TableCell>
            <TableCell align="right">TON</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell />
            <TableCell component="th" scope="row">
              Allocation
            </TableCell>
            <TableCell align="right">{allocation.initial.teu !== 0 ? allocation.initial.teu : 'On Request'}</TableCell>
            <TableCell align="right">
              {allocation.initial.weight !== 0 ? allocation.initial.weight : 'On Request'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={event => {
                  event.stopPropagation();
                  setOpenConfirmed(!openConfirmed);
                }}
                disabled={!relevantBookings || relevantBookings.length === 0}
              >
                {openConfirmed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
            <TableCell component="th" scope="row">
              {`Confirmed Bookings ${
                relevantBookings && relevantBookings?.length > 0 ? '(' + relevantBookings?.length + ' bookings)' : ''
              }`}
            </TableCell>
            <TableCell align="right">
              {vessel.teuBooked || 0}{' '}
              {vessel.teuPercent ? <PercentData percent={parseFloat(vessel.teuPercent).toFixed(1)} /> : null}
            </TableCell>
            <TableCell align="right">
              {vessel.weightBooked ? parseFloat(vessel.weightBooked).toFixed(2) : 0}{' '}
              {vessel.weightPercent ? <PercentData percent={parseFloat(vessel.weightPercent).toFixed(1)} /> : null}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ padding: 0 }} colSpan={4}>
              {relevantBookings && (
                <Collapse in={openConfirmed} timeout="auto" unmountOnExit>
                  <BookingsOverviewTable bookings={relevantBookings} />
                </Collapse>
              )}
            </TableCell>
          </TableRow>
          {vessel.requested && (
            <React.Fragment>
              <TableRow>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={event => {
                      event.stopPropagation();
                      setOpenRequested(!openRequested);
                    }}
                    disabled={!requestedRequests || requestedRequests.length === 0}
                  >
                    {openRequested ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                  {`Requested Bookings ${
                    requestedRequests && requestedRequests?.length > 0
                      ? '(' + requestedRequests?.length + ' requests)'
                      : ''
                  }`}
                </TableCell>
                <TableCell align="right">{vessel.requested.quantity}</TableCell>
                <TableCell align="right">
                  {vessel.requested.weight ? (vessel.requested.weight / 1000).toFixed(2) : 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                  {requestedRequests && (
                    <Collapse in={openRequested} timeout="auto" unmountOnExit>
                      <BookingRequestsOverviewTable bookingRequests={requestedRequests} />
                    </Collapse>
                  )}
                </TableCell>
              </TableRow>
            </React.Fragment>
          )}
          {vessel.inProgress && (
            <React.Fragment>
              <TableRow>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={event => {
                      event.stopPropagation();
                      setOpenInProgress(!openInProgress);
                    }}
                    disabled={!inProgressRequests || inProgressRequests.length === 0}
                  >
                    {openInProgress ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                  {`In Progress Bookings ${
                    inProgressRequests && inProgressRequests?.length > 0
                      ? '(' + inProgressRequests?.length + ' requests)'
                      : ''
                  }`}
                </TableCell>
                <TableCell align="right">{vessel.inProgress.quantity}</TableCell>
                <TableCell align="right">
                  {vessel.inProgress.weight ? (vessel.inProgress.weight / 1000).toFixed(2) : 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{
                    padding: 0,
                  }}
                  colSpan={6}
                >
                  {inProgressRequests && (
                    <Collapse in={openInProgress} timeout="auto" unmountOnExit>
                      <BookingRequestsOverviewTable bookingRequests={inProgressRequests} />
                    </Collapse>
                  )}
                </TableCell>
              </TableRow>
            </React.Fragment>
          )}
          <TableRow>
            <TableCell />
            <TableCell component="th" scope="row">
              Total
            </TableCell>
            <TableCell align="right">{allocation.total.teu || 0}</TableCell>
            <TableCell align="right">{allocation.total.ton.toFixed(2) || 0}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell component="th" scope="row">
              Left to Book
            </TableCell>
            <TableCell align="right">
              {allocation.difference.teu !== 0 ? allocation.difference.teu : 'On Request'}
            </TableCell>
            <TableCell align="right">
              {allocation.difference.ton !== 0 ? allocation.difference.ton.toFixed(2) : 'On Request'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VesselAllocationTable;
