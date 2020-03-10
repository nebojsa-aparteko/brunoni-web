import React, { Fragment, useContext, useMemo } from 'react';
import {
  makeStyles,
  Container as MUIContainer,
  Paper,
  Card,
  CardContent,
  CardActions,
  TablePagination
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import set from 'lodash/fp/set';
import chunk from 'lodash/fp/chunk';
import Meta from './Meta';
import BookingsContext from '../contexts/Bookings';
import { QuoteListContext } from '../contexts/QuoteListContext';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';

interface Props {
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  content: {
    padding: 0,
    overflowX: 'auto',
  },
  inner: {
    minWidth: 700,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
}));

const Bookings: React.FC<Props> = ({ showCompanyInfo }) => {
  const classes = useStyles();
  const bookings = useContext(BookingsContext);
  const [ bookingsContextData, setBookingsContextData ] = useContext(QuoteListContext);
  const { page, rowsPerPage } = bookingsContextData;

  const resultChunks = useMemo(() => {
    return chunk(rowsPerPage)(bookings);
  }, [bookings, rowsPerPage]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setBookingsContextData(set('page', page)(bookingsContextData));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setBookingsContextData(
      flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(bookingsContextData),
    );
  };

  if ( !bookings ) {
    return (
      <MUIContainer maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </MUIContainer>
    );
  }

  return (
    <Fragment>
      <Meta title={'Bookings'} />
      <Card>
        <CardContent className={classes.content}>
          <BookingsTable
            bookings={resultChunks && (get(page)(resultChunks) || [])}
            showCompanyInfo={showCompanyInfo}
          />
        </CardContent>
        <CardActions className={classes.actions}>
          {bookings && bookings.length > 0 && (
            <TablePagination
              component="div"
              count={bookings.length}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </CardActions>
      </Card>
    </Fragment>
  );
};

export default Bookings;
