import React, { useContext, useMemo, useState, Fragment } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  makeStyles,
  TablePagination,
  Typography,
} from '@material-ui/core';
import GetQuotesButton from './GetQuotesButton';
import QuoteGroupsContext from '../contexts/QuoteGroups';
import QuoteGroupsTable from './quotes/QuoteGroupsTable';
import chunk from 'lodash/fp/chunk';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import reduce from 'lodash/fp/reduce';
import find from 'lodash/fp/find';
import Search from './SearchBar/Search';
import Container from '../model/Container';
import CommodityType from '../model/CommodityType';
import { Quote, QuoteGroup } from '../providers/QuoteGroups';

interface Props {
  showGetQuoteButton?: boolean;
}

const useStyles = makeStyles(theme => ({
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

const containsString = (prop: string, searchString: string) => {
  const byMultiple = searchString.split(' ').flatMap(value => prop?.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  return reduce((one: boolean, other: boolean) => one && other, true)(byMultiple);
};

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton }) => {
  const classes = useStyles();
  const quoteGroups = useContext(QuoteGroupsContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchString, setSearchString] = useState('');

  const [filteredResults, setFilteredResults] = useState<QuoteGroup[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    const filteredResults =
      searchString && searchString.length > 0 && quoteGroups
        ? filter((quoteGroup: QuoteGroup) => {
            return (
              containsString(quoteGroup.id, searchString) ||
              containsString(quoteGroup.origin.id, searchString) ||
              containsString(quoteGroup.origin.city, searchString) ||
              containsString(quoteGroup.destination.id, searchString) ||
              containsString(quoteGroup.destination.city, searchString) ||
              find((container: Container) => {
                return container.containerType ? containsString(container.containerType.id, searchString) : false;
              })(quoteGroup.containers) !== undefined ||
              find((commodityType: CommodityType) => {
                return containsString(commodityType.name, searchString);
              })(quoteGroup.commodityTypes) !== undefined ||
              find((quote: Quote) => {
                return quote.carrier ? containsString(quote.carrier.id, searchString) : false;
              })(quoteGroup.quotes) !== undefined
            );
          })(quoteGroups)
        : quoteGroups;

    setFilteredResults(filteredResults);
    return chunk(rowsPerPage)(filteredResults);
  }, [quoteGroups, searchString, page, rowsPerPage]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value));
  };

  const handleSearch = (searchStringNew: string) => {
    if (searchStringNew !== searchString) {
      setPage(0);
      setSearchString(searchStringNew);
    }
  };

  return (
    <Card>
      <CardHeader
        action={showGetQuoteButton && <GetQuotesButton />}
        title={
          <Box display="flex">
            <Typography variant="subtitle1" display="inline">
              Quotes
            </Typography>
            <Box flex={1} />
            <Search
              onSearch={handleSearch}
              style={{ visibility: quoteGroups && quoteGroups.length > 0 ? 'initial' : 'hidden' }}
            />
          </Box>
        }
      />
      <CardContent className={classes.content}>
        <QuoteGroupsTable quoteGroups={resultChunks && (get(page)(resultChunks) || [])} />
      </CardContent>
      <CardActions className={classes.actions}>
        {quoteGroups && quoteGroups.length > 0 && (
          <TablePagination
            component="div"
            count={filteredResults ? filteredResults.length : 0}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </CardActions>
    </Card>
  );
};

QuoteGroups.defaultProps = {
  showGetQuoteButton: true,
};

export default QuoteGroups;
