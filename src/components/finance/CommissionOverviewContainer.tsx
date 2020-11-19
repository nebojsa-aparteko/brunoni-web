import React, { ChangeEvent, useCallback, useContext, useMemo, useState } from 'react';
import PaymentOverviewTable from './PaymentOverviewTable';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
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
import { set } from 'lodash/fp';
import DateInput from '../inputs/DateInput';
import { startOfDay } from 'date-fns/fp';
import CarrierInput from '../inputs/CarrierInput';
import theme from '../../theme';
import Carriers from '../../contexts/Carriers';
import PaymentOverviewDialog from './PaymentOverviewDialog';
import { showCrispChat } from '../../index';
import { Currency } from '../../model/Payment';
import { CommissionStatus } from '../../model/Commission';
import useCommissions from '../../hooks/useCommissions';
import { useCommissionFilterProviderContext } from '../../providers/CommissionFilterProvider';

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

const CommissionOverviewContainer = () => {
  const overviewData = useCommissions();

  const [filters, setFilters] = useCommissionFilterProviderContext();
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const carriers = useContext(Carriers);
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

  const { currency, dueDate, carrier, commissionStatus } = filters;

  const classes = useStyles();

  const onCurrencyChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      setFilters(prevState => set('currency', event.target.value as Currency[])(prevState));
    },
    [setFilters],
  );
  const onStatusChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      setFilters(prevState => set('commissionStatus', event.target.value as CommissionStatus[])(prevState));
    },
    [setFilters],
  );
  const handleDateChange = useCallback(
    (date: Date) => {
      setFilters(prevState => set('dueDate', startOfDay(date))(prevState));
      setDateOpen(false);
    },
    [setFilters],
  );

  const filteredOverviewData = useMemo(() => {
    return (overviewData || []).filter(
      data => currency.includes(data.currency) && (data.status ? commissionStatus.includes(data.status) : true),
    );
  }, [overviewData, commissionStatus, currency]);

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h3" display="inline">
              Commissions
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
              value={commissionStatus}
              onChange={onStatusChange}
              input={<Input />}
              renderValue={selected => (selected as any[]).join(', ')}
              MenuProps={MenuProps}
            >
              {Object.entries(CommissionStatus).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  <Checkbox checked={commissionStatus.indexOf(value) > -1} />
                  <ListItemText primary={value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className={classes.spacer}>
            <DateInput
              value={dueDate}
              onChange={handleDateChange}
              open={dateOpen}
              onOpen={() => setDateOpen(true)}
              label="Commission Date"
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
        </Box>
        <PaymentOverviewTable overviewData={filteredOverviewData} handleOpenPreviewDialog={handleDialogOpen} />
        <PaymentOverviewDialog isOpen={isDialogOpen} handleClose={handleDialogClose} bookingId={openBooking} />
      </CardContent>
    </Card>
  );
};

export default CommissionOverviewContainer;
