import React, { Fragment, useContext } from 'react';
import classNames from 'classnames';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import {
  Theme,
  makeStyles,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  colors,
  Tooltip,
  Grid,
} from '@material-ui/core';
import Carriers from '../contexts/Carriers';
import Container from './Container';
import Carrier from '../model/Carrier';

interface Props {
  carriers: Carrier[] | undefined;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
  },
}));

const EquipmentSituation: React.FC<Props> = () => {
  const classes = useStyles();
  const carriers = useContext(Carriers);

  return (
    <Container>
      <Box p={2} mt={5} mb={3}>
        <Typography variant="h3" gutterBottom>
          Side Charges
        </Typography>
        {/*<Typography variant="subtitle2">*/}
        {/*Find below the overview of all equipment available in Switzerland for your export bookings*/}
        {/*</Typography>*/}
      </Box>
      <Box my={3}>
        {carriers &&
          carriers.filter(get('sideCharges')).map(({ id, name, sideCharges }) => (
            <Box key={id} my={5}>
              <Box p={2}>
                <Typography variant="h4">{name || id}</Typography>
              </Box>
              {sideCharges!.groups.map(({ prefix, statements }, i) => (
                <Box pb={2}>
                  <Paper>
                    <Table size="small" aria-label="a dense table">
                      <TableBody>
                        {statements.map(({ label, amount, currency, per }, i) => (
                          <TableRow key={i} className={classes.tableRow}>
                            <TableCell>
                              <Grid container>
                                <Grid item xs={12} sm={6}>
                                  {[prefix, label].filter(identity).join(' ')}
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  {currency} {amount}
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  PER {per}
                                </Grid>
                              </Grid>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              ))}
            </Box>
          ))}
      </Box>
    </Container>
  );
};

export default EquipmentSituation;
