import React, { useContext, useState } from 'react';
import { Box, FormControl, Grid, IconButton, MenuItem } from '@material-ui/core';
import { Select } from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import Page from '../quotes/Page';
import TEUPerformance from './TEUPerformance';
import CarrierPerformance from './CarrierPerformance';
import ContainerTypePerformance from './ContainerTypePerformance';
import Top5PortsPerformance from './Top5PortsPerformance';
import StatisticsContext from '../../contexts/Statistics';

const DashboardCharts: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [open, setOpen] = React.useState(false);
  const [year, setYear] = useState(currentYear);
  const clientPerformance = useContext(StatisticsContext);

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYear(event.target.value as number);
  };

  return clientPerformance ? (
    <Page title="Analytics Dashboard">
      <Box my={2}>
        <Grid container justify="flex-end">
          <Grid item xs={6} sm={5} md={4} lg={3}>
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
              {/*<Box my={-1}>*/}
              {/*  <SynchronizeButton collection="clientPerformance" />*/}
              {/*</Box>*/}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        <Grid item md={8} xs={12}>
          <TEUPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CarrierPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={4} xs={12}>
          <ContainerTypePerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
        <Grid item md={8} xs={12}>
          <Top5PortsPerformance clientPerformance={clientPerformance} year={year} />
        </Grid>
      </Grid>
    </Page>
  ) : null;
};

export default DashboardCharts;
