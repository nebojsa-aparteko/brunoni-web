import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
import { Currency } from '../../../model/Payment';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import { addLandTransportProfit } from '../../../api/landTransportConfig';
import ProviderEntity from '../../../model/land-transport/providers/Provider';

const useStyles = makeStyles(() => ({
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'start',
  },
  expansionPanel: {
    marginBottom: 8,
    width: '1000px',
  },
  expansionPanelSummary: {
    display: 'flex',
  },
  expansionPanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
  icon: {
    cursor: 'pointer',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
}));

interface LandTransportData {
  containerType?: string;
  price?: string;
  currency?: Currency;
  version?: string;
  date?: Date;
  active?: boolean;
}

const defaultItem = { price: '', currency: Currency.EUR, containerType: '' } as LandTransportData;
/*
  Is in edit mode? If yes, check if new Value, if yes, show add icon else show edit icon

 */
const ProviderConfigMain: React.FC<{ provider: ProviderEntity }> = ({ provider }) => {
  const classes = useStyles();

  return (
    <Box className={classes.accordionContainer}>
      <Typography className={classes.title} variant="h1">
        {provider.name}
      </Typography>
      <SimpleExpansionPanel label="Profit" fullWidth>
        <Button>Add row</Button>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Container Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { price: '100', currency: Currency.EUR, containerType: '20' },
                { price: '20', currency: Currency.EUR, containerType: '40' },
              ].map((item, i) => (
                <ProviderProfitConfigTableRow
                  item={item}
                  key={i}
                  saveItem={item1 => addLandTransportProfit(provider.id, item1)}
                />
              ))}
              {/*<ProviderProfitConfigTableRow item={defaultItem} saveItem={item1 => {}} />*/}
            </TableBody>
          </Table>
        </TableContainer>
      </SimpleExpansionPanel>

      <SimpleExpansionPanel label="Routes" fullWidth>
        <Box>
          <Typography>Test</Typography>
        </Box>
      </SimpleExpansionPanel>
    </Box>
  );
};

interface ProviderProfitConfigTableRowProps {
  item: LandTransportData;
  saveItem: (item: LandTransportData) => Promise<any>;
  isAddMode?: boolean;
}

const ProviderProfitConfigTableRow: React.FC<ProviderProfitConfigTableRowProps> = ({ item, saveItem, isAddMode }) => {
  const [isEditing, setEditing] = useState(false);
  const [stateItem, setStateItem] = useState(item);
  const handleInputChange = () => {};
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    event.target?.name && setStateItem(prevState => ({ ...prevState, currency: event.target.value as Currency }));
  };
  return isEditing ? (
    <TableRow>
      <TableCell>
        <TextField
          variant="outlined"
          label="Container Type"
          value={stateItem.containerType}
          name="containerType"
          onChange={event => {}}
        />
      </TableCell>
      <TableCell>
        <TextField variant="outlined" label="Price" value={stateItem.price} name="price" onChange={event => {}} />
      </TableCell>
      <TableCell>
        <Select
          variant="outlined"
          label="Currency"
          value={stateItem.currency}
          name="currency"
          onChange={handleSelectChange}
        >
          {Object.values(Currency).map(val => (
            <MenuItem value={val}>{val}</MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell align="left">
        {isEditing ? (
          <IconButton
            onClick={() => {
              saveItem(stateItem).finally(() => setEditing(false));
            }}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow>
      <TableCell align="left">{stateItem.containerType}</TableCell>
      <TableCell align="left">{stateItem.price}</TableCell>
      <TableCell align="left">{stateItem.currency}</TableCell>
      <TableCell align="left">
        <IconButton onClick={() => setEditing(prevState => !prevState)}>
          <EditIcon />
        </IconButton>
        <IconButton>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ProviderConfigMain;
