import React from 'react';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { Box, Theme } from '@material-ui/core';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { portLongFormatLabel } from '../../utilities/formattedPortDisplay';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer',
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    borderStyle: 'outset',
    borderWidth: 1,
    '&:hover': {
      borderColor: '#999',
    },
    '&:focus': {
      outline: 'none',
    },
  },
}));

const QuickSearchQuotePreview: React.FC<Props> = ({ quote }) => {
  const classes = useStyles();

  return (
    <Box display="flex" justifyContent="space-between" className={classes.root}>
      <div>
        <InfoBoxItem title="Quote" label1={quote.id} />
      </div>
      <div>
        <InfoBoxItem title="Carrier" label1={quote.carrier?.name} />
      </div>
      <div>
        <InfoBoxItem
          IconComponent={ChevronRightIcon}
          title="Place of Loading"
          label1={portLongFormatLabel(quote.origin)}
        />
      </div>
      <div>
        <InfoBoxItem
          IconComponent={LastPageIcon}
          title="Place of Discharge"
          label1={portLongFormatLabel(quote.destination)}
        />
      </div>
    </Box>
  );
};

export default QuickSearchQuotePreview;

interface Props {
  quote: Quote;
}
