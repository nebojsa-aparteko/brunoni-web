import React, { Fragment, useEffect } from 'react';
import Meta from '../components/Meta';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
  },
  companyListContainer: {
    width: '500px',
    height: '500px',
    backgroundColor: 'grey',
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'start',
  },
  expansionPanel: {
    marginBottom: 8,
    width: '1000px',
  },
  expansionPanelSummary: {
    display: 'flex',
  },
  expansionPanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
}));

interface LandTransportData {
  containerType?: string;
  price?: string;
  currency?: string;
  version?: string;
  date?: Date;
  active?: boolean;
}

const LandTransportConfigPage: React.FC = () => {
  const classes = useStyles();
  const [inputData, setInputData] = React.useState<LandTransportData>();
  const [row, setRow] = React.useState<LandTransportData[]>([]);

  const handleChange = (e: any) => {
    setInputData(oldData => ({ ...oldData, [e.target.name]: e.target.value } as LandTransportData));
  };

  useEffect(() => {
    console.log(inputData);
  }, [inputData]);

  const addRow = () => {
    setRow(oldRow => [
      ...oldRow,
      {
        containerType: inputData?.containerType,
        price: inputData?.price,
        currency: inputData?.currency,
      },
    ]);
  };

  return (
    <Fragment>
      <Meta title={'Land Transport Config'} />
      <Box className={classes.mainContainer}>
        <Box className={classes.companyListContainer}>
          <Typography>Lef side Company List</Typography>
        </Box>
        <Box className={classes.accordionContainer}>
          <Typography className={classes.title} variant="h1">
            Contargo
          </Typography>
          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
              <Typography variant="h5" className={classes.expansionPanelTitle}>
                Profit
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Container Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Currency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row &&
                      row.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell align="left">{item.containerType}</TableCell>
                          <TableCell align="left">{item.price}</TableCell>
                          <TableCell align="left">{item.currency}</TableCell>
                        </TableRow>
                      ))}
                    <TableRow></TableRow>

                    <TableRow>
                      <TextField
                        required
                        type="text"
                        name="containerType"
                        label="Container Type"
                        // className={classes.formInput}
                        variant="outlined"
                        onChange={handleChange}
                      />
                      <TextField
                        required
                        type="text"
                        name="price"
                        label="Price"
                        // className={classes.formInput}
                        variant="outlined"
                        onChange={handleChange}
                      />
                      <TextField
                        required
                        type="text"
                        name="currency"
                        label="Currency"
                        // className={classes.formInput}
                        variant="outlined"
                        onChange={handleChange}
                      />
                      <Button variant="contained" color="primary" onClick={addRow}>
                        Add Row
                      </Button>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </ExpansionPanelDetails>
          </ExpansionPanel>

          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
              <Typography variant="h5" className={classes.expansionPanelTitle}>
                Routes
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Version</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{/*  Table body*/}</TableBody>
                </Table>
              </TableContainer>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Box>
      </Box>
    </Fragment>
  );
};

export default LandTransportConfigPage;
