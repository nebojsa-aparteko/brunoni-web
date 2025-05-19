import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { IconButtonLink } from '../Link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

interface Props {
  backTo: any;
  title: string;
  subtitle: string;
}

const mediaPrint = '@media print';
const useStyles = makeStyles(theme => ({
  title: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    [mediaPrint]: {
      marginLeft: theme.spacing(0),
    },
  },
}));

const QuoteNav: React.FC<Props> = ({ backTo, title, subtitle }) => {
  const classes = useStyles();
  return (
    <Box display="flex">
      <Box flexShrink="0" displayPrint="none">
        <IconButtonLink aria-label="back button" color="primary" to={backTo}>
          <ArrowBackIcon />
        </IconButtonLink>
      </Box>

      <Box
        ml={2}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        className={classes.title}
      >
        <Typography variant="h5">{title}</Typography>
        <Typography variant="subtitle2" gutterBottom>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuoteNav;
