import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import enLocale from 'date-fns/locale/en-GB';
import { DatePicker, Day, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useTheme } from '@material-ui/core';
import moment from 'moment';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { getWeek } from 'date-fns';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  label?: string;
  value?: Date | null;
  onChange: (date: Date) => void;
  onBlur?: () => void;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  margin?: 'none' | 'dense' | 'normal';
  fullWidth?: boolean;
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

export const DateInput: React.FC<Props> = ({
  value,
  onChange,
  open,
  onOpen,
  onBlur,
  onClose,
  label = 'Earliest Date',
  margin,
  fullWidth = true,
}) => {
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
        value={value || null}
        onChange={date => onChange(date as Date)}
        onBlur={onBlur}
        format="d.MMMM"
        margin={margin}
        fullWidth={fullWidth}
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

interface ControlledProps extends Omit<Props, 'onChange' | 'value' | 'onBlur'> {
  name: string;
}

export const ControlledDateInput: React.FC<ControlledProps> = ({
  name,
  open,
  onOpen,
  onClose,
  label,
  margin,
  fullWidth,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <DateInput
          fullWidth={fullWidth}
          margin={margin}
          label={label}
          onChange={onChange}
          onBlur={onBlur}
          value={value || new Date()}
          open={open}
          onOpen={onOpen}
          onClose={onClose}
        />
      )}
    />
  );
};

export default DateInput;
