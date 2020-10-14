import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PaymentOverviewTable from './PaymentOverviewTable';
import usePaymentOverview from '../../hooks/usePaymentOverview';
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
  MenuItem,
  Select,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Currency } from '../../model/WeeklyPayment';
import { set } from 'lodash/fp';
import { useWeeklyPaymentFilterProviderContext } from '../../providers/WeeklyPaymentFilterProvider';
import DateInput from '../inputs/DateInput';
import { startOfDay } from 'date-fns/fp';
const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    // maxWidth: 300,
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
const PaymentOverviewContainer = () => {
  const overviewData = usePaymentOverview();
  const [filters, setFilters] = useWeeklyPaymentFilterProviderContext();
  const [dateOpen, setDateOpen] = useState<boolean>(false);

  const { currency, paymentDate } = filters;

  const classes = useStyles();

  const onCurrencyChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => {
      if (setFilters) setFilters(prevState => set('currency', event.target.value as Currency[])(prevState));
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
  const filteredOverviewData = useMemo(() => (overviewData || []).filter(data => currency.includes(data.currency)), [
    overviewData,
    currency,
  ]);

  useEffect(() => {
    filteredOverviewData?.forEach(e => console.log(e.amount, e.reference));
    console.log('PayDate', paymentDate);
  }, [filteredOverviewData, paymentDate]);
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
        <DateInput
          value={paymentDate}
          onChange={handleDateChange}
          open={dateOpen}
          onOpen={() => setDateOpen(true)}
          label="Payment Date"
        />
        <PaymentOverviewTable overviewData={filteredOverviewData} />
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewContainer;
