import React, { useEffect, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import Container from '../components/Container';
import useClients from '../hooks/useClients';
import useStatistics from '../hooks/useStatistics';
import ClientInput from '../components/inputs/ClientInput';
import Client from '../model/Client';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';

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
  useEffect(() => {
    setSelectedClient(clients?.[0]);
  }, [clients]);
  return (
    <Container className={classes.root}>
      {clients && (
        <ClientInput
          label={'Clients'}
          clients={clients}
          onChange={client => setSelectedClient(client)}
          value={selectedClient}
        />
      )}
      {selectedClient ? <DashboardCharts client={selectedClient?.id} /> : <ChartsCircularProgress />}
    </Container>
  );
};

export default AdminDashboard;
