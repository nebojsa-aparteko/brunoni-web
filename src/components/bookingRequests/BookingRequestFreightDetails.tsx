import { makeStyles, Theme } from '@material-ui/core/styles';
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest, emptyFreightDetail, FreightDetail } from '../../model/BookingRequest';
import ChargeCodeInput from '../inputs/ChargeCodeInput';
import { cloneDeep, flow, get, set, uniq } from 'lodash/fp';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import TableContainer from '@material-ui/core/TableContainer';
import ChargeCodes from '../../contexts/ChargeCodes';
import { a11yProps } from '../../pages/BookingsPage';
import { CarrierId, FreightDetailGroup } from '../../model/Booking';
import { isDashboardUser } from '../../model/UserRecord';
import UserRecordContext from '../../contexts/UserRecordContext';
import Container from '../../model/Container';
import ContainerDetails from '../../model/ContainerDetails';
import ContainerTypes from '../../contexts/ContainerTypes';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import CloseIcon from '@material-ui/icons/Close';
import useModal from '../../hooks/useModal';
import SearchIcon from '@material-ui/icons/Search';
import { Quote } from '../../providers/QuoteGroupsProvider';
import firebase from '../../firebase';
import QuickSearchQuotePreview from '../quickSearch/QuickSearchQuotePreview';
import { Alert } from '@material-ui/lab';
import { formatCurrencyAmount } from '../../utilities/currencyFormatter';
import ControlPointDuplicateIcon from '@material-ui/icons/ControlPointDuplicate';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ActingAs from '../../contexts/ActingAs';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { calculateContainers, onContainersChange, takeQuoteDetails } from '../onlineBooking/Summary';
import EditingInput from '../EditingInput';
import useNormalizeQuote from '../../hooks/useNormalizedQuote';
import theme from '../../theme';
import CurrencyInput from '../inputs/CurrencyInput';
import { useFormContext } from 'react-hook-form';
import useUser from '../../hooks/useUser';
import { useIsEligibleForQuote } from '../../hooks/useIsEligibleForQuote';

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
  draggingTableRow: {
    '& td': {
      whiteSpace: 'nowrap',
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
    background: 'rgba(245,245,245, 0.75)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  emptyState: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  content: {
    margin: theme.spacing(3),
  },
  formControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  searchInput: {
    flex: 1,
  },
}));

interface RowProps {
  freightDetail: FreightDetail;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  selectedTab: number;
  index: number;
}

// const checkIfPercent = (freightDetail: FreightDetail) => freightDetail.Unit?.trim() === '%';

const getUpdatedFreightDetails = (
  bookingRequest: BookingRequest,
  value: any | undefined,
  pos: number,
  field: string,
) => {
  if (bookingRequest.freightDetails) {
    const index = bookingRequest.freightDetails?.findIndex(value1 => value1.SeqNr === pos);
    if (index < 0) return bookingRequest.freightDetails;
    let d = bookingRequest.freightDetails[index];
    d = set(field, value === '' ? undefined : field === 'Anz' || field === 'UnitValue' ? parseFloat(value) : value)(d);
    bookingRequest.freightDetails[index] = flow(set(field, get(field)(d)), set('Total', calculateTotal(d)))(d);
  }
  return bookingRequest.freightDetails;
};

//inputs use an empty string instead of undefined so we need to compare those values as equal to avoid warnings
const compareValues = (value1: string | number | undefined, value2: string | number | undefined) =>
  (value1 ? value1 : '') !== (value2 ? value2 : '');

const automaticCostUnits = ['PER CONTAINER', 'PRO CONTAINER', 'PRO TEU', 'PER TEU'];
export const isQuantityAutomatic = (costUnit: string, containerTypeNames: string[] | undefined) =>
  automaticCostUnits.some(unit => unit.toUpperCase() === costUnit.toUpperCase()) ||
  containerTypeNames?.some(
    containerName =>
      'PRO ' + containerName.toUpperCase() === costUnit.toUpperCase() ||
      'PER ' + containerName.toUpperCase() === costUnit.toUpperCase(),
  );

const isAgencyCommission = (freightDetail: FreightDetail) => freightDetail.Txt === 'Agency Commission';

export const calculateTotal = (freightDetail: FreightDetail) =>
  freightDetail.Unit && freightDetail.Unit === '%'
    ? ((freightDetail.Anz || 0) * (freightDetail.UnitValue || 0)) / 100
    : (freightDetail.Anz || 0) * (freightDetail.UnitValue || 0);

const BookingRequestFreightDetailsRow: React.FC<RowProps> = ({
  freightDetail,
  selected,
  onSelectRow,
  selectedTab,
  index,
}) => {
  const classes = useStyles();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const userRecord = useContext(UserRecordContext);
  const containerTypes = useContext(ContainerTypes);
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const invisible = useMemo(
    () =>
      selectedTab === 0 && (freightDetail.Group === FreightDetailGroup.INTERNAL2 || isAgencyCommission(freightDetail)),
    [freightDetail, selectedTab],
  );
  const [quantity, setQuantity] = useState<number | undefined>(freightDetail.Anz || 0);
  const [unitValue, setUnitValue] = useState<number | undefined>(freightDetail.UnitValue);
  const [costUnit, setCostUnit] = useState<string | undefined>(freightDetail.Unit);
  const [chargeCodeText, setChargeCodeText] = useState<string | undefined>(freightDetail.Unit);
  const [containerTypeNames, setContainerTypeNames] = useState(
    containerTypes?.map(containerType => containerType.name),
  );
  const [isQAutomatic, setIsQAutomatic] = useState(
    (costUnit && containerTypes && isQuantityAutomatic(costUnit, containerTypeNames)) || false,
  );
  useEffect(() => {
    const newContainerTypeNames = containerTypes?.map(containerType => containerType.name);
    setContainerTypeNames(newContainerTypeNames);
    setIsQAutomatic(
      (freightDetail.Unit && newContainerTypeNames && isQuantityAutomatic(freightDetail.Unit, newContainerTypeNames)) ||
        false,
    );
  }, [containerTypes, freightDetail.Unit]);

  useEffect(() => {
    setQuantity(freightDetail.Anz);
    setUnitValue(freightDetail.UnitValue);
    setCostUnit(freightDetail.Unit);
    setChargeCodeText(freightDetail.Txt);
  }, [freightDetail]);

  // const handleChangeChargeCode = (code: ChargeCode | undefined) => {
  //   handleChangeFreightDetails(code?.text, 'Txt');
  //   handleChangeFreightDetails(code?.chargeCodeId, 'ChargeID');
  // };

  const handleChangeFreightDetails = (value: any | undefined, fieldName: string) => {
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
    <Draggable
      key={freightDetail.SeqNr}
      draggableId={freightDetail.SeqNr + ''}
      index={index}
      isDragDisabled={!editing || selectedTab === 1 || invisible}
    >
      {(draggableProvided: DraggableProvided, snapshot: DraggableStateSnapshot) =>
        invisible ? (
          <tr
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            {...draggableProvided.dragHandleProps}
          />
        ) : (
          <TableRow
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            {...draggableProvided.dragHandleProps}
            className={snapshot.isDragging ? classes.draggingTableRow : classes.tableRow}
          >
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
              <EditingInput
                editing={editing}
                inputProps={{
                  name: 'Anz',
                  type: 'number',
                  onChange: event => setQuantity(event.target.value ? parseFloat(event.target.value) : 0),
                  onBlur: event => handleChangeFreightDetails(event.target.value, event.target.name),
                }}
                value={
                  costUnit && bookingRequest && bookingRequest.containers && isQAutomatic ? freightDetail.Anz : quantity
                }
                canEdit={isDashboardUser(userRecord) && !isQAutomatic}
              />
              {/*{editing && isDashboardUser(userRecord) && !isQAutomatic ? (*/}
              {/*  <TextField*/}
              {/*    name="Anz"*/}
              {/*    label=""*/}
              {/*    margin="dense"*/}
              {/*    variant="outlined"*/}
              {/*    fullWidth*/}
              {/*    // disabled={isQAutomatic}*/}
              {/*    type="number"*/}
              {/*    value={*/}
              {/*      costUnit && bookingRequest && bookingRequest.containers && isQAutomatic*/}
              {/*        ? freightDetail.Anz*/}
              {/*        : quantity*/}
              {/*    }*/}
              {/*    onChange={event => setQuantity(event.target.value ? parseFloat(event.target.value) : 0)}*/}
              {/*    onBlur={event => handleChangeFreightDetails(event.target.value, 'Anz')}*/}
              {/*  />*/}
              {/*) : freightDetail.Anz ? (*/}
              {/*  formatCurrencyAmount(freightDetail.Anz)*/}
              {/*) : (*/}
              {/*  '0,00'*/}
              {/*)}*/}
            </TableCell>
            <TableCell align="right">
              {editing && isDashboardUser(userRecord) ? (
                <CurrencyInput
                  value={freightDetail.Currency || ''}
                  onChange={value => handleChangeFreightDetails(value, 'Currency')}
                  margin="dense"
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
                  value={unitValue || ''}
                  onChange={event =>
                    setUnitValue(
                      event.target.value && event.target.value !== '' ? parseFloat(event.target.value) : undefined,
                    )
                  }
                  onBlur={event => handleChangeFreightDetails(event.target.value, 'UnitValue')}
                />
              ) : (
                freightDetail.UnitValue && formatCurrencyAmount(freightDetail.UnitValue)
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
            <TableCell>{freightDetail.Total ? formatCurrencyAmount(freightDetail.Total) : '0,00'}</TableCell>
            {editing && isAdmin && selectedTab === 0 && (
              <TableCell>
                <IconButton
                  aria-label="Copy to internal1"
                  onClick={() => handleChangeFreightDetails(freightDetail.Internal1 ? undefined : true, 'Internal1')}
                >
                  {freightDetail.Internal1 ? (
                    <DoneAllIcon style={{ color: '#F7BC06' }} />
                  ) : (
                    <ControlPointDuplicateIcon />
                  )}
                </IconButton>
              </TableCell>
            )}
          </TableRow>
        )
      }
    </Draggable>
  );
};

const findNextPos = (freightDetails: FreightDetail[]) => {
  //TODO probably needs to be edited because of concurrency
  let pos = 0;
  for (let i in freightDetails) {
    const value = freightDetails[i].SeqNr;
    if (value >= pos) pos = value + 1;
  }
  return pos;
};

const sortBySeqNr = (a: FreightDetail, b: FreightDetail) => {
  const aSeq = +a.SeqNr;
  const bSeq = +b.SeqNr;
  if (aSeq > bSeq) return 1;
  if (aSeq < bSeq) return -1;
  return 0;
};

export const generateCommission = (
  schedule: RouteSearchResult | undefined,
  freightDetails: FreightDetail[] | undefined,
  carrierId?: string,
  containers?: (Container & ContainerDetails)[],
) => {
  const seaFreightDetails = freightDetails?.filter(
    (detail: FreightDetail) =>
      detail.Txt === 'Seafreight' || detail.Txt === 'Seefracht' || detail.Txt === 'Fret Maritime',
  );
  const seaFreightTotal = seaFreightDetails?.reduce((a, b) => a + (b?.Total || 0), 0);
  const isHMM = carrierId && carrierId === CarrierId.HMM;
  const isPercent = schedule?.ComPercentE
    ? parseFloat(schedule?.ComPercentE) !== 0
    : schedule?.ComPercentI
    ? parseFloat(schedule?.ComPercentI) !== 0
    : false;
  const quantity = isPercent
    ? isHMM
      ? 5
      : schedule?.ComPercentE
      ? parseFloat(schedule?.ComPercentE)
      : schedule?.ComPercentI
      ? parseFloat(schedule?.ComPercentI)
      : 0
    : calculateContainers(containers).TEU || 1;
  const value =
    seaFreightDetails && seaFreightDetails.length > 0 && isPercent
      ? seaFreightTotal || 0
      : (schedule?.ComAmountE1 &&
          seaFreightDetails &&
          seaFreightDetails.length > 0 &&
          seaFreightDetails[0]?.Currency === schedule?.ComCurE1 &&
          parseFloat(schedule?.ComAmountE1)) ||
        (schedule?.ComAmountE2 &&
          seaFreightDetails &&
          seaFreightDetails.length > 0 &&
          seaFreightDetails[0]?.Currency === schedule?.ComCurE2 &&
          parseFloat(schedule?.ComAmountE2)) ||
        0;
  return seaFreightDetails && seaFreightDetails.length > 0
    ? ({
        SeqNr: freightDetails ? findNextPos(freightDetails) : 0,
        Anz: quantity,
        Txt: 'Agency Commission',
        Currency: seaFreightDetails[0].Currency,
        UnitValue: -value,
        Unit: isPercent ? '%' : 'per TEU',
        Total: -(isPercent ? ((quantity || 1) * (value || 0)) / 100 : (quantity || 1) * (value || 0)),
        Group: FreightDetailGroup.INTERNAL1,
      } as FreightDetail)
    : undefined;
};

export const getRelatedQuotes = async (bookingRequest: BookingRequest) => {
  let query = (await firebase.firestore().collection('quotes')) as firebase.firestore.Query;
  if (bookingRequest.carrier?.name) {
    query = query.where('carrier', '==', bookingRequest.carrier?.name);
  }
  if (bookingRequest.client?.id) {
    query = query.where('clientId', '==', bookingRequest.client?.id);
  }
  if (bookingRequest.origin?.id) {
    query = query.where('origin', '==', bookingRequest.origin?.id);
  }
  if (bookingRequest.destination?.id) {
    query = query.where('destination', '==', bookingRequest.destination?.id);
  }

  const quotesRef = await query
    .orderBy('dateIssued', 'desc')
    .limit(10)
    .get();

  return [quotesRef, uniq(bookingRequest.containers?.map(d => d.containerType?.id)) as string[]];
};

const BookingRequestFreightDetails: React.FC<Props> = ({ freightDetails, showWarningMessage }) => {
  const classes = useStyles();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const chargeCodes = useContext(ChargeCodes);
  const { isOpen, closeModal, openModal } = useModal();
  const [filteredFreightDetails, setFilteredFreightDetails] = useState<FreightDetail[] | undefined>(freightDetails);
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();

  const [selectedDetails, setSelectedDetails] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const userRecord = useContext(UserRecordContext);

  const containers = useMemo(() => calculateContainers(bookingRequest?.containers), [bookingRequest?.containers]);

  useEffect(() => {
    setBookingRequest(prevState =>
      prevState.freightDetails
        ? set('freightDetails', onContainersChange(containers, prevState.freightDetails))(prevState)
        : prevState,
    );
  }, [containers]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    event.stopPropagation();
    setSelectedTab(newValue);
  };

  useEffect(() => {
    switch (selectedTab) {
      case 0:
        freightDetails &&
          setFilteredFreightDetails(
            freightDetails
              // .filter(detail => detail.Group !== FreightDetailGroup.INTERNAL2 && detail.Txt !== 'Agency Commission')
              .sort(sortBySeqNr),
          );
        break;
      case 1:
        freightDetails &&
          setFilteredFreightDetails(
            freightDetails
              .filter(detail => detail.Group === FreightDetailGroup.INTERNAL1 || detail.Internal1)
              .sort(sortBySeqNr),
          );
        break;
      case 2:
        freightDetails &&
          setFilteredFreightDetails(
            freightDetails.filter(detail => detail.Group === FreightDetailGroup.INTERNAL2).sort(sortBySeqNr),
          );
        break;
    }
  }, [selectedTab, freightDetails, bookingRequest]);

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
    (event: React.MouseEvent<HTMLElement>, id: number) => {
      event.stopPropagation();
      setSelectedDetails(prevState =>
        selectedDetails.includes(id) ? [...prevState.filter(d => d !== id)] : [...prevState, id],
      );
    },
    [selectedDetails],
  );
  const selectedGroup = useMemo(
    () =>
      selectedTab === 0
        ? FreightDetailGroup.EXTERNAL
        : selectedTab === 1
        ? FreightDetailGroup.INTERNAL1
        : FreightDetailGroup.INTERNAL2,
    [selectedTab],
  );
  const onAdd = useCallback(() => {
    setBookingRequest(prevState =>
      set(
        'freightDetails',
        (freightDetails || []).concat({
          ...emptyFreightDetail,
          SeqNr: freightDetails ? findNextPos(freightDetails) : 0,
          Txt: (selectedGroup !== FreightDetailGroup.INTERNAL2 ? chargeCodes?.[0].text : '') || '',
          Group: selectedGroup,
        } as FreightDetail),
      )(prevState!),
    );
  }, [setBookingRequest, freightDetails, selectedGroup, chargeCodes]);

  const onDelete = useCallback(() => {
    setBookingRequest(prevState =>
      set(
        'freightDetails',
        freightDetails?.filter(detail => !selectedDetails.includes(detail.SeqNr)),
      )(prevState!),
    );
    setSelectedDetails([]);
  }, [selectedDetails]);

  const handleDragEnd = (result: DropResult, _?: ResponderProvided) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }
    const destinationFD = freightDetails && freightDetails[result.destination!.index];
    const originFD = freightDetails && freightDetails[result.source!.index];

    setBookingRequest(prevState => {
      if (!prevState || !prevState.freightDetails) return prevState;
      const destinationIndex = prevState.freightDetails.findIndex(detail => detail === destinationFD);
      const originIndex = prevState.freightDetails.findIndex(detail => detail === originFD);
      if (destinationIndex < 0 || originIndex < 0 || destinationIndex === originIndex) return prevState;
      const temp = prevState.freightDetails ? cloneDeep(prevState.freightDetails) : [];
      const [sourceDetail] = temp.splice(result.source.index, 1);
      temp.splice(destinationIndex, 0, sourceDetail);
      return set(
        'freightDetails',
        temp.map((detail, index) => ({ ...detail, SeqNr: index + 1 + '' })),
      )(prevState);
    });

    setSelectedDetails([]);
  };

  return (
    <Fragment>
      <Grid item xs={12}>
        <TableContainer
          component={Box}
          className={classes.tableWrapper}
          style={{ border: showWarningMessage ? '4px solid #ff604f' : '' }}
        >
          {showWarningMessage && (
            <Typography color={'error'} variant={'h4'} style={{ whiteSpace: 'pre-line', padding: theme.spacing(1) }}>
              {'This is an approximation of freight details. Please check.'}
            </Typography>
          )}
          {isDashboardUser(userRecord) && (
            <AppBar
              position="static"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Tabs value={selectedTab} onChange={handleTabChange} aria-label="simple tabs example">
                <Tab label="External" {...a11yProps(0)} />
                <Tab label="Internal 1" {...a11yProps(1)} />
                <Tab label="Internal 2" {...a11yProps(2)} />
              </Tabs>
              {editing && (
                <IconButton onClick={openModal}>
                  <ImportContactsIcon style={{ color: 'white' }} />
                </IconButton>
              )}
            </AppBar>
          )}
          {isOpen && (
            <QuotePickerModal
              isOpen={isOpen}
              handleClose={closeModal}
              setBookingRequest={setBookingRequest}
              // @ts-ignore
              fetchQuotes={() => getRelatedQuotes(bookingRequest!)}
            />
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
              addButtonLabel={'Add new detail'}
              deleteButtonLabel={selectedDetails.length === 1 ? 'Delete detail' : 'Delete details'}
            />
          )}
          {filteredFreightDetails && filteredFreightDetails.length > 0 ? (
            <Table className={classes.table} size="small">
              <colgroup>
                {editing && <col style={{ width: '3%' }} />}
                <col style={{ width: '30%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '2%' }} />
              </colgroup>
              <TableHead className={classes.tableHead}>
                <TableRow className={classes.tableRow}>
                  {editing && isDashboardUser(userRecord) && (
                    <TableCell align="left" style={{ paddingLeft: 4 }}>
                      <Checkbox
                        checked={
                          filteredFreightDetails.length === 0
                            ? false
                            : selectedDetails.length === filteredFreightDetails.length
                        }
                        onClick={handleSelectDeselectAll}
                        onFocus={event => event.stopPropagation()}
                        disabled={filteredFreightDetails.length === 0}
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
                  {editing && isAdmin && selectedTab === 0 && <TableCell>Internal</TableCell>}
                </TableRow>
              </TableHead>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppable" direction="vertical">
                  {(droppableProvided: DroppableProvided) => (
                    <TableBody ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                      {filteredFreightDetails.map((freightDetail, index) => (
                        <BookingRequestFreightDetailsRow
                          key={index}
                          freightDetail={freightDetail}
                          selected={freightDetail.SeqNr ? selectedDetails.includes(freightDetail.SeqNr) : false}
                          onSelectRow={event => onSelectRow(event, freightDetail.SeqNr)}
                          selectedTab={selectedTab}
                          index={index}
                        />
                      ))}
                      {droppableProvided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </DragDropContext>
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
  showWarningMessage?: boolean;
}

export default BookingRequestFreightDetails;

export const QuotePickerModal: React.FC<ModalProps> = ({
  isOpen,
  handleClose,
  setBookingRequest,
  fetchQuotes,
  isOnlineBookingProcess = false,
}) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState<Quote | undefined | null>();
  const [fetchedResults, setFetchedResults] = useState<Quote[] | undefined>();
  const chargeCodes = useContext(ChargeCodes);

  const isEligibleForQuote = useIsEligibleForQuote();

  const normalize = useNormalizeQuote();

  const form = useFormContext();

  const setValue = form?.setValue;

  const handleQuoteSearch = useCallback(() => {
    firebase
      .firestore()
      .collection('quotes')
      .doc(inputValue)
      .get()
      .then(doc => {
        const quote = normalize(doc.data()) as Quote;
        if (doc.exists && isEligibleForQuote(quote)) {
          setSearchResult(quote);
          return;
        }
        setSearchResult(null);
      });
  }, [inputValue, normalize]);

  const handleSelectQuote = useCallback(
    (searchResult: Quote) => {
      if (isOnlineBookingProcess) {
        setBookingRequest((prevState: any) => set('containers', searchResult.containers)(prevState as BookingRequest));
        setBookingRequest((prevState: any) => set('quoteNumber', searchResult.id)(prevState as BookingRequest));
        setBookingRequest((prevState: any) =>
          set('quoteDetails', searchResult.quoteDetails)(prevState as BookingRequest),
        );
        setValue('quoteNumber', searchResult.id);
      } else {
        setBookingRequest((prevState: any) =>
          set(
            'freightDetails',
            takeQuoteDetails(searchResult?.quoteDetails!, [], chargeCodes),
          )(prevState as BookingRequest),
        );
      }
      handleClose();
    },
    [isOnlineBookingProcess, setBookingRequest, handleClose, setValue, chargeCodes],
  );

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Box>
        <DialogTitle disableTypography>
          <Typography variant="h4">Pick a quote</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Box py={1}>
              <FormControl className={classes.formControl}>
                <TextField
                  autoFocus
                  id={`input-quote`}
                  label="Quote Nr."
                  margin="normal"
                  variant="outlined"
                  value={inputValue}
                  className={classes.searchInput}
                  onChange={event => setInputValue(event.target.value)}
                />
                <IconButton
                  aria-label="delete"
                  color="primary"
                  onClick={handleQuoteSearch}
                  disabled={inputValue === ''}
                >
                  <SearchIcon />
                </IconButton>
              </FormControl>
              {searchResult ? (
                <Box onClick={() => handleSelectQuote(searchResult)} mx={-1}>
                  <QuickSearchQuotePreview quote={searchResult} />
                </Box>
              ) : searchResult === null ? (
                <Alert severity="error">There is no quote with this ID</Alert>
              ) : null}
            </Box>
            <Divider />
            <Box display="flex" flexDirection="column" py={1}>
              {fetchedResults ? (
                fetchedResults.length === 0 ? (
                  <Alert severity="warning">There are no quotes with booking request criteria.</Alert>
                ) : (
                  fetchedResults.map(doc => (
                    <Box onClick={() => handleSelectQuote(doc)} mx={-1} key={doc.id}>
                      <QuickSearchQuotePreview quote={doc} />
                    </Box>
                  ))
                )
              ) : (
                <Typography gutterBottom style={{ textAlign: 'center' }}>
                  Want to see more quotes with similar charges.
                </Typography>
              )}
              {!fetchedResults && (
                <Button
                  color="primary"
                  onClick={async () => {
                    const [snapshot, containers] = await fetchQuotes();
                    let docs = snapshot.docs.map(d => normalize(d.data()) as Quote);
                    //todo. Check if we should set containers on booking req if containers are defined.
                    if (!isOnlineBookingProcess) {
                      docs = docs.filter(d => d.containers.some(c => containers.includes(c.containerType?.id || '')));
                    }
                    setFetchedResults(docs);
                  }}
                >
                  Load quotes
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <Divider />
      </Box>
    </Dialog>
  );
};

interface ModalProps {
  isOpen: boolean;
  handleClose: () => void;
  setBookingRequest:
    | React.Dispatch<React.SetStateAction<BookingRequest>>
    | React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
  fetchQuotes: () => Promise<[firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>, string[]]>;
  isOnlineBookingProcess?: boolean;
}
