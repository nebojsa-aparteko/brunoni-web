import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import { useTheme } from '@material-ui/core';

interface Props {
  value?: Date;
  onChange: (date: Date) => void;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const DateInput: React.FC<Props> = ({ value, onChange, open, onOpen, onClose }) => {
  const theme = useTheme();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        disableToolbar
        inputVariant="outlined"
        variant="inline"
        label="Earliest Date"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        value={value}
        onChange={date => onChange(date as Date)}
        PopoverProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          style: {
            marginTop: theme.spacing(0.5),
          },
        }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DateInput;
