import React, { useEffect, useState } from 'react';
import { Box, Grid, makeStyles, Theme } from '@material-ui/core';
import Container from '../components/Container';
import useClients from '../hooks/useClients';
import useStatistics from '../hooks/useStatistics';
import ClientInput from '../components/inputs/ClientInput';
import Client from '../model/Client';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';
import DashboardYearSelect from '../components/DashboardYearSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  quoteDetails: {
    marginTop: theme.spacing(2),
  },
  cardContent: {
    padding: theme.spacing(0),
    overflowX: 'auto',
  },
}));
const AdminDashboard = () => {
  const classes = useStyles();
  const clients = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | undefined | null>();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  useEffect(() => {
    setSelectedClient(clients?.[0]);
  }, [clients]);
  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYear(event.target.value as number);
  };
  return (
    <Container className={classes.root}>
      <Box my={2}>
        <Grid container justify="flex-end" spacing={3}>
          <Grid item xs={6} sm={5} md={4} lg={3} alignItems="flex-end">
            <DashboardYearSelect year={year} handleYearChange={handleYearChange} />
          </Grid>
          {clients && (
            <Grid item xs={6} sm={5} md={4} lg={3}>
              <ClientInput
                label={'Clients'}
                clients={clients}
                onChange={client => setSelectedClient(client)}
                value={selectedClient}
              />
            </Grid>
          )}
        </Grid>
      </Box>
      {selectedClient ? <DashboardCharts client={selectedClient?.id} year={year} /> : <ChartsCircularProgress />}
    </Container>
  );
};

export default AdminDashboard;
