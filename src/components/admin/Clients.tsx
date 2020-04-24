import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router';
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
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import map from 'lodash/fp/map';
import invoke from 'lodash/fp/invoke';
import groupBy from 'lodash/fp/groupBy';
import head from 'lodash/fp/head';
import orderBy from 'lodash/fp/orderBy';
import filter from 'lodash/fp/filter';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import UserRecord from '../../model/UserRecord';
import Container from '../Container';
import Search from '../searchbar/Search';
import { Skeleton } from '@material-ui/lab';

interface Props {}

const useStyles = makeStyles(() => ({
  root: {
    fontWeight: 'bold',
  },
}));

const Clients: React.FC<Props> = ({}) => {
  const history = useHistory();
  const users = useFirestoreCollection('users');

  const [search, setSearch] = useState<string | undefined>();

  const clients = flow(
    get('docs'),
    map(invoke('data')),
    groupBy('clientId'),
    map(flow(head, (user: UserRecord) => set('company.id', user.alphacomClientId)(user), get('company'))),
    orderBy('name', 'asc'),
  )(users);

  const filteredClients = useMemo(() => {
    const keywords = ((search || '').match(/[^\s]+/g) || []).map(k => k.toLowerCase());

    if (keywords.length > 0) {
      return filter((client: any) => {
        const items = [
          (client.name || '').toLowerCase(),
          (client.city || '').toLowerCase(),
          (client.countryCode || '').toLowerCase(),
        ];

        return keywords.some(keyword => items.some(item => item.indexOf(keyword) >= 0));
      })(clients);
    } else {
      return clients;
    }
  }, [search, clients]);

  return (
    <Container>
      <Box my={4}>
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" display="inline">
                  Clients
                </Typography>
                <Box flex={1} />
                <Search
                  onSearch={setSearch}
                  style={{ visibility: clients && clients.length > 0 ? 'initial' : 'hidden' }}
                />
              </Box>
            }
          />
          <CardContent>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Country</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients === undefined || clients === null
                    ? [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton width={50} height={16} style={{ margin: 0 }} />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={140} height={16} style={{ margin: 0 }} />
                          </TableCell>
                          <TableCell>
                            <Skeleton width={65} height={16} style={{ margin: 0 }} />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredClients.map((client: any) => (
                        <TableRow
                          key={client.id}
                          hover
                          tabIndex={-1}
                          onClick={() => history.push(`/clients/${client.id}`)}
                        >
                          <TableCell>
                            {client.name}
                            {client.nameSup ? `; ${client.nameSup}` : null}
                          </TableCell>
                          <TableCell>{client.city}</TableCell>
                          <TableCell>{client.countryCode}</TableCell>
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

export default Clients;
