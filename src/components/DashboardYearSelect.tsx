import React, { useState } from 'react';
import { Box, FormControl, IconButton, MenuItem, Select } from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';

const DashboardYearSelect: React.FC<Props> = ({ year, handleYearChange }) => {
  const currentYear = new Date().getFullYear();

  const [open, setOpen] = React.useState(false);

  return (
    <Box display="flex" alignItems="flex-end">
      <Box my={-1}>
        <IconButton color="inherit" component="span" onClick={() => setOpen(true)}>
          <TodayIcon />
        </IconButton>
      </Box>
      <FormControl fullWidth>
        <Select
          labelId="year-select-label"
          id="year-select"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={year}
          onChange={handleYearChange}
        >
          <MenuItem value={currentYear} selected>
            Current Year
          </MenuItem>
          <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
          <MenuItem value={currentYear - 2}>{currentYear - 2}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default DashboardYearSelect;

interface Props {
  year: number;
  handleYearChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
}
