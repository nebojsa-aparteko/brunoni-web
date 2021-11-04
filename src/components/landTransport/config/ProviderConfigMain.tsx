import React from 'react';
import {
  Box,
  Button,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
import { Currency } from '../../../model/Payment';

const useStyles = makeStyles(() => ({
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
  currency?: Currency;
  version?: string;
  date?: Date;
  active?: boolean;
}

const profitRows = [
  { price: '1999', currency: Currency.EUR, containerType: '20' },
  { price: '2999', currency: Currency.CHF, containerType: '40' },
] as LandTransportData[];

const ProviderConfigMain = () => {
  const classes = useStyles();

  const { control, handleSubmit } = useForm<LandTransportData>({
    defaultValues: { currency: Currency.CHF, price: '', containerType: '' },
  });
  const [row, setRow] = React.useState<LandTransportData[]>(profitRows);

  const onSubmit = (data: any) => {
    setRow(prevState => [...prevState, data]);
    console.log(data);
  };
  return (
    <Box className={classes.accordionContainer}>
      <Typography className={classes.title} variant="h1">
        Contargo
      </Typography>
      <SimpleExpansionPanel label="Profit" fullWidth>
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
                          <Select variant="outlined" label="Currency" {...field}>
                            {Object.values(Currency).map(val => (
                              <MenuItem value={val}>{val}</MenuItem>
                            ))}
                          </Select>
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
      </SimpleExpansionPanel>

      <SimpleExpansionPanel label="Routes" fullWidth>
        <Box>
          <Typography>Test</Typography>
        </Box>
      </SimpleExpansionPanel>
    </Box>
  );
};

export default ProviderConfigMain;
