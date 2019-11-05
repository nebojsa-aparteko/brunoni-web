import React from 'react';
import { Theme, makeStyles, Container, Box, Grid } from '@material-ui/core';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    textAlign: 'center',
  },
}));

const Footer: React.FC<Props> = ({}) => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <Box className={classes.root}>
        Copyright © {new Date().getFullYear()} O. Brunoni S.A. Agence Maritime
        {/*<Grid container spacing={2}>*/}
        {/*<Grid item md={3}>*/}
        {/*</Grid>*/}
        {/*<Grid item md={3}>*/}
        {/*</Grid>*/}
        {/*<Grid item md={3}>*/}
        {/*</Grid>*/}
        {/*<Grid item md={3}>*/}
        {/*</Grid>*/}
        {/*</Grid>*/}
      </Box>
    </Container>
  );
};

export default Footer;
