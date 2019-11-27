import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { QuoteHeader } from '../../model/quotes/QuotesResult';
import {
  Button,
  Container,
  Paper,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  quoteHeaders?: any;
}

const QuotesList: React.FC<Props> = ({ quoteHeaders }) => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Reference Number</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Quote Validity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quoteHeaders
              ? quoteHeaders.map((quoteHeaders: QuoteHeader[]) => {
                  const quoteHeader = quoteHeaders[0];

                  return (
                    <TableRow key={quoteHeader.idRequest || -1}>
                      <TableCell component="th" scope="row">
                        {quoteHeader.idRequest ? `#${quoteHeader.idRequest}` : '?'}
                      </TableCell>
                      <TableCell>{quoteHeader.QuoteDate}</TableCell>
                      <TableCell>{quoteHeader.QuoteValidity}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/quotes/${quoteHeader.idRequest || 'rest'}`}
                          variant="outlined"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              : [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton width={50} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={65} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={140} height={16} style={{ margin: 0 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={64} height={29} style={{ margin: 0, float: 'right' }} />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default QuotesList;
