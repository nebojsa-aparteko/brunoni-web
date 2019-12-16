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
import set from 'lodash/fp/set';
import reduce from 'lodash/fp/reduce';
import orderBy from 'lodash/fp/orderBy';
import find from 'lodash/fp/find';
import flatMap from 'lodash/fp/flatMap';
import Search from './SearchBar/Search';
import Container from '../model/Container';
import CommodityType from '../model/CommodityType';
import { Quote, QuoteGroup } from '../providers/QuoteGroups';
import { QuoteListContext } from '../contexts/QuoteListContext';
import SynchronizeButton from './SynchronizeButton';
import flow from 'lodash/fp/flow';
import padStart from 'lodash/fp/padStart';
import DateRangeInput from './inputs/DateRangeInput';
import { DateRange } from './DateRangePicker/types';
import compareAsc from 'date-fns/compareAsc';
import compareDesc from 'date-fns/compareDesc';

interface Props {
  showGetQuoteButton?: boolean;
  showCompanyInfo?: boolean;
  className?: string;
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
  const byMultiple = flatMap((value: string) => prop?.toLowerCase().indexOf(value.toLowerCase()) !== -1)(
    searchString.split(' '),
  );
  return reduce((one: boolean, other: boolean) => one && other, true)(byMultiple);
};

const QuoteGroups: React.FC<Props> = ({ showGetQuoteButton, showCompanyInfo, className, ...rest }) => {
  const classes = useStyles();
  const quoteGroups = useContext(QuoteGroupsContext);

  const [dateRange, setDateRange] = useState<DateRange>();

  const [quoteListContextData, setQuoteListContextData] = useContext(QuoteListContext);

  const { searchString, page, rowsPerPage } = quoteListContextData;
  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(10);
  // const [searchString, setSearchString] = useState('');

  const [filteredResults, setFilteredResults] = useState<QuoteGroup[] | undefined | null>([]);

  const resultChunks = useMemo(() => {
    const dateFilteredQuoteGroups = filter(
      (quoteGroup: QuoteGroup) =>
        compareAsc(quoteGroup.dateIssued, dateRange?.startDate || new Date(1970, 1, 1)) !== -1 &&
        compareDesc(quoteGroup.dateIssued, dateRange?.endDate || new Date()) !== -1,
    )(quoteGroups);
    const filteredResults =
      searchString && searchString.length > 0 && dateFilteredQuoteGroups
        ? filter(
            (quoteGroup: QuoteGroup) =>
              containsString(quoteGroup.id, searchString) ||
              find((quote: Quote) => containsString(quote.id, searchString))(quoteGroup.quotes) !== undefined || // search through the quotes for online quotes
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
              find((quote: Quote) => {
                return quote.carrier ? containsString(quote.carrier.id, searchString) : false;
              })(quoteGroup.quotes) !== undefined,
          )(dateFilteredQuoteGroups)
        : dateFilteredQuoteGroups;

    const sortedFiltered = orderBy(
      [get('dateIssued'), flow(get('sortingId'), padStart(10))],
      ['desc', 'desc'],
    )(filteredResults);
    setFilteredResults(sortedFiltered);
    return chunk(rowsPerPage)(sortedFiltered);
  }, [quoteGroups, searchString, page, rowsPerPage, dateRange]);

  const setPage = (page: number) => {
    setQuoteListContextData(set('page', page)(quoteListContextData));
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setPage(0);
    setQuoteListContextData(set('rowsPerPage', parseInt(event.target.value))(quoteListContextData));
  };

  const handleSearch = (searchStringNew: string) => {
    if (searchStringNew !== searchString) {
      setPage(0);
      setQuoteListContextData(set('searchString', searchStringNew)(quoteListContextData));
    }
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    setDateRange(dateRange);
  };

  return (
    <Fragment>
      <Box display="flex" flexDirection="row-reverse" my={2}>
        <DateRangeInput onChange={handleDateRangeChange} />
      </Box>

      <Card className={className} {...rest}>
        <CardHeader
          action={showGetQuoteButton && <GetQuotesButton />}
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" display="inline">
                Quotes
              </Typography>
              <Box mx={1} my={-1}>
                <SynchronizeButton collection="quotes" />
              </Box>
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
