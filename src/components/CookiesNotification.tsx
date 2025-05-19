import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { makeStyles, Theme, Card, CardMedia, CardContent } from '@material-ui/core';
import cookieLove from '../assets/cookies.svg';
import { Typography, Link, Button } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: 420,
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: theme.spacing(3),
    outline: 'none',
    zIndex: 2000,
  },
  cardMedia: {
    objectFit: 'contain',
  },
}));

interface Props {}

const CookiesNotification: React.FC<Props> = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    Cookies.set('consent', 'true');
    setOpen(false);
  };

  useEffect(() => {
    const consent = Cookies.get('consent');

    if (!consent) {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  return (
    <Card className={classes.root} elevation={3}>
      <CardMedia
        component="img"
        alt="Contemplative Reptile"
        height="140"
        image={cookieLove}
        title="Contemplative Reptile"
        className={classes.cardMedia}
      />
      <CardContent>
        <Typography variant="body1">
          We use Cookies to ensure that we give you the best experience on our website. Read our{' '}
          <Link
            component="a"
            href="https://www.brunoni.ch/2-uncategorised/116-data-protection"
            target="_blank"
          >
            Privacy Policy
          </Link>
          .
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={handleClose} size="small" color="primary" variant="contained">
          I Agree
        </Button>
      </CardActions>
    </Card>
  );
};

export default CookiesNotification;
