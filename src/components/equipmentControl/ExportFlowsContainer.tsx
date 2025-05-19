import React, { useCallback, useContext, useMemo } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { BookingCategory } from '../../model/Booking';
import ExportFlowsTable, { getMultipleWeekDateRange, getWeekDate } from './ExportFlowsTable';
import CarrierInput from '../inputs/CarrierInput';
import { groupBy, set, uniq } from 'lodash/fp';
import { get } from 'lodash';
import Carriers from '../../contexts/Carriers';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {
  containerTypesValues,
  EquipmentControlContainerTypes,
  EquipmentExportSummary,
  EquipmentImportSummary,
} from '../../model/EquipmentControl';
import { addWeeks, endOfISOWeek, getISOWeek, getYear, setISOWeek, setYear } from 'date-fns';
import CountryInput from '../inputs/CountryInput';
import sortByObjectKeys from '../../utilities/sortByObjectKeys';
import PickupLocations from '../../contexts/PickupLocations';
import PickupLocationInput from '../inputs/PickupLocationInput';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 120,
    // maxWidth: 300,
  },
  spacer: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));
const ExportFlowsContainer: React.FC = () => {
  const classes = useStyles();
  const summary = useEquipmentSummary(BookingCategory.Export);
  const locations = useContext(PickupLocations);
  const availableCarriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { carrier } = filters;
  const findLocationById = useCallback(
    (id: string) => locations?.find(loc => loc.id === id),
    [locations],
  );
  const groupedSummary = useMemo(
    () =>
      Object.entries(
        sortByObjectKeys(
          groupBy<EquipmentImportSummary>(s => {
            const location = locations?.find(loc => loc.id === get(s, 'id', '-'));
            return `${location?.countryCode || '-'}~${location?.city || '-'}`;
          })(summary.filter(s => (filters.location ? s.id === filters.location : true))),
        ) as { [key: string]: EquipmentExportSummary[] },
      ),
    [summary, locations, filters],
  );
  const countries = useMemo(
    () => uniq(groupedSummary.map(([country]) => country.split('~')[0])),
    [groupedSummary],
  );
  const selectableLocations = useMemo(() => {
    const ids = summary.map(v => v.id);
    return locations?.filter(l => ids.includes(l.id));
  }, [summary, locations]);

  const startWeekDate = getWeekDate(filters.year, filters.week);
  const startWeek = getISOWeek(startWeekDate);
  const startWeekYear = getYear(startWeekDate);
  const endWeekDate = endOfISOWeek(addWeeks(startWeekDate, 2));
  const endWeek = getISOWeek(endWeekDate);
  const endWeekYear = getYear(endWeekDate);

  return (
    <Box>
      <Box p={3}>
        <Typography variant="h4">Export Flows</Typography>
        <Box width="95vw" display="flex" flexDirection="row" alignItems="center">
          <Box minWidth={250} maxWidth={400} margin={4} marginLeft={0} paddingRight={1}>
            <CarrierInput
              label="Select a carrier"
              onChange={carrier => setFilters(prevState => set('carrier', carrier)(prevState))}
              carriers={availableCarriers}
              value={carrier}
            />
          </Box>
          <Box>
            <CountryInput
              selectedCountries={filters.country}
              selectableValues={countries}
              onChange={country => setFilters(prevState => set('country', country)(prevState))}
            />
          </Box>
          <Box>
            <PickupLocationInput
              selectedLocation={filters.location}
              selectableValues={selectableLocations}
              onChange={location =>
                setFilters(prevState =>
                  set('location', findLocationById(location)?.id || '')(prevState),
                )
              }
            />
          </Box>
          <Box flexDirection="row" display="flex" alignItems="center">
            <IconButton
              color="primary"
              component="span"
              onClick={() =>
                setFilters(prevState => {
                  const weekDate = getWeekDate(prevState.year, prevState.week);
                  const newWeekDate = endOfISOWeek(addWeeks(weekDate, -1));
                  const newWeek = getISOWeek(newWeekDate);
                  const newWeekYear = getYear(newWeekDate);

                  return set('year', newWeekYear)(set('week', newWeek)(prevState));
                })
              }
            >
              <ChevronLeftIcon />
            </IconButton>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography>Change week range</Typography>
              <Typography>
                {getMultipleWeekDateRange(startWeek, startWeekYear, endWeek, endWeekYear)}
              </Typography>
            </Box>
            <IconButton
              color="primary"
              component="span"
              onClick={() =>
                setFilters(prevState => {
                  const weekDate = getWeekDate(prevState.year, prevState.week);
                  const newWeekDate = endOfISOWeek(addWeeks(weekDate, 1));
                  const newWeek = getISOWeek(newWeekDate);
                  const newWeekYear = getYear(newWeekDate);

                  return set('year', newWeekYear)(set('week', newWeek)(prevState));
                })
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box flexDirection="row" display="flex" alignItems="center">
            <FormControl className={classes.formControl}>
              <InputLabel id="status-select">Equipment type</InputLabel>
              <Select
                labelId="status-select"
                id="status-select-checkbox"
                multiple
                value={filters.containerTypes}
                onChange={event =>
                  setFilters(prevState =>
                    set(
                      'containerTypes',
                      containerTypesValues.filter(type =>
                        (event.target.value as string[])?.includes(type),
                      ),
                    )(prevState),
                  )
                }
                input={<Input />}
                renderValue={selected =>
                  (selected as any[])
                    .map(s => get(EquipmentControlContainerTypes, s, '-'))
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {Object.entries(EquipmentControlContainerTypes).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    <Checkbox checked={filters.containerTypes.includes(key)} />
                    <ListItemText primary={value} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <ExportFlowsTable summary={groupedSummary} />
    </Box>
  );
};

export default ExportFlowsContainer;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
