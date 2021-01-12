import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import enLocale from 'date-fns/locale/en-GB';
import { DatePicker, Day, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useTheme } from '@material-ui/core';
import moment from 'moment';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { getWeek } from 'date-fns';

interface Props {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const renderDay = (date: MaterialUiPickersDate, selectedDate: MaterialUiPickersDate, dayInCurrentMonth: boolean) => {
  return (
    <div>
      {date && date.getDay() === 0 ? (
        <div style={{ position: 'absolute', left: 6, marginTop: 9, fontSize: '0.8em', color: 'grey' }}>
          {getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 })}
        </div>
      ) : null}
      <Day
        current={
          date
            ? moment()
                .date(date.getDate())
                .isSame(moment().date(new Date().getDate()), 'day')
            : undefined
        }
        hidden={!dayInCurrentMonth}
        selected={
          date && selectedDate
            ? moment()
                .date(date.getDate())
                .isSame(moment().date(selectedDate.getDate()), 'day')
            : undefined
        }
      >
        {date ? date.getDate().toString() : null}
      </Day>
    </div>
  );
};

const DateInput: React.FC<Props> = ({ value, onChange, open, onOpen, onClose, label = 'Earliest Date' }) => {
  const theme = useTheme();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={enLocale}>
      <DatePicker
        disableToolbar
        renderDay={renderDay}
        inputVariant="outlined"
        variant="inline"
        label={label}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        value={value}
        onChange={date => onChange(date as Date)}
        format="d.MMMM"
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
