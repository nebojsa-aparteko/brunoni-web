import React, { useState } from 'react';
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
const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
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
  const classes = useStyles();
  const [currencyFilter, setCurrencyFilter] = useState<Currency[]>([]);
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
          <InputLabel id="demo-mutiple-checkbox-label">Tag</InputLabel>
          <Select
            labelId="demo-mutiple-checkbox-label"
            id="demo-mutiple-checkbox"
            multiple
            value={currencyFilter}
            onChange={event => {
              // setCurrencyFilter(event.target.value as Currency);
            }}
            input={<Input />}
            // renderValue={(selected: Currency[]) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {Object.entries(Currency).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                <Checkbox checked={currencyFilter.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <PaymentOverviewTable overviewData={overviewData} />
      </CardContent>
    </Card>
  );
};

export default PaymentOverviewContainer;
