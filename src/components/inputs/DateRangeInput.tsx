import 'date-fns';
import React, { useState, Fragment, useEffect } from 'react';
import { DateRangePicker } from '../DateRangePicker';
import { DateRange, DefinedRange } from '../DateRangePicker/types';
import { ClickAwayListener, FormControl, Input, InputAdornment, Popover, useTheme } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import DateRangeIcon from '@material-ui/icons/DateRange';
import subDays from 'date-fns/subDays';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import lastDayOfMonth from 'date-fns/lastDayOfMonth';
import subMonths from 'date-fns/subMonths';
import get from 'lodash/fp/get';
import formatDate from 'date-fns/format';
import useLocalStorage from '../../utilities/useLocalStorage';

interface Props {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const rangePredefinedValues: DefinedRange[] = [
  {
    label: 'Last 7 Days',
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  },
  {
    label: 'This Month',
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
  },
  {
    label: 'Last Month',
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: lastDayOfMonth(subMonths(new Date(), 1)),
  },
  {
    label: 'Last 90 Days',
    startDate: startOfMonth(subMonths(new Date(), 3)),
    endDate: new Date(),
  },
  {
    label: 'This Year',
    startDate: startOfYear(new Date()),
    endDate: new Date(),
  },
];

const formatDateString = (date: Date | undefined) => (date ? formatDate(date, 'dd.MM.yyyy') : '');

const getLabelValue = (dateRange: DateRange | DefinedRange | undefined) => {
  return dateRange
    ? get('label')(dateRange)
      ? get('label')(dateRange)
      : formatDateString(dateRange.startDate) + '-' + formatDateString(dateRange.endDate)
    : '';
};

const DateRangeInput: React.FC<Props> = ({ value, onChange }) => {
  const [dateRangeValue, setDateRangeValue] = useLocalStorage(
    'dateRangeInput',
    value || rangePredefinedValues[0],
    false,
    -1,
  );

  const [labelValue, setLabelValue] = useState(getLabelValue(value || rangePredefinedValues[0]));

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    setLabelValue(getLabelValue(dateRangeValue));
    if (dateRangeValue) {
      onChange(dateRangeValue);
    }
  }, [dateRangeValue]);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenButton = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const onRangeChange = (range: DateRange) => {
    setDateRangeValue(range);
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <FormControl onClick={handleOpenButton}>
        <Input
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="Toggle Date Range Visibility" onClick={handleOpenButton}>
                <DateRangeIcon />
              </IconButton>
            </InputAdornment>
          }
          margin="dense"
          value={labelValue}
        />
      </FormControl>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <DateRangePicker
            open
            initialDateRange={dateRangeValue}
            onChange={range => onRangeChange(range)}
            definedRanges={rangePredefinedValues}
            maxDate={new Date()}
          />
        </ClickAwayListener>
      </Popover>
    </Fragment>
  );
};

export default DateRangeInput;
