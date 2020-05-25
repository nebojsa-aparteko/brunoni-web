import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  ExpansionPanel,
  Typography,
} from '@material-ui/core';
import useVesselWithVoyage, { normalizeVesselData } from '../../hooks/useVesselWithVoyage';
import VesselVoyageItem from './VesselVoyageItem';
import firebase from '../../firebase';
import VesselWithVoyage from '../../model/VesselWithVoyage';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import CategoryFilter from '../CategoryFilter';
import set from 'lodash/fp/set';
import VesselVoyageDialog from './VesselVoyageDialog';
import { Booking } from '../../model/Booking';

const groups = ['vesselWithVoyage', 'pol'];

const VesselVoyageContainer: React.FC<Props> = () => {
  const [filter, setFilter] = useState('Export');
  const vessel = useVesselWithVoyage(filter);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vesselName, setVesselName] = useState('');
  const [dialogData, setDialogData] = useState<VesselWithVoyage[] | undefined>(undefined);
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);
  const normalizedVessel = useMemo(
    () =>
      vessel?.reduce((r: any, o: any) => {
        groups
          .reduce(
            (group: any, key: any, i, { length }) => (group[o[key]] = group[o[key]] || (i + 1 === length ? [] : {})),
            r,
          )
          .push(o);
        return r;
      }, {}),
    [vessel],
  );
  const handleImportOrExportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setBookingFilters && setBookingFilters(set('category', (event.target as HTMLInputElement).value)(bookingFilters));
    setFilter((event.target as HTMLInputElement).value);
  };
  const handleDialogOpen = (item: VesselWithVoyage[], vessel: string) => {
    setVesselName(vessel);
    setDialogData(item);
    setIsDialogOpen(true);
  };
  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" display="inline">
              Vessel with voyage overview
            </Typography>
            <Divider orientation="vertical" style={{ height: '100%' }} />
            <CategoryFilter value={filter} onChange={handleImportOrExportChange} />
          </Box>
        }
      />
      <CardContent>
        {!normalizedVessel && <ChartsCircularProgress />}

        {normalizedVessel &&
          Object.entries(normalizedVessel).map(([vessel, items]: any, index: number) => (
            <VesselVoyageItem vessel={vessel} items={items} key={vessel} handleDialogOpen={handleDialogOpen} />
          ))}
        {isDialogOpen && (
          <VesselVoyageDialog
            vesselItems={dialogData}
            isOpen={isDialogOpen}
            handleClose={handleDialogClose}
            vessel={vesselName}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VesselVoyageContainer;

interface Props {}
