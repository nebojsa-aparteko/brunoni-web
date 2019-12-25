import React, { useCallback } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import {
  Theme,
  makeStyles,
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
  IconButton,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import invoke from 'lodash/fp/invoke';
import head from 'lodash/fp/head';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Container from '../Container';
import { Skeleton } from '@material-ui/lab';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

interface Props extends RouteComponentProps<{ id: string }> {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontWeight: 'bold',
  },
}));

const Client: React.FC<Props> = ({ match }) => {
  const classes = useStyles();
  const history = useHistory();
  const clientId = match.params.id;

  const users = useFirestoreCollection(
    'users',
    useCallback(query => query.where('clientId', '==', clientId), [clientId]),
  );

  const quotes = useFirestoreCollection(
    'quotes',
    useCallback(query => query.where('clientId', '==', clientId), [clientId]),
  );

  const client = flow(get('docs'), head, invoke('data'), get('company'))(users);

  if (!client) {
    return <ChartsCircularProgress />;
  }

  return (
    <Container>
      <Box my={4}>
        <Box display="flex" mb={2}>
          <Box flexShrink="0" displayPrint="none">
            <IconButton aria-label="back button" color="primary" component={RouterLink} to="/clients">
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Box ml={2} display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="h5">{client.name}</Typography>
            <Typography variant="subtitle2" gutterBottom>
              {client.nameSup} {client.city} {client.countryCode}
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardHeader
            title={
              <Typography variant="subtitle1" display="inline">
                Users
              </Typography>
            }
          />
          <CardContent>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users === undefined || users === null
                    ? [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton width={140} height={16} style={{ margin: 0 }} />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={65} height={16} style={{ margin: 0 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    : users.docs.map((user: any) => (
                        <TableRow
                          key={user.id}
                          hover
                          tabIndex={-1}
                          onClick={() => history.push(`/clients/${clientId}/users/${user.id}`)}
                        >
                          <TableCell>
                            {[user.data().firstName, user.data().lastName]
                              .filter(identity)
                              .map(invoke('trim'))
                              .join(' ') || '-'}
                          </TableCell>
                          <TableCell>{user.emailAddress}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={
              <Typography variant="subtitle1" display="inline">
                Quotes
              </Typography>
            }
          />
          <CardContent>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users === undefined || users === null
                    ? [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton width={140} height={16} style={{ margin: 0 }} />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={65} height={16} style={{ margin: 0 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    : users.docs.map((user: any) => (
                        <TableRow
                          key={user.id}
                          hover
                          tabIndex={-1}
                          onClick={() => history.push(`/clients/${clientId}/users/${user.id}`)}
                        >
                          <TableCell>
                            {[user.data().firstName, user.data().lastName]
                              .filter(identity)
                              .map(invoke('trim'))
                              .join(' ') || '-'}
                          </TableCell>
                          <TableCell>{user.emailAddress}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Client;
