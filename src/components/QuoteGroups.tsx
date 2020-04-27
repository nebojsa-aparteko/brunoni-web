import React, { useContext, useMemo, useState, Fragment } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  makeStyles,
  Paper,
  TablePagination,
  Typography,
  Container as MUIContainer,
} from '@material-ui/core';
import GetQuotesButton from './GetQuotesButton';
import QuoteGroupsContext from '../contexts/QuoteGroupsContext';
import QuoteGroupsTable from './quotes/QuoteGroupsTable';
import chunk from 'lodash/fp/chunk';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import set from 'lodash/fp/set';
import orderBy from 'lodash/fp/orderBy';
import find from 'lodash/fp/find';
import Search from './SearchBar/Search';
import Container from '../model/Container';
import CommodityType from '../model/CommodityType';
import { Quote, QuoteGroup } from '../providers/QuoteGroupsProvider';
import { QuoteListFilterContext } from '../providers/QuoteListFilterContext';
import flow from 'lodash/fp/flow';
import padStart from 'lodash/fp/padStart';
import compareAsc from 'date-fns/compareAsc';
import compareDesc from 'date-fns/compareDesc';
import addDays from 'date-fns/addDays';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import QuotesFiltersBar from './SearchBar/QuotesFiltersBar';
import containsString from '../utilities/containsString';
import { useQuotesContext } from '../providers/QuotesProvider';

interface Props {
  showGetQuoteButton?: boolean;
  showCompanyInfo?: boolean;
  className?: string;
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

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton = true, showCompanyInfo, className, ...rest }) => {
  const classes = useStyles();
  const quoteGroups = useContext(QuoteGroupsContext);

  const [quoteListContextData, setQuoteListContextData] = useContext(QuoteListFilterContext);

  const { searchString, page, rowsPerPage } = quoteListContextData;

  const [filteredResults, setFilteredResults] = useState<QuoteGroup[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    const dateFilteredQuoteGroups = filter((quoteGroup: QuoteGroup) => !quoteGroup.quotes[0].archived)(quoteGroups);

    const filteredResults =
      searchString && searchString.length > 0 && dateFilteredQuoteGroups
        ? filter(
            (quoteGroup: QuoteGroup) =>
              containsString(quoteGroup.id, searchString) ||
              (quoteGroup.quotes[0].placeOfReceiptName
                ? containsString(quoteGroup.quotes[0].placeOfReceiptName!, searchString)
                : false) ||
              (quoteGroup.quotes[0].placeOfDeliveryName
                ? containsString(quoteGroup.quotes[0].placeOfDeliveryName!, searchString)
                : false) ||
              containsString(quoteGroup.origin?.id || '', searchString) ||
              containsString(quoteGroup.origin?.city || '', searchString) ||
              containsString(quoteGroup.destination?.id || '', searchString) ||
              containsString(quoteGroup.destination?.city || '', searchString) ||
              find((container: Container) => {
                return container.containerType ? containsString(container.containerType.name, searchString) : false;
              })(quoteGroup.containers) !== undefined ||
              find((commodityType: CommodityType) => {
                return containsString(commodityType.name, searchString);
              })(quoteGroup.commodityTypes) !== undefined ||
              find(
                (quote: Quote) =>
                  (quote.carrier ? containsString(quote.carrier.id, searchString) : false) ||
                  containsString(quote.id, searchString),
              )(quoteGroup.quotes) !== undefined,
          )(dateFilteredQuoteGroups)
        : dateFilteredQuoteGroups;

    const sortedFiltered = orderBy(
      [get('dateIssued'), flow(get('sortingId'), padStart(10))],
      ['desc', 'desc'],
    )(filteredResults);

    setFilteredResults(sortedFiltered);

    return chunk(rowsPerPage)(sortedFiltered);
  }, [quoteGroups, searchString, page, rowsPerPage]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setQuoteListContextData(set('page', page)(quoteListContextData));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setQuoteListContextData(
      flow(set('rowsPerPage', parseInt(event.target.value)), set('page', 0))(quoteListContextData),
    );
  };

  const handleSearch = (searchStringNew: string) => {
    if (searchStringNew !== searchString) {
      setQuoteListContextData(flow(set('searchString', searchStringNew), set('page', 0))(quoteListContextData));
    }
  };

  if (!quoteGroups) {
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
      <QuotesFiltersBar showClientFilter={showCompanyInfo} showDateRange={true} showRefreshButton />

      <Card className={className} {...rest}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" display="inline">
                Quotes
              </Typography>
              {showGetQuoteButton && (
                <Box ml={4}>
                  <GetQuotesButton />
                </Box>
              )}
              <Box flex={1} />
              <Search
                onSearch={handleSearch}
                style={{ visibility: quoteGroups && quoteGroups.length > 0 ? 'initial' : 'hidden' }}
              />
            </Box>
          }
        />
        <CardContent className={classes.content}>
          <QuoteGroupsTable
            showCompanyInfo={showCompanyInfo}
            quoteGroups={resultChunks && (get(page)(resultChunks) || [])}
          />
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
    </Fragment>
  );
};

QuoteGroups.defaultProps = {
  showGetQuoteButton: true,
};

export default QuoteGroups;
