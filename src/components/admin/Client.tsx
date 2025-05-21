import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardHeader,
  Typography,
  CardContent,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Paper,
  Grid,
} from '@material-ui/core';
import { IconButtonLink } from '../Link';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Container from '../Container';
import { Skeleton } from '@material-ui/lab';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import formatDate from 'date-fns/format';
import firebase from 'firebase/app';
import 'firebase/firestore';

const Client: React.FC = () => {
  const navigate = useNavigate();
  const { id: clientId } = useParams<{ id: string }>();

  if (!clientId) {
    navigate('/not-found');
    return null;
  }
  const users = useFirestoreCollection(
    'users',
    useCallback(
      (collection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>) =>
        collection.where('clientId', '==', clientId),
      [clientId],
    ),
  );

  const lastQuotes = useFirestoreCollection(
    'quotes',
    useCallback(
      (collection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>) =>
        collection.where('clientId', '==', clientId).orderBy('updatedAt', 'desc').limit(5),
      [clientId],
    ),
  );

  const lastBookings = useFirestoreCollection(
    'quotes',
    useCallback(
      (collection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>) =>
        collection
          .where('clientId', '==', clientId)
          .where('isBooking', '==', true)
          .orderBy('updatedAt', 'desc')
          .limit(5),
      [clientId],
    ),
  );

  const clientsSnapshot = useFirestoreCollection('clients');
  const client = clientsSnapshot?.docs.find(doc => doc.id === clientId)?.data();

  return (
    <Container>
      <Box my={2}>
        <IconButtonLink to="/client-statistics">
          <ArrowBackIcon />
        </IconButtonLink>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={client ? client.name : <Skeleton variant="text" width={120} />} />
            <CardContent>
              <Box display="flex" alignItems="baseline" mb={1}>
                <Typography variant="caption" component="p">
                  Agreement No
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography>{client && client.alphacomId}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Users" />
            <CardContent>
              {users === undefined ? (
                <ChartsCircularProgress />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.docs.map(doc => {
                      const user = doc.data();
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell align="right">{user.email}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Latest quotes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Latest Quotes" />
            <CardContent>
              {lastQuotes === undefined ? (
                <ChartsCircularProgress />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lastQuotes.docs.map(doc => {
                      const quote = doc.data();
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            {quote.createdAt?.toDate
                              ? formatDate(quote.createdAt.toDate(), 'dd.MM.yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {quote.price} {quote.currency}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Latest bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Latest Bookings" />
            <CardContent>
              {lastBookings === undefined ? (
                <ChartsCircularProgress />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lastBookings.docs.map(doc => {
                      const booking = doc.data();
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            {booking.createdAt?.toDate
                              ? formatDate(booking.createdAt.toDate(), 'dd.MM.yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {booking.price} {booking.currency}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Client;
