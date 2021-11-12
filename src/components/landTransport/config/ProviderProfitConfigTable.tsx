import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import ProviderProfitConfigTableRow from './ProviderProfitConfigTableRow';
import {
  addLandTransportProfit,
  deleteLandTransportProfit,
  editLandTransportProfit,
} from '../../../api/landTransportConfig';
import React, { useState } from 'react';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import { Currency } from '../../../model/Payment';
import ProviderProfitEntity, {
  DefaultProviderProfitEntity,
  ProviderProfitType,
  SpecificProviderProfitEntity,
} from '../../../model/land-transport/providers/ProviderProfit';
import AddIcon from '@material-ui/icons/Add';
import { theme } from '../../../theme';
import { BookingCategory } from '../../../model/Booking';

const ProviderProfitConfigTable: React.FC<Props> = ({ provider, profits, isSpecific }) => {
  const [newRow, setNewRow] = useState(false);
  if (!profits) return <CircularProgress />;
  return (
    <Box my={2} display="flex" flexDirection="column">
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddIcon />}
        onClick={() => {
          setNewRow(true);
        }}
        style={{ alignSelf: 'flex-end', marginBottom: theme.spacing(2) }}
        disabled={newRow}
      >
        Add row
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {isSpecific && <TableCell>Category</TableCell>}
              {isSpecific && <TableCell>Port</TableCell>}
              <TableCell>Container Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profits?.map(item => (
              <ProviderProfitConfigTableRow
                item={item}
                key={item.id}
                saveItem={item1 => editLandTransportProfit(provider.id, item.id, item1)}
                deleteItem={id => deleteLandTransportProfit(provider.id, id)}
                isSpecific={isSpecific}
              />
            ))}
            {newRow && (
              <ProviderProfitConfigTableRow
                item={isSpecific ? specificItem : defaultItem}
                saveItem={item1 => addLandTransportProfit(provider.id, item1).finally(() => setNewRow(false))}
                deleteItem={() =>
                  new Promise(resolve => {
                    setNewRow(false);
                    resolve('Default');
                  })
                }
                isAddMode
                isSpecific={isSpecific}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
const defaultItem = {
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.DEFAULT,
  id: '',
  createdAt: new Date(),
} as DefaultProviderProfitEntity;

const specificItem = {
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.SPECIFIC,
  id: '',
  createdAt: new Date(),
  port: '',
  category: BookingCategory.Import,
} as SpecificProviderProfitEntity;

interface Props {
  provider: ProviderEntity;
  profits?: ProviderProfitEntity[];
  isSpecific?: boolean;
}

export default ProviderProfitConfigTable;
