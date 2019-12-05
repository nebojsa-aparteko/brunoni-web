import React, { useContext, useMemo, useState, Fragment } from 'react';
import { CardContent, CardHeader, Card, makeStyles, CardActions, TablePagination } from '@material-ui/core';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import GetQuotesButton from './GetQuotesButton';
import QuoteGroupsTable from './quotes/QuoteGroupsTable';
import chunk from 'lodash/fp/chunk';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import Search from './SearchBar/Search';
import { Quote, QuoteGroup } from '../providers/QuotesEndpoint';
import Container from '../model/Container';
import CommodityType from '../model/CommodityType';

interface Props {
  showGetQuoteButton?: boolean;
}

const useStyles = makeStyles(theme => ({
  searchBar: {
    marginBottom: theme.spacing(2),
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

const containsString = (prop: string, searchString: string) => {
  return prop?.toLowerCase().indexOf(searchString?.toLowerCase()) != -1;
};

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton }) => {
  const classes = useStyles();
  const { result } = useContext(QuotesEndpointContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchString, setSearchString] = useState('');

  const [filteredResults, setFilteredResults] = useState<QuoteGroup[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    const filteredResults =
      searchString && searchString.length > 0 && result
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
          })(result)
        : result;

    setFilteredResults(filteredResults);
    return chunk(rowsPerPage)(filteredResults);
  }, [result, searchString, page, rowsPerPage]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value));
  };

  const handleSearch = (searchString: string) => {
    setPage(0);
    setSearchString(searchString);
  };

  return (
    <Fragment>
      {result && result.length > 0 && <Search onSearch={handleSearch} className={classes.searchBar} />}
      <Card>
        <CardHeader action={showGetQuoteButton && <GetQuotesButton />} title="Quotes" />
        <CardContent className={classes.content}>
          <QuoteGroupsTable quoteGroups={resultChunks && (get(page)(resultChunks) || [])} />
        </CardContent>
        <CardActions className={classes.actions}>
          {result && result.length > 0 && (
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
    </Fragment>
  );
};

QuoteGroups.defaultProps = {
  showGetQuoteButton: true,
};

export default QuoteGroups;
