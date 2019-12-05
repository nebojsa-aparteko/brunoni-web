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
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Carriers from '../contexts/Carriers';
import Container from './Container';
import Carrier from '../model/Carrier';

interface Props {
  carriers: Carrier[] | undefined;
}

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    textTransform: 'uppercase',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },

    '& td': {
      whiteSpace: 'nowrap',
      width: '50%',
    },
  },
  expansionPanelSummary: {
    marginBottom: theme.spacing(0),
  },
  overflowTable: {
    overflowX: 'auto',
  },
}));

const EquipmentSituation: React.FC<Props> = () => {
  const classes = useStyles();
  const carriers = useContext(Carriers);

  return (
    <Container>
      <Box p={2} pb={0} mt={5} mb={1}>
        <Typography variant="h3" gutterBottom>
          Side Charges
        </Typography>
        {/*<Typography variant="subtitle2">*/}
        {/*Find below the overview of all equipment available in Switzerland for your export bookings*/}
        {/*</Typography>*/}
      </Box>
      <Box mb={12}>
        {carriers &&
          carriers.filter(get('sideCharges')).map(({ id, name, sideCharges }) => (
            <Box key={id} my={5}>
              <Box p={2}>
                {console.log(sideCharges)}
                <Typography variant="h4">{name || id}</Typography>
              </Box>
              <Box>
                {sideCharges!.groups.map(({ prefix, statements }, i) => (
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      className={classes.expansionPanelSummary}
                    >
                      <Typography className={classes.heading}>{prefix ? prefix : 'Other'}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <Box mt={2} width="100%">
                        <Paper className={classes.overflowTable}>
                          <Table size="small" aria-label="a dense table">
                            <TableBody>
                              {statements.map(({ label, amount, currency, per }, i) => (
                                <TableRow key={i} className={classes.tableRow}>
                                  <TableCell>{[label].filter(identity).join(' ')}</TableCell>
                                  <TableCell>
                                    {currency} {amount} PER {per}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </Box>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                ))}
              </Box>
            </Box>
          ))}
      </Box>
    </Container>
  );
};

export default EquipmentSituation;
