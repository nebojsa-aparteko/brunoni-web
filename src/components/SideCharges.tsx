import React, { Fragment, useCallback, useContext } from 'react';
import get from 'lodash/fp/get';
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
  Grid,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Carriers from '../contexts/Carriers';
import Container from './Container';
import Carrier, { SideCharge } from '../model/Carrier';

interface Props {
  carriers: Carrier[] | undefined;
}

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    textTransform: 'uppercase',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },

    '& td': {
      whiteSpace: 'nowrap',
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

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const renderCharges = useCallback(
    (charges: SideCharge, i: number) => (
      <Box my={2}>
        <Paper key={i} className={classes.overflowTable}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {charges.columns.map((column, j) => (
                  <TableCell key={j} style={{ width: `${100 / charges.columns.length}%` }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {charges.rows.map((row, i) => (
                <TableRow key={i} className={classes.tableRow}>
                  {charges.columns.map((_, j) => (
                    <TableCell key={j} style={{ width: `${100 / charges.columns.length}%` }}>
                      {row.values[j]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    ),
    [classes],
  );

  return (
    <Fragment>
      <Container>
        <Box mt={4} mb={2}>
          <Typography variant="h3" gutterBottom>
            Side Charges
          </Typography>
        </Box>
      </Container>
      <Box m={4}>
        {carriers &&
          carriers.filter(get('sideCharges')).map(({ id, name, sideCharges }) => (
            <ExpansionPanel
              expanded={expanded === (name || id)}
              onChange={handleChange(name || id)}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>{name || id}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                      Import / Crosstrade
                    </Typography>
                    {sideCharges!.importCharges.map(renderCharges)}
                  </Grid>
                  <Grid item sm={12} xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                      Export
                    </Typography>
                    {sideCharges!.exportCharges.map(renderCharges)}
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
      </Box>
    </Fragment>
  );
};

export default EquipmentSituation;
