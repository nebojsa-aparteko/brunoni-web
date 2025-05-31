import React, { useContext } from 'react';
import Carriers from '../contexts/Carriers';
import Meta from '../components/Meta';
import {
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
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import SideCharges from '../components/admin/SideCharges';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

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

const AdminSideCharges: React.FC = () => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box m={4}>
      <Meta title="Side Charges" />
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper>
            <List dense>
              {carriers &&
                carriers
                  .filter(carrier => !carrier.disabled)
                  .map(carrier => {
                    const path = `/charges/${carrier.id}`;
                    const selected = location.pathname.startsWith(path);
                    return (
                      <ListItem
                        key={carrier.id}
                        button
                        selected={selected}
                        onClick={() => navigate(selected ? '/charges' : path)}
                      >
                        <ListItemAvatar className={classes.avatarContainer}>
                          <FiberManualRecordIcon
                            className={classes.avatar}
                            style={{ color: carrier.color }}
                          />
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
            <Routes>
              <Route path=":id" element={<SideCharges />} />
              <Route path="/" element={<GetStarted />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSideCharges;
