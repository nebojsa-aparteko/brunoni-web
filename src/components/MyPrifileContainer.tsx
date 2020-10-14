import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';
import { getTeamsPerUser } from './myDay/MyDayContainer';
import { Team } from '../model/Teams';
import UserNotificationRedirectionSwitch from './UserNotificationRedirectionSwitch';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    width: '100%',
    margin: 0,

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },
  },
  root: {
    padding: theme.spacing(2),
  },
  list: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.palette.background.paper,
  },
}));

const MyProfileContainer = () => {
  const classes = useStyles();
  const [user, userData] = useUser();
  const [userTeams, setUserTeams] = useState<Team[]>([]);

  useEffect(() => {
    getTeamsPerUser(userData).then(teams =>
      setUserTeams(
        teams.docs.map(doc => {
          return { id: doc.id, ...doc.data() } as Team;
        }) as Team[],
      ),
    );
  }, [userData]);

  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Grid item xs={12} md={11}>
        <Card className={classes.root}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h3" display="inline">
                  My Profile
                </Typography>
                {userData &&
                  userData.redirectedAdmin &&
                  (userData.redirectedAdmin.firstName || userData.redirectedAdmin.lastName) && (
                    <Box display="flex" flexWrap="nowrap" alignItems="center" justifyContent="center">
                      <Typography>Notification redirection</Typography>
                      <UserNotificationRedirectionSwitch userUid={user.uid} user={userData} />
                    </Box>
                  )}
              </Box>
            }
          />
          <CardContent>
            {!userData ? (
              <ChartsCircularProgress />
            ) : (
              <Box display="flex" flexDirection="row" mb={2} justifyContent="space-between">
                <List className={classes.list}>
                  {(userData.firstName || userData.lastName) && (
                    <ListItem>
                      <ListItemText primary="Name:" secondary={userData.firstName + ' ' + userData.lastName} />
                    </ListItem>
                  )}
                  {userData.emailAddress && (
                    <ListItem>
                      <ListItemText primary="Email:" secondary={userData.emailAddress} />
                    </ListItem>
                  )}
                  {userData.company && userData.company.name && (
                    <ListItem>
                      <ListItemText primary="Company:" secondary={userData.company?.name} />
                    </ListItem>
                  )}
                  {userData.role && (
                    <ListItem>
                      <ListItemText primary="Role:" secondary={userData.role} />
                    </ListItem>
                  )}
                  {userTeams && userTeams.length > 0 && (
                    <ListItem>
                      <ListItemText primary="Teams:" secondary={userTeams?.map(team => team.name).join(', ')} />
                    </ListItem>
                  )}
                  {userData.redirectedAdmin &&
                    (userData.redirectedAdmin.firstName || userData.redirectedAdmin.lastName) && (
                      <ListItem>
                        <ListItemText
                          primary="Administrator to whom notifications are redirected: "
                          secondary={
                            <Box>
                              {userData.redirectedAdmin?.firstName + ' ' + userData.redirectedAdmin?.lastName + ' ('}
                              <a
                                href={`mailto:${userData.redirectedAdmin?.emailAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {userData.redirectedAdmin?.emailAddress}
                              </a>
                              {')'}
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MyProfileContainer;
