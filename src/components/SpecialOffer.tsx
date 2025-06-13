import React, { useContext, useEffect, useState, Fragment } from 'react';
import formatDate from 'date-fns/format';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import {
  makeStyles,
  Box,
  Typography,
  Theme,
  Button,
  Card,
  CardMedia,
  CardContent,
} from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Carrier from '../model/Carrier';
import ContainerType from '../model/ContainerType';
import Port from '../model/Port';
import firebase from '../firebase';
import { RouteSearchContext } from '../contexts/RouteSearchContext';
import LoginDialogContext from '../contexts/LoginDialog';
import UserContext from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { DateFormats } from '../utilities/formattingHelpers';

interface Props {
  id: string;
  carrier: Carrier;
  containerType: ContainerType;
  destination: Port;
  image: string;
  origin: Port;
  price: {
    amount: string;
    currency: string;
  };
  validUntil: Date;
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

const SpecialOffer: React.FC<Props> = ({
  carrier,
  containerType,
  destination,
  image,
  origin,
  price,
  validUntil,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const loginDialog = useContext(LoginDialogContext);
  const setParams = useContext(RouteSearchContext)[1];

  const [imageURL, setImageURL] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (image) {
        setImageURL(await firebase.storage().ref(image).getDownloadURL());
      }
    })();
  }, [image]);

  const handleClick = () => {
    setParams({
      originPort: origin,
      destinationPort: destination,
      date: addDays(new Date(), 2),
      weeks: 4,
      carrier: carrier,
      containers: [{ containerType, quantity: 1, imo: [false], oog: [false] }],
    });

    if (user) {
      navigate('/quotes/get');
    } else {
      loginDialog.open({
        message: 'Log in first to claim special offer.',
        next: '/quotes/get',
      });
    }
  };

  return (
    <Card className={classes.card}>
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        <CardMedia
          className={classes.media}
          image={imageURL}
          title={`${origin.city} to ${destination.city}`}
        />
        <CardContent className={classes.content}>
          <Box display="flex" alignContent="center" className={classes.subtitle}>
            <Typography>{origin.city}</Typography>
            <ArrowForwardIcon fontSize="small" className={classes.routeIcon} />
            <Typography>{destination.city}</Typography>
          </Box>
          <Typography
            gutterBottom
            variant="body1"
            color="textSecondary"
            component="p"
            className={classes.body}
          >
            {containerType.description ? (
              <Fragment>
                {containerType.description} <br />
              </Fragment>
            ) : null}
            {`Valid until ${formatDate(subDays(validUntil, 1), DateFormats.LONG)}`}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            className={classes.button}
          >
            {user ? (
              <Fragment>
                Book now for&nbsp;
                <strong>{price ? `${price.currency} ${price.amount}` : 'SECRET PRICE'}**</strong>
              </Fragment>
            ) : (
              'Book now'
            )}
          </Button>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            className={classes.finePrint}
          >
            **subject to other charges
          </Typography>
        </CardContent>
      </div>
    </Card>
  );
};

export default SpecialOffer;
