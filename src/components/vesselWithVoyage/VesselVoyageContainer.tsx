import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@material-ui/core';
import useVesselWithVoyage from '../../hooks/useVesselWithVoyage';
import VesselVoyageItem from './VesselVoyageItem';
import VesselWithVoyage from '../../model/VesselWithVoyage';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import CategoryFilter from '../CategoryFilter';
import set from 'lodash/fp/set';
import VesselVoyageDialog from './VesselVoyageDialog';
import { BookingCategory } from '../../model/Booking';
import { useVesselFilterContext } from '../../providers/VesselOverviewFilterProvider';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import theme from '../../theme';
import BookingsEmptyResults from '../bookings/BookingsEmptyResults';
import DateRangeInput from '../inputs/DateRangeInput';

const groups = ['vesselWithVoyage', 'pol'];

const VesselVoyageContainer: React.FC<Props> = () => {
  const vessel = useVesselWithVoyage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vesselName, setVesselName] = useState('');
  const [dialogData, setDialogData] = useState<VesselWithVoyage[] | undefined>(undefined);
  const [filters, setFilters] = useVesselFilterContext();
  const { category, carrier, dateRange } = filters;
  const carriers = useContext(Carriers);
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
    if (setFilters) setFilters(set('category', (event.target as HTMLInputElement).value as BookingCategory)(filters));
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
            <CategoryFilter value={category} onChange={handleImportOrExportChange} />
            <Box display="flex" style={{ minWidth: theme.spacing(35) }}>
              <CarrierInput
                label={'Carriers'}
                carriers={carriers}
                onChange={carrier => {
                  if (setFilters) setFilters(set('carrier', carrier)(filters));
                }}
                value={carrier}
              />
            </Box>
            <Box display="flex" style={{ maxWidth: theme.spacing(35), marginLeft: theme.spacing(3) }}>
              <DateRangeInput
                onChange={dateRange => {
                  if (setFilters) setFilters(set('dateRange', dateRange)(filters));
                }}
                value={dateRange}
                isMaxDateSet={false}
              />
            </Box>
          </Box>
        }
      />
      <CardContent>
        {!normalizedVessel && <ChartsCircularProgress />}

        {normalizedVessel && Object.entries(normalizedVessel).length > 0 ? (
          Object.entries(normalizedVessel).map(([vessel, items]: any) => (
            <VesselVoyageItem vessel={vessel} items={items} key={vessel} handleDialogOpen={handleDialogOpen} />
          ))
        ) : (
          <BookingsEmptyResults title="" message="No vessel with voyage item with this criteria." />
        )}
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
