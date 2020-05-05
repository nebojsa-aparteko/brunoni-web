import 'date-fns';
import React, { useState, Fragment, useEffect } from 'react';
import { DateRangePicker } from '../daterangepicker';
import { DateRange, DefinedRange } from '../daterangepicker/types';
import { ClickAwayListener, FormControl, Input, InputAdornment, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import DateRangeIcon from '@material-ui/icons/DateRange';
import subDays from 'date-fns/subDays';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import lastDayOfMonth from 'date-fns/lastDayOfMonth';
import subMonths from 'date-fns/subMonths';
import get from 'lodash/fp/get';
import formatDate from 'date-fns/format';
import endOfDay from 'date-fns/endOfDay';
import subYears from 'date-fns/subYears';
import endOfYear from 'date-fns/endOfYear';

interface Props {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const rangePredefinedValues: DefinedRange[] = [
  {
    label: 'Last 7 Days',
    startDate: subDays(new Date(), 7),
    endDate: endOfDay(new Date()),
  },
  {
    label: 'This Month',
    startDate: startOfMonth(new Date()),
    endDate: endOfDay(new Date()),
  },
  {
    label: 'Last Month',
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: lastDayOfMonth(subMonths(new Date(), 1)),
  },
  {
    label: 'Last 3 Months',
    startDate: startOfMonth(subMonths(new Date(), 2)),
    endDate: endOfDay(new Date()),
  },
  {
    label: 'This Year',
    startDate: startOfYear(new Date()),
    endDate: endOfDay(new Date()),
  },
  {
    label: 'Last Year',
    startDate: startOfYear(subYears(new Date(), 1)),
    endDate: endOfYear(subYears(new Date(), 1)),
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
  const [labelValue, setLabelValue] = useState();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    if (value) {
      setLabelValue(getLabelValue(value));
    }
  }, [value]);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenButton = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const onRangeChange = (range: DateRange) => {
    if (range.endDate) range.endDate = endOfDay(range.endDate);
    onChange(range);
    setLabelValue(getLabelValue(range));
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
            initialDateRange={value}
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
