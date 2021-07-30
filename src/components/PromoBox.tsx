import React, { Fragment, useContext, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Zoom from '@material-ui/core/Zoom';
import { Button, Card, CardActions, CardContent, CardMedia } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import useUser from '../hooks/useUser';
import firebase from '../firebase';
import truckImg from '../assets/truck.jpg';
import ActingAs from '../contexts/ActingAs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      bottom: theme.spacing(2),
      left: theme.spacing(2),
    },
    card: {
      maxWidth: 400,
    },
    content: {
      padding: theme.spacing(2, 3, 0),
    },
  }),
);

export default () => {
  const classes = useStyles();
  const [, userRecord] = useUser();
  const actingAs = useContext(ActingAs);
  const [showInterest, setShowInterest] = useState(false);
  const [dismissPopup, setDismissPopup] = useState(false);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = ((event.target as HTMLDivElement).ownerDocument || document).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDismissPopup = (showedInterest: boolean) => {
    if (userRecord?.id)
      firebase
        .firestore()
        .collection('users')
        .doc(userRecord.id)
        .set({ showedInterest, answeredLandInterest: true }, { merge: true })
        .then(() => console.log('Not Showed interest'));
    setDismissPopup(true);
  };

  const handleShowInterest = () => {
    setShowInterest(true);
  };
  console.log('Acting as', !actingAs);
  return !userRecord.answeredLandInterest && !userRecord.isAdmin ? (
    <Zoom in={trigger && !dismissPopup}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        <Card elevation={4} className={classes.card}>
          <CardMedia
            component="img"
            alt="Contemplative Reptile"
            height="160"
            image={truckImg}
            title="Contemplative Reptile"
          />
          <CardContent className={classes.content}>
            {!showInterest ? (
              <Fragment>
                <Typography variant="h4" gutterBottom>
                  Need Land Transport?
                </Typography>
                <Typography>We got you covered. Choose a service from our partner at affordable rates.</Typography>
              </Fragment>
            ) : (
              <Alert severity="info">Thank you for showing interest! We are working on enabling this feature.</Alert>
            )}
          </CardContent>
          <CardActions>
            {!showInterest ? (
              <Fragment>
                <Button onClick={handleShowInterest} variant="contained" color="primary">
                  Yes, please
                </Button>
                <Button onClick={() => handleDismissPopup(false)}>No, thanks</Button>
              </Fragment>
            ) : (
              <Button variant="contained" color="primary" onClick={() => handleDismissPopup(true)}>
                OK
              </Button>
            )}
          </CardActions>
        </Card>
      </div>
    </Zoom>
  ) : null;
};
