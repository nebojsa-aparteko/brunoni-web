import React, { useCallback, useContext } from 'react';
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
                  <TableCell key={j}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {charges.rows.map((row, i) => (
                <TableRow key={i} className={classes.tableRow}>
                  {charges.columns.map((_, j) => (
                    <TableCell key={j}>{row.values[j]}</TableCell>
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
    <Container>
      <Box p={2} pb={0} mt={5} mb={1}>
        <Typography variant="h3" gutterBottom>
          Side Charges
        </Typography>
      </Box>
      <Box my={4}>
        {carriers &&
          carriers.filter(get('sideCharges')).map(({ id, name, sideCharges }) => (
            <ExpansionPanel expanded={expanded === (name || id)} onChange={handleChange(name || id)}>
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
                      Import
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
    </Container>
  );
};

export default EquipmentSituation;
