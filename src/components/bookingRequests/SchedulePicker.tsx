import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';
import RouteSearch from '../RouteSearch';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import Box from '@material-ui/core/Box';
import Port from '../../model/Port';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650,
  },
  dialogPaper: {
    border: '4px solid #00b0ff',
    borderRadius: '7px',
  },
  dialogContent: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 4,
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
}));

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  quote?: Quote;
  handleBookNow: (schedule?: RouteSearchResult) => void;
  origin?: Port;
  destination?: Port;
}

const SchedulePicker: React.FC<Props> = ({ isOpen, handleClose, quote, handleBookNow, origin, destination }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="lg" classes={{ paper: classes.dialogPaper }}>
      <DialogTitle disableTypography id="schedulePickerDialogTitle">
        <Typography variant="h4">Choose the schedule that best suits your needs</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box width="100%">
          <RouteSearch
            isPicker={true}
            origin={quote ? quote.origin : origin || undefined}
            destination={quote ? quote.destination : destination || undefined}
            handleBookNow={handleBookNow}
            carrier={quote?.carrier}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePicker;
