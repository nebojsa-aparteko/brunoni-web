import React, { ChangeEvent, Fragment, useState } from 'react';
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
import {
  addLandTransportProfit,
  deleteLandTransportProfit,
  editLandTransportProfit,
} from '../../../api/landTransportConfig';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import ProviderProfitEntity, {
  ProviderProfit,
  ProviderProfitType,
} from '../../../model/land-transport/providers/ProviderProfit';
import { omit, set } from 'lodash/fp';
import useLandTransportProfits from '../../../hooks/useLandTransportProfits';
import theme from '../../../theme';
import AddIcon from '@material-ui/icons/Add';
import { BookingCategory } from '../../../model/Booking';
import RoutesTable from './routes/RoutesTable';

const useStyles = makeStyles(() => ({
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'start',
  },
}));

const defaultItem = {
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.DEFAULT,
  id: '',
  createdAt: new Date(),
} as ProviderProfitEntity;

const defaultSpecificItem = {
  category: BookingCategory.Import,
  port: '',
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.SPECIFIC,
  id: '',
  createdAt: new Date(),
} as ProviderProfitEntity;

/*
  Is in edit mode? If yes, check if new Value, if yes, show add icon else show edit icon

 */
const ProviderConfigMain: React.FC<{ provider: ProviderEntity }> = ({ provider }) => {
  const classes = useStyles();
  const [newRow, setNewRow] = useState(false);
  const [newSpecificRow, setNewSpecificRow] = useState(false);
  const profits = useLandTransportProfits(provider.id);

  return (
    <Box className={classes.accordionContainer}>
      <Typography className={classes.title} variant="h1">
        {provider.name}
      </Typography>
      <SimpleExpansionPanel label="Profit" fullWidth TransitionProps={{ mountOnEnter: true }}>
        <Box display="flex" flexDirection="column">
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
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setNewSpecificRow(true);
            }}
            style={{ alignSelf: 'flex-end', marginBottom: theme.spacing(2) }}
            disabled={newRow}
          >
            Add specific row
          </Button>
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
                {profits?.map(item => (
                  <ProviderProfitConfigTableRow
                    item={item}
                    key={item.id}
                    saveItem={item1 => editLandTransportProfit(provider.id, item.id, item1)}
                    deleteItem={id => deleteLandTransportProfit(provider.id, id)}
                  />
                ))}
                {newRow && (
                  <ProviderProfitConfigTableRow
                    item={defaultItem}
                    saveItem={item1 => addLandTransportProfit(provider.id, item1).finally(() => setNewRow(false))}
                    deleteItem={() =>
                      new Promise(resolve => {
                        setNewRow(false);
                        resolve('Default');
                      })
                    }
                    isAddMode
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/*  Specific Table*/}
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Container Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  {
                    category: BookingCategory.Import,
                    port: 'Ham',
                    price: { value: 0, currency: Currency.EUR },
                    containerType: '20',
                    type: ProviderProfitType.SPECIFIC,
                    id: '1',
                    createdAt: new Date(),
                  },
                  {
                    category: BookingCategory.Export,
                    port: 'Rot',
                    price: { value: 0, currency: Currency.EUR },
                    containerType: '40',
                    type: ProviderProfitType.SPECIFIC,
                    id: '2',
                    createdAt: new Date(),
                  },
                  {
                    category: BookingCategory.Import,
                    port: 'Ham',
                    price: { value: 0, currency: Currency.EUR },
                    containerType: '50',
                    type: ProviderProfitType.SPECIFIC,
                    id: '3',
                    createdAt: new Date(),
                  },
                ].map(item => (
                  <ProviderProfitConfigTableRow
                    item={item}
                    key={item.id}
                    saveItem={item1 => editLandTransportProfit(provider.id, item.id, item1)}
                    deleteItem={id => deleteLandTransportProfit(provider.id, id)}
                    isSpecificTable={true}
                  />
                ))}
                {newSpecificRow && (
                  <ProviderProfitConfigTableRow
                    item={defaultSpecificItem}
                    saveItem={item1 => addLandTransportProfit(provider.id, item1).finally(() => setNewRow(false))}
                    deleteItem={() =>
                      new Promise(resolve => {
                        setNewSpecificRow(false);
                        resolve('Specific');
                      })
                    }
                    isAddMode
                    isSpecificTable={true}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </SimpleExpansionPanel>

      <SimpleExpansionPanel label="Routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
        <RoutesTable provider={provider} />
      </SimpleExpansionPanel>
    </Box>
  );
};

const removeEntityFields = (item: ProviderProfitEntity) => omit(['id', 'createdAt'])(item) as ProviderProfit;

interface ProviderProfitConfigTableRowProps {
  item: ProviderProfitEntity;
  saveItem: (item: ProviderProfit) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  isAddMode?: boolean;
  isSpecificTable?: boolean;
}

const ProviderProfitConfigTableRow: React.FC<ProviderProfitConfigTableRowProps> = ({
  item,
  saveItem,
  deleteItem,
  isAddMode,
  isSpecificTable,
}) => {
  const [isEditing, setEditing] = useState(isAddMode);
  const [stateItem, setStateItem] = useState(item);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    key && setStateItem(prevState => set(key, value)(prevState));
  };

  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    event.target?.name &&
      setStateItem(prevState => ({
        ...prevState,
        price: { ...prevState.price, currency: event.target.value as Currency },
      }));
  };

  return isEditing ? (
    <TableRow>
      {isSpecificTable && (
        <Box>
          <TableCell>
            <TextField
              variant="outlined"
              label="Category"
              value={item.category}
              name="category"
              onChange={handleInputChange}
            />
          </TableCell>
          <TableCell>
            <TextField variant="outlined" label="Port" value={item.port} name="port" onChange={handleInputChange} />
          </TableCell>
        </Box>
      )}
      <TableCell>
        <TextField
          variant="outlined"
          label="Container Type"
          value={stateItem.containerType}
          name="containerType"
          onChange={handleInputChange}
        />
      </TableCell>
      <TableCell>
        <TextField
          variant="outlined"
          label="Price"
          value={stateItem.price.value}
          name="price.value"
          onChange={handleInputChange}
        />
      </TableCell>
      <TableCell>
        <Select
          variant="outlined"
          label="Currency"
          value={stateItem.price.currency}
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
              saveItem(isAddMode ? removeEntityFields(stateItem) : stateItem).finally(() => setEditing(false));
            }}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton
          onClick={() => {
            deleteItem(item.id).finally(() => {
              console.log('Test');
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow>
      {isSpecificTable && (
        <Fragment>
          <TableCell align="left">{stateItem.category}</TableCell>
          <TableCell align="left">{stateItem.port}</TableCell>
        </Fragment>
      )}
      <TableCell align="left"> {stateItem.containerType}</TableCell>
      <TableCell align="left">{`${stateItem.price.value}`}</TableCell>
      <TableCell align="left">{stateItem.price.currency}</TableCell>
      <TableCell align="left">
        <IconButton onClick={() => setEditing(prevState => !prevState)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => deleteItem(item.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ProviderConfigMain;
