import React, { useContext } from 'react';
import Carriers from '../contexts/Carriers';
import Meta from '../components/Meta';
import {
  Avatar,
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Route, RouteComponentProps, Switch } from 'react-router';
import SideCharges from '../components/admin/SideCharges';

const GetStarted: React.FC = () => (
  <Box p={2}>
    <Typography variant="subtitle1">Start by selecting one of the carriers</Typography>
  </Box>
);

const useStyles = makeStyles((theme: Theme) => ({
  avatarContainer: {
    minWidth: 'initial',
  },
  avatar: {
    width: '.75em',
    height: '.75em',
    marginRight: theme.spacing(1),
  },
}));

const AdminSideCharges: React.FC<RouteComponentProps> = ({ history, location, match }) => {
  const classes = useStyles();
  const carriers = useContext(Carriers);

  return (
    <Box m={4}>
      <Meta title="Side Charges" />
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper>
            <List dense>
              {carriers &&
                carriers.map(carrier => {
                  const path = `/charges/${carrier.id}`;
                  const selected = location.pathname.startsWith(path);
                  return (
                    <ListItem
                      key={carrier.id}
                      button
                      selected={selected}
                      onClick={() => (selected ? history.push('/charges') : history.push(path))}
                    >
                      <ListItemAvatar className={classes.avatarContainer}>
                        <Avatar className={classes.avatar} style={{ backgroundColor: carrier.color }} />
                      </ListItemAvatar>
                      <ListItemText primary={carrier.name.toUpperCase()} />
                    </ListItem>
                  );
                })}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper>
            <Switch>
              <Route path={`${match.path}/:id`} component={SideCharges} />
              <Route component={GetStarted} />
            </Switch>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSideCharges;
