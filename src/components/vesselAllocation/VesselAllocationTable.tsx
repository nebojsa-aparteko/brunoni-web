import {
  Box,
  Collapse,
  IconButton,
  Paper,
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
import { BookingRequestRow } from './VesselAllocationButton';
import useBookingRequests from '../../hooks/useBookingRequests';

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

const BookingsOverviewTable: React.FC<BookingsOverviewTableProps> = ({ bookingRequests }) => {
  return (
    <Table size="small" aria-label="requests">
      <TableBody>
        {bookingRequests.map(request => (
          <BookingRequestRow bookingRequest={request} />
        ))}
      </TableBody>
    </Table>
  );
};

interface BookingsOverviewTableProps {
  bookingRequests: BookingRequest[];
}

export interface AllocationProps {
  vessel: VesselAllocation;
}

const VesselAllocationTable: React.FC<AllocationProps> = ({ vessel }) => {
  const allocation = useMemo(() => countAllocation(vessel), [vessel]);

  const [openConfirmed, setOpenConfirmed] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [openInProgress, setOpenInProgress] = useState(false);

  const [confirmedRequests, setConfirmedRequests] = useState<BookingRequest[] | undefined>(undefined);
  const [requestedRequests, setRequestedRequests] = useState<BookingRequest[] | undefined>(undefined);
  const [inProgressRequests, setInProgressRequests] = useState<BookingRequest[] | undefined>(undefined);

  const relevantBookingRequests = useBookingRequests(
    useCallback(
      query => {
        if (!vessel || !vessel?.vesselName || !vessel?.voyageNumber) return null;
        return query
          .where('itinerary.portOfLoading.VoyageInfo.VesselName', '==', vessel?.vesselName)
          .where('itinerary.portOfLoading.VoyageInfo.VoyageNr', '==', vessel?.voyageNumber)
          .where('statusCode', '<', BookingRequestStatusCode.ARCHIVED)
          .orderBy('statusCode', 'asc')
          .orderBy('createdAt', 'desc');
      },
      [vessel],
    ),
  );

  useEffect(() => {
    setConfirmedRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.CONFIRMED),
    );
    setRequestedRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.REQUESTED),
    );
    setInProgressRequests(
      relevantBookingRequests?.filter(request => request.statusCode === BookingRequestStatusCode.IN_PROGRESS),
    );
  }, [relevantBookingRequests]);

  return (
    <TableContainer component={Paper}>
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
                disabled={!confirmedRequests || confirmedRequests.length === 0}
              >
                {openConfirmed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </TableCell>
            <TableCell component="th" scope="row">
              Confirmed Bookings
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
              {confirmedRequests && (
                <Collapse in={openConfirmed} timeout="auto" unmountOnExit>
                  <BookingsOverviewTable bookingRequests={confirmedRequests} />
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
                  Requested Bookings
                </TableCell>
                <TableCell align="right">{vessel.requested.quantity}</TableCell>
                <TableCell align="right">
                  {vessel.requested.weight ? (vessel.requested.weight / 1000).toFixed(2) : 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ padding: 0, backgroundColor: '#f5f5f5' }} colSpan={6}>
                  {requestedRequests && (
                    <Collapse in={openRequested} timeout="auto" unmountOnExit>
                      <BookingsOverviewTable bookingRequests={requestedRequests} />
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
                  In Progress Bookings
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
                    backgroundColor: '#f5f5f5',
                  }}
                  colSpan={6}
                >
                  {inProgressRequests && (
                    <Collapse in={openInProgress} timeout="auto" unmountOnExit>
                      <BookingsOverviewTable bookingRequests={inProgressRequests} />
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
