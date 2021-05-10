import React, { useState } from 'react';
import { Box, FormControl, InputLabel, makeStyles, MenuItem, Select, Theme, Typography } from '@material-ui/core';
import pick from 'lodash/fp/pick';
import { Currency } from '../../model/Payment';
import ConfirmationDialog, { ConfirmationDialogProps } from '../ConfirmationDialog';
const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    minWidth: 120,
  },
  menuItem: {
    maxWidth: '40em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

interface Props extends Pick<ConfirmationDialogProps, 'handleClose' | 'isOpen'> {
  handleConfirm: (currency: Currency) => void;
}

const ConfirmLeadingCurrencyDialog: React.FC<Props> = ({ handleClose, handleConfirm, isOpen }) => {
  const [currency, setCurrency] = useState(Currency.USD);
  const classes = useStyles();
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      label="Choose leading currency"
      handleConfirm={() => handleConfirm(currency)}
      handleClose={handleClose}
      description={
        <Box display="flex" flexDirection="column">
          <Typography>Please pick a currency you will use as a leading.</Typography>
          <FormControl className={classes.formControl}>
            <InputLabel id="status-select">Location</InputLabel>
            <Select
              value={currency}
              onChange={event => {
                setCurrency(event.target.value as Currency);
              }}
              className={classes.menuItem}
            >
              {Object.keys(pick(['EUR', 'USD'])(Currency))?.map(currency => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      }
    />
  );
};

export default ConfirmLeadingCurrencyDialog;
