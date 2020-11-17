import React, { ChangeEvent, useCallback, useContext, useMemo, useState } from 'react';
import PaymentOverviewTable from './PaymentOverviewTable';
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
import WeeklyPayment, { WeeklyPaymentStatus } from '../../model/WeeklyPayment';
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
import { changeWeeklyPayment } from '../bookings/accountingTab/AccountingWeeklyPayment';
import { addActivityItem } from '../bookings/checklist/ActivityLogContainer';
import { createActivityObject } from '../bookings/checklist/ChecklistItemRow';
import { addDays } from 'date-fns';
import PaymentOverviewDialog from './PaymentOverviewDialog';
import { showCrispChat } from '../../index';
import { Currency, DebitCredit } from '../../model/Payment';

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
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
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
      <MenuItem onClick={() => changePayment(-7)}>1 Week Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(7)}>1 Week Later</MenuItem>
    </Menu>
  );
};

const PaymentOverviewContainer = () => {
  const overviewData = usePaymentOverview(DebitCredit.DEBIT) as WeeklyPayment[];

  const [filters, setFilters] = useWeeklyPaymentFilterProviderContext();
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const carriers = useContext(Carriers);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openBooking, setOpenBooking] = useState<string | undefined>(undefined);

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

  const { currency, paymentDate, carrier, status } = filters;

  const classes = useStyles();

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onCurrencyChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      if (setFilters) setFilters(prevState => set('currency', event.target.value as Currency[])(prevState));
    },
    [setFilters],
  );
  const onStatusChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      if (setFilters) setFilters(prevState => set('status', event.target.value as WeeklyPaymentStatus[])(prevState));
    },
    [setFilters],
  );
  const handleDateChange = useCallback(
    (date: Date) => {
      if (setFilters) setFilters(prevState => set('paymentDate', startOfDay(date))(prevState));
      setDateOpen(false);
    },
    [setFilters],
  );

  const filteredOverviewData = useMemo(() => {
    return (overviewData || []).filter(
      data => currency.includes(data.currency) && (data.status ? status.includes(data.status) : true),
    );
  }, [overviewData, status, currency]);

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
      return Promise.all(
        filteredOverviewData
          .filter(payment => payment.id && selectedPayments && selectedPayments.indexOf(payment.id) > -1)
          .map(payment => {
            handleSelect(payment.id);
            return changeWeeklyPayment(payment.reference, { payDate: addDays(payment.payDate, offset) }).then(_ =>
              addActivityItem(
                payment.bookingId,
                createActivityObject({
                  changeType: ActivityChangeType.POSTPONE_PAYMENT,
                  by: getActivityLogUserData(),
                  isAccountingActivity: true,
                  paymentReference: payment.reference,
                }),
              ),
            );
          }),
      )
        .then(_ => {
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
        });
    },
    [filteredOverviewData, getActivityLogUserData, enqueueSnackbar, selectedPayments, handleSelect],
  );

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
              value={status}
              onChange={onStatusChange}
              input={<Input />}
              renderValue={selected => (selected as any[]).join(', ')}
              MenuProps={MenuProps}
            >
              {Object.entries(WeeklyPaymentStatus).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  <Checkbox checked={status.indexOf(value) > -1} />
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
              label="Payment Date"
            />
          </Box>
          <Box display="flex" style={{ minWidth: theme.spacing(35) }} className={classes.spacer}>
            <CarrierInput
              label={'Carriers'}
              carriers={carriers}
              onChange={carrier => {
                if (setFilters) setFilters(set('carrier', carrier)(filters));
              }}
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
        <PaymentOverviewTable
          overviewData={filteredOverviewData}
          selectedPayments={selectedPayments || []}
          handleSelect={handleSelect}
          handleOpenPreviewDialog={handleDialogOpen}
        />
        <PaymentOverviewDialog isOpen={isDialogOpen} handleClose={handleDialogClose} bookingId={openBooking} />
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewContainer;
