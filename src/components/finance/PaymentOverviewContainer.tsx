import React, { ChangeEvent, useCallback, useContext, useMemo, useState } from 'react';
import FinanceOverviewTable from './FinanceOverviewTable';
import usePaymentOverview from '../../hooks/usePaymentOverview';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import WeeklyPayment, {
  WeeklyPaymentApiAction,
  WeeklyPaymentPlatformStatus,
  WeeklyPaymentStatus,
  WeeklyPaymentStatusLabel,
} from '../../model/WeeklyPayment';
import { set } from 'lodash/fp';
import { useWeeklyPaymentFilterProviderContext } from '../../providers/WeeklyPaymentFilterProvider';
import DateInput from '../inputs/DateInput';
import { startOfDay } from 'date-fns/fp';
import CarrierInput from '../inputs/CarrierInput';
import theme from '../../theme';
import Carriers from '../../contexts/Carriers';
import UserRecordContext from '../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import { ActivityChangeType, ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';
import { addActivityItem } from '../bookings/checklist/ActivityLogContainer';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { addDays } from 'date-fns';
import PaymentOverviewDialog from './PaymentOverviewDialog';
import { showCrispChat } from '../../index';
import { Currency } from '../../model/Payment';
import useUser from '../../hooks/useUser';
import { GlobalContext } from '../../store/GlobalStore';
import { notEmpty } from '../../utilities/notEmpty';
import useCommissions from '../../hooks/useCommissions';
import Commission from '../../model/Commission';
import { useCommissionFilterProviderContext } from '../../providers/CommissionFilterProvider';
import { DateRange } from '../daterangepicker/types';
import Carrier from '../../model/Carrier';

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

interface PostponeMenuProps {
  anchorEl: any;
  handleClose: () => void;
  changePayment: (offset: number) => void;
}

const PostponeMenu: React.FC<PostponeMenuProps> = ({ anchorEl, handleClose, changePayment }) => {
  return (
    <Menu
      id="payment-overview-postpone-menu"
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={() => changePayment(-14)}>2 Weeks Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(-7)}>1 Week Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(7)}>1 Week Later</MenuItem>
      <MenuItem onClick={() => changePayment(14)}>2 Weeks Later</MenuItem>
    </Menu>
  );
};

const postponePayments = async (offset: number, user: any, weeklyPayment: WeeklyPayment[]) => {
  try {
    const token = await user.getIdToken();
    console.log('Postponing');
    const response = await fetch(`${process.env.REACT_APP_API_URL}/weeklyPayment`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        weeklyPayment.map(w => ({
          action: WeeklyPaymentApiAction.MOVE,
          recId: w.recId,
          reference: w.reference,
          payDate: addDays(w.payDate, offset),
        })),
      ),
    });

    if (response.ok) {
      const body = await response.json();
      console.log('Body', body);
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};

const PaymentOverviewContainer = () => {
  const overviewData = usePaymentOverview() as WeeklyPayment[];
  const commissions = useCommissions() as Commission[];
  const [filters, setFilters] = useWeeklyPaymentFilterProviderContext();
  const [, setCommissionsFilter] = useCommissionFilterProviderContext();
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const carriers = useContext(Carriers);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openBooking, setOpenBooking] = useState<string | undefined>(undefined);
  const [user] = useUser();
  const [, dispatch] = useContext(GlobalContext);

  // We only need to calculate the total for commissions with status "Open"
  // useEffect(() => {
  //     if (setCommissionsFilter)
  //       setCommissionsFilter(prevState =>
  //         set('commissionStatus', [CommissionStatus.OPEN] as CommissionStatus[])(prevState),
  //       );
  //   }, []);
  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
    setOpenBooking(undefined);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(
    (bookingId: string) => {
      showCrispChat(false);
      setIsDialogOpen(true);
      setOpenBooking(bookingId);
    },
    [setIsDialogOpen],
  );

  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();

  const { currency, paymentDate, carrier, status, platformStatus } = filters;
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    status ? status.map(status => status.toString()).concat(platformStatus as string[]) : [],
  );

  const classes = useStyles();

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onCurrencyChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      if (setFilters) {
        setFilters(prevState => set('currency', event.target.value as Currency[])(prevState));
      }
      if (setCommissionsFilter) {
        setCommissionsFilter(prevState => set('currency', event.target.value as Currency[])(prevState));
      }
    },
    [setFilters],
  );

  const onCarrierChange = useCallback(
    (carrier: Carrier | null | undefined) => {
      if (setFilters) {
        setFilters(prevState => set('carrier', carrier)(prevState));
      }
      if (setCommissionsFilter) {
        setCommissionsFilter(prevState => set('carriers', [carrier])(prevState));
      }
    },
    [setFilters],
  );

  const onStatusChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      const newSelectedValues = event.target.value as string[];
      setSelectedStatuses(newSelectedValues);

      if (setFilters) {
        const platformStatuses = newSelectedValues.filter(status =>
          Object.values(WeeklyPaymentPlatformStatus).includes(status as WeeklyPaymentPlatformStatus),
        );
        const paymentStatuses = newSelectedValues.filter(status =>
          Object.values(WeeklyPaymentStatus).includes(status as WeeklyPaymentStatus),
        );

        setFilters(prevState =>
          set('platformStatus', platformStatuses.length > 0 ? platformStatuses : undefined)(prevState),
        );

        setFilters(prevState => set('status', paymentStatuses.length > 0 ? paymentStatuses : undefined)(prevState));
      }
    },
    [setFilters],
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      if (setFilters) {
        setFilters(prevState => set('paymentDate', startOfDay(date))(prevState));
      }
      if (setCommissionsFilter) {
        setCommissionsFilter(prevState =>
          set('dateRange', { startDate: startOfDay(date), endDate: startOfDay(date) } as DateRange)(prevState),
        );
      }
      setDateOpen(false);
    },
    [setFilters, setCommissionsFilter],
  );

  const filteredOverviewData = useMemo(() => {
    return (overviewData || []).filter(
      data =>
        currency.includes(data.currency) &&
        selectedStatuses &&
        selectedStatuses.length > 0 &&
        (data.platformStatus
          ? platformStatus && platformStatus.includes(data.platformStatus)
          : selectedStatuses.includes(data.status)),
    );
  }, [overviewData, status, platformStatus, currency, selectedStatuses]);

  const relevantBookingIds = filteredOverviewData.map(weeklyPayment => weeklyPayment.bookingId);
  const relevantCommissions = commissions
    ? commissions.filter(commission => relevantBookingIds.includes(commission.bookingId))
    : [];

  const handleSelect = useCallback(
    (paymentId: string | undefined) => {
      const updatedSelectedPayments = paymentId
        ? selectedPayments.findIndex(pid => pid === paymentId) > -1
          ? selectedPayments.filter(pid => pid !== paymentId)
          : [...selectedPayments, paymentId]
        : undefined;
      if (updatedSelectedPayments) setSelectedPayments(updatedSelectedPayments);
    },
    [selectedPayments],
  );

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const handleChangePayDates = useCallback(
    (offset: number) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      const selectedPaymentsObjects = filteredOverviewData.filter(
        payment => payment.id && selectedPayments && selectedPayments.indexOf(payment.id) > -1,
      );

      return Promise.resolve(postponePayments(offset, user, selectedPaymentsObjects))
        .then(() => {
          return Promise.all(
            selectedPaymentsObjects.map(payment => {
              const dateBeforeChange = payment.payDate;
              return addActivityItem(
                payment.bookingId,
                createActivityObject({
                  changeType: ActivityChangeType.POSTPONE_PAYMENT,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentActivityData: {
                    paymentReference: payment.reference,
                    dateBeforeChange: dateBeforeChange,
                    dateAfterChange: addDays(dateBeforeChange, offset),
                  },
                }),
              );
            }),
          );
        })
        .then(_ => {
          dispatch({ type: 'STOP_GLOBAL_LOADING' });

          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1500,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        })
        .finally(() => setSelectedPayments([]));
    },
    [filteredOverviewData, getActivityLogUserData, enqueueSnackbar, selectedPayments, handleSelect, user, dispatch],
  );

  const selectDeselectAll = () => {
    if (filteredOverviewData && selectedPayments.length !== filteredOverviewData.length) {
      setSelectedPayments(filteredOverviewData.map(data => data.id).filter(notEmpty));
    } else {
      setSelectedPayments([]);
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" display="inline">
              Weekly Payment
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <Box display="flex" flexDirection="row">
          <FormControl className={classes.formControl}>
            <InputLabel id="currency-select">Currency</InputLabel>
            <Select
              labelId="currency-select"
              id="currency-select-checkbox"
              multiple
              value={currency}
              onChange={onCurrencyChange}
              input={<Input />}
              renderValue={selected => (selected as any[]).join(', ')}
              MenuProps={MenuProps}
            >
              {Object.entries(Currency).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  <Checkbox checked={currency.indexOf(value) > -1} />
                  <ListItemText primary={value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="status-select">Status</InputLabel>
            <Select
              labelId="status-select"
              id="status-select-checkbox"
              multiple
              value={selectedStatuses}
              onChange={onStatusChange}
              input={<Input />}
              renderValue={selected =>
                (selected as any[]).map(s => ((s as string) === 'Blocked' ? 'Approved' : (s as string))).join(', ')
              }
              MenuProps={MenuProps}
            >
              {Object.entries(WeeklyPaymentStatusLabel).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  <Checkbox checked={selectedStatuses.includes(key)} />
                  <ListItemText primary={value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className={classes.spacer}>
            <DateInput
              value={paymentDate}
              onChange={handleDateChange}
              open={dateOpen}
              onOpen={() => setDateOpen(true)}
              onClose={() => setDateOpen(false)}
              label="Payment Date"
            />
          </Box>
          <Box display="flex" style={{ minWidth: theme.spacing(35) }} className={classes.spacer}>
            <CarrierInput
              label={'Carriers'}
              carriers={carriers}
              onChange={carrier => onCarrierChange(carrier)}
              value={carrier}
            />
          </Box>
          <Button
            onClick={handleClickMenu}
            color="primary"
            variant="outlined"
            disabled={!(filteredOverviewData && filteredOverviewData.length > 0) || selectedPayments.length === 0}
            style={{ marginBottom: theme.spacing(1) }}
          >
            Postpone Selected Payments
          </Button>
          <PostponeMenu
            anchorEl={anchorEl}
            handleClose={handleClose}
            changePayment={offset => handleChangePayDates(offset)}
          />
        </Box>
        <FinanceOverviewTable
          overviewData={filteredOverviewData}
          selectedPayments={selectedPayments || []}
          handleSelect={handleSelect}
          handleOpenPreviewDialog={handleDialogOpen}
          handleSelectDeselectAll={selectDeselectAll}
          commissionsForWeeklyPayments={relevantCommissions}
          isWeeklyPaymentOverview={true}
        />
        {isDialogOpen && (
          <PaymentOverviewDialog isOpen={isDialogOpen} handleClose={handleDialogClose} bookingId={openBooking} />
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewContainer;
