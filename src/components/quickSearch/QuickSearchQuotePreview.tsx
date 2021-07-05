import React, { Fragment } from 'react';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { Grid, Theme, Typography } from '@material-ui/core';
import InfoBoxItem from '../InfoBoxItem';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { portLongFormatLabel } from '../../utilities/formattedPortDisplay';
import { makeStyles } from '@material-ui/core/styles';
import { formatDateSafe } from '../../utilities/formattingHelpers';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import UserRecord from '../../model/UserRecord';
import { useClientById } from '../../hooks/useClient';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
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
  const client = useClientById(quote.clientId);
  const clientUser = useUserByAlphacomId(quote.userId) as UserRecord;

  const handlePropagation = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item md={3} xs={12}>
        <InfoBoxItem title="Quote" label1={quote.id} />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem title="Carrier" label1={quote.carrier?.name} />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem
          IconComponent={ChevronRightIcon}
          title="Place of Loading"
          label1={portLongFormatLabel(quote.origin)}
        />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem
          IconComponent={LastPageIcon}
          title="Place of Discharge"
          label1={portLongFormatLabel(quote.destination)}
        />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem title="Commodities" label1={quote.commodityTypes?.map(commodity => commodity.name).join(', ')} />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem
          title="Equipment"
          label1={
            <Typography style={{ whiteSpace: 'pre-wrap' }}>
              {quote.containers
                ?.map(
                  container =>
                    `${container.quantity && container.quantity > 0 ? container.quantity + ' x ' : ''}${container
                      .containerType?.description || ''}`,
                )
                .join(',\n')}
            </Typography>
          }
        />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem
          title="Customer"
          label1={client && `${client.name}, ${client.city}`}
          label2={
            <a href={'mailto:' + clientUser.emailAddress} onClick={handlePropagation}>
              {(clientUser.firstName + ' ' + clientUser.lastName).toUpperCase()}
            </a>
          }
        />
      </Grid>
      <Grid item md={3} xs={12}>
        <InfoBoxItem
          title="Validity"
          label1={`${formatDateSafe(quote.validityPeriod.from, 'dd.MM.yyyy')} - ${formatDateSafe(
            quote.validityPeriod.to,
            'dd.MM.yyyy',
          )}`}
        />
      </Grid>
    </Grid>
  );
};

export default QuickSearchQuotePreview;

interface Props {
  quote: Quote;
}
