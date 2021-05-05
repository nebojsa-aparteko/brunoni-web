import React, { useContext, useMemo } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import CarrierInput from '../inputs/CarrierInput';
import Carriers from '../../contexts/Carriers';
import ImportFlowsTable from './ImportFlowsTable';
import useEquipmentSummary from '../../hooks/useEquipmentSummary';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import { groupBy, set, uniq } from 'lodash/fp';
import { BookingCategory } from '../../model/Booking';
import { get } from 'lodash';
import {
  containerTypesValues,
  EquipmentControlContainerTypes,
  EquipmentImportSummary,
} from '../../model/EquipmentControl';
import CountryInput from '../inputs/CountryInput';
import PickupLocations from '../../contexts/PickupLocations';
import sortByObjectKeys from '../../utilities/sortByObjectKeys';

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
const ImportFlowsContainer: React.FC = () => {
  const availableCarriers = useContext(Carriers);
  const [filters, setFilters] = useEquipmentControlFilterProviderContext();
  const { carrier } = filters;
  const summary = useEquipmentSummary(BookingCategory.Import);
  const classes = useStyles();
  const locations = useContext(PickupLocations);

  const groupedSummary = useMemo(
    () =>
      Object.entries(
        sortByObjectKeys(
          groupBy<EquipmentImportSummary>(s => {
            const location = locations?.find(loc => loc.id === get(s, 'id', '-'));
            // return `${location?.countryCode || '-'}`;
            return `${location?.countryCode || '-'}~${location?.city || '-'}`;
          })(summary),
        ) as { [key: string]: EquipmentImportSummary[] },
      ),
    [summary, locations],
  );
  const countries = useMemo(() => uniq(groupedSummary.map(([country]) => country.split('~')[0])), [groupedSummary]);
  return (
    <Box>
      <Box pt={3} px={3}>
        <Typography variant="h4">Import Flows</Typography>
        <Box width="95vw" display="flex" flexDirection="row" alignItems="center">
          <Box minWidth={250} maxWidth={400} my={3} mr={1}>
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
              // label="Select a carrier"
              onChange={carrier => setFilters(prevState => set('country', carrier)(prevState))}
              // carriers={availableCarriers}
              // value={carrier}
            />
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
                      containerTypesValues.filter(type => (event.target.value as string[])?.includes(type)),
                    )(prevState),
                  )
                }
                input={<Input />}
                renderValue={selected =>
                  (selected as any[]).map(s => get(EquipmentControlContainerTypes, s, '-')).join(', ')
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

      <ImportFlowsTable summary={groupedSummary} />
    </Box>
  );
};

export default ImportFlowsContainer;

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
