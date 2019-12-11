import React from 'react';
import { makeStyles, Theme, Button, Card, CardActionArea, CardMedia, CardContent } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import specialOfferImage from '../assets/special_offer.jpg';
import Box from '@material-ui/core/Box';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

interface Props {
  carrier: string;
  origin: string;
  destination: string;
  cargo?: string;
  validUntil: string;
  price: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {},
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  media: {
    height: 156,
  },
  title: {
    textTransform: 'uppercase',
    marginBottom: theme.spacing(0.25),
  },
  subtitle: {
    textTransform: 'uppercase',
    paddingBottom: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1.5),
  },
  routeIcon: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  body: {
    marginBottom: theme.spacing(1.5),
  },
  button: {
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),

    '& > *': {
      display: 'flex',
      flexWrap: 'wrap',
      lineHeight: 1.45,
    },
  },
  finePrint: {
    marginTop: theme.spacing(1.5),
  },
}));

const SpecialOffer: React.FC<Props> = ({ carrier, origin, destination, cargo, validUntil, price }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia className={classes.media} image={specialOfferImage} title="Contemplative Reptile" />
        <CardContent className={classes.content}>
          <Typography variant="h5" className={classes.title}>
            <strong>{carrier}</strong>
          </Typography>
          <Box display="flex" alignContent="center" className={classes.subtitle}>
            <Typography>{origin}</Typography>
            <ArrowForwardIcon fontSize="small" className={classes.routeIcon} />
            <Typography>{destination}</Typography>
          </Box>
          <Typography gutterBottom variant="body1" color="textSecondary" component="p" className={classes.body}>
            {cargo} <br />
            {`Valid until ${validUntil}`}
          </Typography>
          <Button variant="outlined" color="primary" size="large" fullWidth className={classes.button}>
            {`Book now for`}
            <strong>{`${price}**`}</strong>
          </Button>
          <Typography variant="body2" color="textSecondary" component="p" className={classes.finePrint}>
            **subject to other charges
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SpecialOffer;
