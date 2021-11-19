import React, { ChangeEvent, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import ProviderPricelistEntity, {
  ProviderPricelist,
  ProviderPricelistCategory,
} from '../../../model/land-transport/providers/ProviderPricelists';
import { flow, get, set } from 'lodash/fp';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import { EquipmentControlContainerTypes } from '../../../model/EquipmentControl';
import { Currency } from '../../../model/Payment';
import EditingInput from '../../EditingInput';
import {
  addLandTransportPricelist,
  deleteLandTransportPricelist,
  editLandTransportPricelist,
} from '../../../api/landTransportConfig';
import useLandTransportPricelists from '../../../hooks/useLandTransportPricelists';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';

const defaultExportPricelistItem = {
  pricePerContainer: {},
  category: ProviderPricelistCategory.EXPORT,
  distance: 0,
  currency: Currency.EUR,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

const defaultImportPricelistItem = {
  pricePerContainer: {},
  category: ProviderPricelistCategory.IMPORT,
  distance: 0,
  currency: Currency.EUR,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

interface TableRowProps {
  pricelist: ProviderPricelistEntity;
  provider: ProviderEntity;
  editItem: (id: string, item: ProviderPricelist) => Promise<any>;
}

const PricelistTableRow: React.FC<TableRowProps> = ({ pricelist, provider, editItem }) => {
  const [isEditing, setEditing] = useState(false);
  const [pricelistState, setPricelistState] = useState<ProviderPricelistEntity>(pricelist);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setPricelistState((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target?.name;
    const value = event.target?.value;
    if (name && value) {
      setPricelistState(prevState => set(name, value)(prevState));
    }
  };

  return (
    <TableRow onDoubleClick={() => setEditing(true)}>
      <TableCell>
        <EditingInput
          editing={isEditing}
          inputProps={{
            variant: 'outlined',
            label: 'Distance',
            name: 'distance',
            onChange: handleInputChange,
            type: 'number',
          }}
          typographyProps={{ style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
          value={isEditing ? get('distance')(pricelistState) : `Until ${get('distance')(pricelistState)}km`}
          noDefaultLabel={true}
        />
      </TableCell>
      {Object.keys(EquipmentControlContainerTypes).map(key => (
        <TableCell key={key}>
          <EditingInput
            editing={isEditing}
            inputProps={{
              variant: 'outlined',
              name: `pricePerContainer.${key}.value`,
              onChange: handleInputChange,
              type: 'number',
            }}
            value={flow(get(key), get('value'))(pricelistState.pricePerContainer) || '-'}
          />
        </TableCell>
      ))}
      <TableCell>
        {isEditing ? (
          <Select
            variant="outlined"
            value={get('currency')(pricelistState)}
            name="currency"
            onChange={handleSelectChange}
          >
            {Object.keys(Currency).map(val => (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography>{get('currency')(pricelistState)}</Typography>
        )}
      </TableCell>
      {isEditing ? (
        <Box display="flex">
          <IconButton onClick={() => editItem(pricelist.id, pricelistState).finally(() => setEditing(false))}>
            <CheckIcon />
          </IconButton>
          <IconButton onClick={() => setEditing(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <IconButton onClick={() => setEditing(true)}>
          <CheckIcon />
        </IconButton>
      )}
      <IconButton onClick={() => deleteLandTransportPricelist(provider.id, pricelist.id)}>
        <DeleteIcon />
      </IconButton>
    </TableRow>
  );
};

interface TableProps {
  provider: ProviderEntity;
  pricelists: ProviderPricelistEntity[];
  category: ProviderPricelistCategory;
}

const PricelistTable: React.FC<TableProps> = ({ provider, pricelists, category }) => {
  return (
    <TableContainer component={Paper}>
      <Button
        variant="contained"
        onClick={() =>
          addLandTransportPricelist(
            provider.id,
            category === ProviderPricelistCategory.EXPORT ? defaultExportPricelistItem : defaultImportPricelistItem,
          )
        }
      >
        Add new
      </Button>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Distance</TableCell>
            {Object.values(EquipmentControlContainerTypes).map(val => (
              <TableCell key={val}>{val}</TableCell>
            ))}
            <TableCell>Currency</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pricelists.map(pricelist => (
            <PricelistTableRow
              pricelist={pricelist}
              provider={provider}
              editItem={(id, item) => editLandTransportPricelist(provider.id, id, item)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface Props {
  provider: ProviderEntity;
}
const PricelistConfig: React.FC<Props> = ({ provider }) => {
  const pricelists = useLandTransportPricelists(provider.id);

  const exportPricelists = useMemo(
    () => pricelists?.exportPricelistEntities?.sort((a, b) => (a.distance > b.distance ? 1 : -1)),
    [pricelists?.exportPricelistEntities],
  );
  const importPricelists = useMemo(
    () => pricelists?.importPricelistEntities?.sort((a, b) => (a.distance > b.distance ? 1 : -1)),
    [pricelists?.importPricelistEntities],
  );

  return (
    <Box display="flex" flexDirection="column" p={2}>
      {pricelists ? (
        <React.Fragment>
          Export
          <PricelistTable
            provider={provider}
            pricelists={exportPricelists}
            category={ProviderPricelistCategory.EXPORT}
          />
          Import
          <PricelistTable
            provider={provider}
            pricelists={importPricelists}
            category={ProviderPricelistCategory.IMPORT}
          />
        </React.Fragment>
      ) : (
        <ChartsCircularProgress />
      )}
    </Box>
  );
};
export default PricelistConfig;
