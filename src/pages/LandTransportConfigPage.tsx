import React, { Fragment, useEffect } from 'react';
import Meta from '../components/Meta';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  MenuItem,
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
  InputLabel,
  Select,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useForm, Controller } from 'react-hook-form';

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
  const { control, handleSubmit } = useForm<LandTransportData>({
    defaultValues: { currency: '', price: '', containerType: '' },
  });
  const [row, setRow] = React.useState<LandTransportData[]>([]);

  const onSubmit = (data: any) => {
    setRow(prevState => [...prevState, data]);
    console.log(data);
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
                    <TableRow>
                      <Box>
                        <form onSubmit={handleSubmit(onSubmit)} id="row-form">
                          <TableCell>
                            <Controller
                              name="containerType"
                              control={control}
                              defaultValue=""
                              render={({ field }) => <TextField variant="outlined" label="Container Type" {...field} />}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name="price"
                              control={control}
                              defaultValue=""
                              render={({ field }) => <TextField variant="outlined" label="Price" {...field} />}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name="currency"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Box>
                                  <InputLabel id="currency-label">Currency</InputLabel>
                                  <Select variant="outlined" labelId="currency-label" {...field}>
                                    <MenuItem value="EUR">Eur</MenuItem>
                                    <MenuItem value="USD">Usd</MenuItem>
                                    <MenuItem value="CHF">Chf</MenuItem>
                                  </Select>
                                </Box>
                              )}
                            />
                          </TableCell>
                        </form>
                        <Button form="row-form" color="primary" variant="contained" type="submit">
                          Add row
                        </Button>
                      </Box>
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
