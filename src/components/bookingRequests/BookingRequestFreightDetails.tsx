import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { AppBar, Checkbox, Grid, Tab, Tabs, TextField, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import ChargeCodeInput from '../inputs/ChargeCodeInput';
import { flow, get, set } from 'lodash/fp';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import ChargeCodes from '../../contexts/ChargeCodes';
import { a11yProps } from '../../pages/BookingsPage';
import { FreightDetail, FreightDetailGroup } from '../../model/Booking';
import { isDashboardUser } from '../../model/UserRecord';
import UserRecordContext from '../../contexts/UserRecordContext';
import Container from '../../model/Container';
import ContainerDetails from '../../model/ContainerDetails';
import ContainerTypes from '../../contexts/ContainerTypes';
import ContainerType from '../../model/ContainerType';
import { formatCurrencyAmount } from '../../utilities/currencyFormatter';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650,
    overflowX: 'auto',
  },
  tableHead: {
    fontWeight: theme.typography.fontWeightBold,
  },
  tableRow: {
    '& td': {
      whiteSpace: 'nowrap',
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  emptyState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface RowProps {
  freightDetail: FreightDetail;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  selectedTab: number;
}

const getUpdatedFreightDetails = (
  bookingRequest: BookingRequest,
  value: any | undefined,
  pos: string,
  field: string,
) => {
  return (
    bookingRequest.freightDetails &&
    bookingRequest.freightDetails.map((detail: FreightDetail) =>
      detail.SeqNr === pos
        ? flow(
            set(field, value === '' ? undefined : value),
            set(
              'Total',
              detail.Anz && detail.UnitValue
                ? (
                    (field === 'Anz' ? parseFloat(value) : parseFloat(detail.Anz)) *
                    (field === 'UnitValue' ? parseFloat(value) : parseFloat(detail.UnitValue))
                  ).toFixed(2)
                : '0.00',
            ),
          )(detail)
        : detail,
    )
  );
};

//inputs use an empty string instead of undefined so we need to compare those values as equal to avoid warnings
const compareValues = (value1: string | undefined, value2: string | undefined) =>
  (value1 ? value1 : '') !== (value2 ? value2 : '');

// const isEditable = ();
const getQuantity = (
  containers: (Container & ContainerDetails)[],
  costUnit: string,
  numberOfContainersAndSets: number[],
  isQAutomatic: boolean,
) => {
  const searchableCostUnit = costUnit.toUpperCase();
  const [noOfContainers, noOfSets] = numberOfContainersAndSets;
  switch (searchableCostUnit) {
    case 'PRO SET':
      return noOfSets.toFixed(2) || '0,00';
    case 'PER SET':
      return noOfSets.toFixed(2) || '0,00';
    case 'PRO CONTAINER':
      return noOfContainers.toFixed(2) || '0,00';
    case 'PER CONTAINER':
      return noOfContainers.toFixed(2) || '0,00';
    default:
      const relevantContainers = containers.filter(
        container =>
          'PRO ' + container.containerType?.name.toUpperCase() === searchableCostUnit ||
          'PER ' + container.containerType?.name.toUpperCase() === searchableCostUnit,
      );
      if (relevantContainers.length > 0) {
        return relevantContainers.reduce((a, b) => a + b.quantity, 0).toFixed(2);
      } else {
        if (isQAutomatic) return '0,00';
      }
      return undefined;
  }
};
const automaticCostUnits = ['per Container', 'pro Container', 'pro Set', 'per Set'];
const isQuantityAutomatic = (costUnit: string, containerTypeNames: string[] | undefined) =>
  automaticCostUnits.some(unit => unit.toUpperCase() === costUnit.toUpperCase()) ||
  containerTypeNames?.some(
    containerName =>
      'PRO ' + containerName.toUpperCase() === costUnit.toUpperCase() ||
      'PER ' + containerName.toUpperCase() === costUnit.toUpperCase(),
  );

const BookingRequestFreightDetailsRow: React.FC<RowProps> = ({ freightDetail, selected, onSelectRow, selectedTab }) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const containerTypes = useContext(ContainerTypes) as ContainerType[];
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const [quantity, setQuantity] = useState<string | undefined>(freightDetail.Anz || '0,00');
  const [currency, setCurrency] = useState<string | undefined>(freightDetail.Currency);
  const [unitValue, setUnitValue] = useState<string | undefined>(freightDetail.UnitValue);
  const [costUnit, setCostUnit] = useState<string | undefined>(freightDetail.Unit);
  const [chargeCodeText, setChargeCodeText] = useState<string | undefined>(freightDetail.Unit);
  const [containerTypeNames, setContainerTypeNames] = useState(containerTypes.map(containerType => containerType.name));
  const [isQAutomatic, setIsQAutomatic] = useState(
    (costUnit && containerTypes && isQuantityAutomatic(costUnit, containerTypeNames)) || false,
  );

  useEffect(() => {
    const newContainerTypeNames = containerTypes.map(containerType => containerType.name);
    setContainerTypeNames(newContainerTypeNames);
    setIsQAutomatic(
      (freightDetail.Unit && newContainerTypeNames && isQuantityAutomatic(freightDetail.Unit, newContainerTypeNames)) ||
        false,
    );
  }, [containerTypes, freightDetail.Unit]);

  useEffect(() => {
    setQuantity(freightDetail.Anz || '0,00');
    setCurrency(freightDetail.Currency);
    setUnitValue(formatCurrencyAmount(Number(freightDetail.UnitValue)));
    setCostUnit(freightDetail.Unit);
    setChargeCodeText(freightDetail.Txt);
  }, [freightDetail]);

  const handleChangeFreightDetails = (value: string | undefined, fieldName: string) => {
    bookingRequest &&
      setBookingRequest &&
      compareValues(value, get(fieldName, freightDetail)) &&
      setBookingRequest(
        set(
          'freightDetails',
          getUpdatedFreightDetails(bookingRequest, value, freightDetail.SeqNr, fieldName),
        )(bookingRequest) as BookingRequest,
      );
  };

  return (
    <TableRow key={freightDetail.SeqNr} className={classes.tableRow}>
      {editing && isDashboardUser(userRecord) && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={event => onSelectRow(event)}
            onFocus={event => event.stopPropagation()}
            color="primary"
          />
        </TableCell>
      )}
      <TableCell component="th" scope="row">
        {editing && isDashboardUser(userRecord) ? (
          selectedTab !== 2 ? (
            <ChargeCodeInput
              chargeCodeText={freightDetail.Txt}
              group={freightDetail.Group}
              handleChange={code => handleChangeFreightDetails(code?.text, 'Txt')}
              margin="dense"
            />
          ) : (
            <TextField
              label=""
              margin="dense"
              variant="outlined"
              fullWidth
              value={chargeCodeText || ''}
              onChange={event => setChargeCodeText(event.target.value)}
              onBlur={event => handleChangeFreightDetails(event.target.value, 'Txt')}
            />
          )
        ) : (
          freightDetail.Txt
        )}
      </TableCell>
      <TableCell align="right">
        {editing && isDashboardUser(userRecord) && !isQAutomatic ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            // disabled={isQAutomatic}
            value={
              costUnit && bookingRequest && bookingRequest.containers && isQAutomatic ? freightDetail.Anz : quantity
            }
            onChange={event => setQuantity(event.target.value)}
            onBlur={event => handleChangeFreightDetails(event.target.value, 'Anz')}
          />
        ) : (
          freightDetail.Anz || '0,00'
        )}
      </TableCell>
      <TableCell align="right">
        {editing && isDashboardUser(userRecord) ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            value={currency || ''}
            onChange={event => setCurrency(event.target.value)}
            onBlur={event => handleChangeFreightDetails(event.target.value, 'Currency')}
          />
        ) : (
          freightDetail.Currency
        )}
      </TableCell>
      {freightDetail.Txt === 'Seafreight'}
      <TableCell align="right">
        {editing && isDashboardUser(userRecord) ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            type="number"
            value={unitValue?.replace(',', '') || ''}
            onChange={event => setUnitValue(event.target.value)}
            onBlur={event => handleChangeFreightDetails(event.target.value, 'UnitValue')}
          />
        ) : (
          freightDetail.UnitValue
        )}
      </TableCell>
      <TableCell>
        {editing && isDashboardUser(userRecord) ? (
          <TextField
            label=""
            margin="dense"
            variant="outlined"
            fullWidth
            value={costUnit || ''}
            onChange={event => setCostUnit(event.target.value)}
            onBlur={event => handleChangeFreightDetails(event.target.value, 'Unit')}
          />
        ) : (
          freightDetail.Unit
        )}
      </TableCell>
      <TableCell>{freightDetail.Total || '0.00'}</TableCell>
    </TableRow>
  );
};

const findNextPos = (freightDetails: FreightDetail[]) => {
  //TODO probably needs to be edited because of concurrency
  let pos = 0;
  for (let i in freightDetails) {
    const value = parseInt(freightDetails[i].SeqNr);
    if (value >= pos) pos = value + 1;
  }
  return pos + '';
};

const getNumberOfContainersAndSets = (bookingRequest: BookingRequest) => {
  let containers = 0;
  let sets = 0;
  bookingRequest.containers?.forEach(container => {
    containers = containers + (container.quantity || 0);
    sets =
      sets +
      (container.containerType?.id ? (container.containerType.id.startsWith('2') ? 1 : 2) * container.quantity : 0);
  });
  return [containers, sets];
};

const BookingRequestFreightDetails: React.FC<Props> = ({ freightDetails }) => {
  const classes = useStyles();
  const chargeCodes = useContext(ChargeCodes);
  const [filteredFreightDetails, setFilteredFreightDetails] = useState<FreightDetail[] | undefined>(freightDetails);
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const [numberOfContainersAndSets, setNumberOfContainersAndSets] = useState(
    bookingRequest ? getNumberOfContainersAndSets(bookingRequest) : [0, 0],
  );
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const userRecord = useContext(UserRecordContext);
  const containerTypes = useContext(ContainerTypes) as ContainerType[];
  const [containerTypeNames, setContainerTypeNames] = useState(containerTypes.map(containerType => containerType.name));

  useEffect(() => {
    setContainerTypeNames(containerTypes.map(containerType => containerType.name));
  }, [containerTypes]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    event.stopPropagation();
    setSelectedTab(newValue);
  };

  const handleChangeFreightDetails = (value: string | undefined, fieldName: string, freightDetail: FreightDetail) => {
    bookingRequest &&
      setBookingRequest &&
      compareValues(value, get(fieldName, freightDetail)) &&
      setBookingRequest(
        set(
          'freightDetails',
          getUpdatedFreightDetails(bookingRequest, value, freightDetail.SeqNr, fieldName),
        )(bookingRequest) as BookingRequest,
      );
  };

  useEffect(() => {
    setNumberOfContainersAndSets(bookingRequest ? getNumberOfContainersAndSets(bookingRequest) : [0, 0]);
  }, [bookingRequest]);

  useEffect(() => {
    freightDetails?.forEach(freightDetail => {
      handleChangeFreightDetails(
        freightDetail.Unit && bookingRequest && bookingRequest.containers
          ? getQuantity(
              bookingRequest?.containers,
              freightDetail.Unit,
              numberOfContainersAndSets,
              isQuantityAutomatic(freightDetail.Unit, containerTypeNames) || false,
            ) || freightDetail.Anz
          : freightDetail.Anz,
        'Anz',
        freightDetail,
      );
    });
  }, [bookingRequest?.containers, numberOfContainersAndSets]);

  useEffect(() => {
    switch (selectedTab) {
      case 0:
        freightDetails &&
          setFilteredFreightDetails(freightDetails.filter(detail => detail.Group !== FreightDetailGroup.INTERNAL2));
        break;
      case 1:
        freightDetails &&
          setFilteredFreightDetails(
            freightDetails.filter(detail => detail.Group === FreightDetailGroup.INTERNAL1 || detail.Internal1),
          );
        break;
      case 2:
        freightDetails &&
          setFilteredFreightDetails(freightDetails.filter(detail => detail.Group === FreightDetailGroup.INTERNAL2));
        break;
    }
  }, [selectedTab, freightDetails, setFilteredFreightDetails, bookingRequest]);

  const handleSelectDeselectAll = () => {
    if (filteredFreightDetails) {
      if (selectedDetails.length !== filteredFreightDetails.length) {
        setSelectedDetails(filteredFreightDetails.map(detail => detail.SeqNr));
      } else {
        setSelectedDetails([]);
      }
    }
  };

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedDetails(prevState =>
        selectedDetails.includes(id) ? [...prevState.filter(d => d !== id)] : [...prevState, id],
      );
    },
    [selectedDetails],
  );

  const onAdd = () => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(
        set(
          'freightDetails',
          (freightDetails || []).concat({
            SeqNr: freightDetails ? findNextPos(freightDetails) : '0',
            Anz: '0,00',
            Txt: (selectedTab !== 2 ? chargeCodes && chargeCodes[0].text : '') || '',
            Currency: 'USD',
            UnitValue: '0,00',
            Unit: '',
            Total: '0.00',
            Group:
              selectedTab === 0
                ? FreightDetailGroup.EXTERNAL
                : selectedTab === 1
                ? FreightDetailGroup.INTERNAL1
                : FreightDetailGroup.INTERNAL2,
          } as FreightDetail),
        )(bookingRequest) as BookingRequest,
      );
  };

  const onDelete = () => {
    bookingRequest &&
      setBookingRequest &&
      freightDetails &&
      setBookingRequest(
        set(
          'freightDetails',
          freightDetails.filter(detail => !selectedDetails.includes(detail.SeqNr)),
        )(bookingRequest) as BookingRequest,
      );
    setSelectedDetails([]);
  };

  return (
    <Fragment>
      <Grid item xs={12}>
        <TableContainer component={Paper} className={classes.tableWrapper}>
          {isDashboardUser(userRecord) && (
            <AppBar position="static">
              <Tabs value={selectedTab} onChange={handleTabChange} aria-label="simple tabs example">
                <Tab label="External" {...a11yProps(0)} />
                <Tab label="Internal 1" {...a11yProps(1)} />
                <Tab label="Internal 2" {...a11yProps(2)} />
              </Tabs>
            </AppBar>
          )}
          {editing && isDashboardUser(userRecord) && (
            <EnhancedTableToolbar
              numSelected={selectedDetails.length}
              handleAdd={onAdd}
              handleDelete={onDelete}
              labelWhenSelected={
                selectedDetails.length === 1
                  ? `${selectedDetails.length} details selected`
                  : `${selectedDetails.length} details selected`
              }
              labelWhenNotSelected={''}
              addTooltip={'Add new detail'}
              deleteTooltip={selectedDetails.length === 1 ? 'Delete detail' : 'Delete details'}
            />
          )}
          {filteredFreightDetails && filteredFreightDetails.length > 0 ? (
            <Table className={classes.table} size="small">
              <TableHead className={classes.tableHead}>
                <TableRow className={classes.tableRow}>
                  {editing && isDashboardUser(userRecord) && (
                    <TableCell align="left" style={{ paddingLeft: 4 }}>
                      <Checkbox
                        checked={selectedDetails.length === filteredFreightDetails.length}
                        onClick={handleSelectDeselectAll}
                        onFocus={event => event.stopPropagation()}
                        color="primary"
                      />
                    </TableCell>
                  )}
                  <TableCell>Description</TableCell>
                  <TableCell align={editing && isDashboardUser(userRecord) ? 'left' : 'right'}>Quantity</TableCell>
                  <TableCell align={editing && isDashboardUser(userRecord) ? 'left' : 'right'}>Currency</TableCell>
                  <TableCell align={editing && isDashboardUser(userRecord) ? 'left' : 'right'}>Cost Value</TableCell>
                  <TableCell align="left">Cost Unit</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFreightDetails.map(freightDetail => (
                  <BookingRequestFreightDetailsRow
                    freightDetail={freightDetail}
                    selected={freightDetail.SeqNr ? selectedDetails.includes(freightDetail.SeqNr) : false}
                    onSelectRow={event => onSelectRow(event, freightDetail.SeqNr)}
                    selectedTab={selectedTab}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="h3" className={classes.emptyState}>
              No Freight Details to show
            </Typography>
          )}
        </TableContainer>
      </Grid>
    </Fragment>
  );
};

interface Props {
  freightDetails?: FreightDetail[];
}

export default BookingRequestFreightDetails;
