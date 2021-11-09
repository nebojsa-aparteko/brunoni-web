import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { format } from 'date-fns';
import VesselAllocation, { PrevNextVesselResponse, VesselResponse } from '../../model/VesselAllocation';
import useAPI from '../../hooks/useAPI';
import { useVesselAllocationStyles } from './VesselAllocationButton';

interface TeuTonProps {
  teu: string;
  ton: string;
}

const TeuTon: React.FC<TeuTonProps> = ({ teu, ton }) => {
  return (
    <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
      <Typography>{teu}</Typography>
      <Typography>{ton}</Typography>
    </Box>
  );
};

interface NextPrevProps {
  vessel: VesselAllocation;
  POL: string;
  etsDate: string;
}

const NextPreviousVesselTable: React.FC<NextPrevProps> = ({ vessel, POL, etsDate }) => {
  const classes = useVesselAllocationStyles();
  const { get, loading } = useAPI();
  const [nextPrevVessels, setNextPrevVessels] = useState<PrevNextVesselResponse | null>(null);

  const ifCurrentVessel = (v: VesselResponse) =>
    v.VesselCode === vessel.vesselCode && v.VoyageNr === vessel.voyageNumber && v.Service === vessel.service;

  useEffect(() => {
    const getVesselAllocationSchedule = async () => {
      const params = {
        carrierId: vessel.carrierCode,
        service: vessel.service,
        POL: POL, //portOfLoading?.Port?.ID,
        etsDate: etsDate //portOfLoading?.DepartureDate
          ? format(new Date(etsDate), 'dd/MM/yyyy')
          : undefined,
      };
      const response = (await get('vesselAllocationSchedule', params)) as PrevNextVesselResponse | null;
      if (response) {
        setNextPrevVessels(response);
      }
    };
    void getVesselAllocationSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading ? (
    <CircularProgress />
  ) : nextPrevVessels ? (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Carrier</TableCell>
            <TableCell>ETS</TableCell>
            <TableCell>Vessel Name</TableCell>
            <TableCell>Vessel Code</TableCell>
            <TableCell>Voyage Nr.</TableCell>
            <TableCell />
            <TableCell>Alloc.</TableCell>
            <TableCell>Booked</TableCell>
            <TableCell>%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nextPrevVessels.BookingSpace.map((vessel, index) => {
            return (
              <TableRow
                key={index}
                className={classes.tableRow}
                style={{ border: ifCurrentVessel(vessel) ? '2px solid #00b0ff' : 'inherit' }}
              >
                <TableCell>{vessel.CarrierID}</TableCell>
                <TableCell>{vessel.ETS}</TableCell>
                <TableCell>{vessel.VesselName}</TableCell>
                <TableCell>{vessel.VesselCode}</TableCell>
                <TableCell>{vessel.VoyageNr}</TableCell>
                <TableCell>
                  <TeuTon teu={'TEU:'} ton={'TON:'} />
                </TableCell>
                <TableCell>
                  <TeuTon teu={vessel['TEU-Allocation']} ton={vessel['Weight-Allocation']} />
                </TableCell>
                <TableCell>
                  <TeuTon teu={vessel['TEU-Booked']} ton={vessel['Weight-Booked']} />
                </TableCell>
                <TableCell>
                  <TeuTon teu={vessel['TEU-Percent']} ton={vessel['Weight-Percent']} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Box display={'flex'} alignItems={'center'}>
      <Typography>Not Found</Typography>
    </Box>
  );
};

export default NextPreviousVesselTable;
