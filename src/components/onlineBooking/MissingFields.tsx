import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  ExpansionPanelSummary,
  ExpansionPanel,
  ExpansionPanelDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { hasIn, isEmpty } from 'lodash/fp';
import { BookingRequest } from '../../model/BookingRequest';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useUser from '../../hooks/useUser';
import { isDashboardUser } from '../../model/UserRecord';
import { isBefore } from 'date-fns/fp';
import theme from '../../theme';
import { isShipperOwnedContainer } from '../../hooks/useCodebook';
import Container from '../../model/Container';
import { normalizeQuote } from './BookingUploadDialog';
import { Quote } from '../../providers/QuoteGroupsProvider';
import firebase from '../../firebase';

export interface Object {
  [key: string]: string;
}

export const WatchedFields: Object = {
  carrier: 'Carrier',
  schedule: 'Schedule',
  vgmSubmittedBy: 'VGM Submission By',
  assignedUser: 'Watcher (Assigned agent)',
  freightDetails: 'Freight details',
};

export const ContainerWatchedFields: Object = {
  commodityType: 'Commodity Type',
  containerType: 'Container Type',
  pickupDate: 'Pickup Date', // todo. Review later
  pickupLocation: 'Pickup/Dropoff Location in Europe',
  quantity: 'Quantity',
};

export const defaultWatchedFields: string[] = Object.keys(WatchedFields);
export const defaultContainerWatchedFields: string[] = Object.keys(ContainerWatchedFields);

const useStyles = makeStyles((theme: Theme) => ({
  additionalInfo: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));

export const getQuoteDoc = async (quoteId: string) =>
  (
    await firebase
      .firestore()
      .collection('quotes')
      .doc(quoteId)
      .get()
  ).data();

const validQuote = async (bookingRequest: BookingRequest) => {
  const quote = bookingRequest.quoteNumber && (await getQuoteDoc(`${bookingRequest.quoteNumber}`));
  const quoteNormalized = normalizeQuote(quote) as Quote;

  const quoteValidityDate = quoteNormalized?.validityPeriod.to ? quoteNormalized?.validityPeriod.to : undefined;

  const scheduleDepartureDate = bookingRequest.schedule?.OriginInfo.DepartureDate
    ? new Date(bookingRequest.schedule?.OriginInfo.DepartureDate)
    : undefined;

  // console.log('quoteValidityDate', quoteValidityDate)
  // console.log('scheduleDepartureDate', scheduleDepartureDate)

  if (quoteValidityDate && scheduleDepartureDate) {
    return isBefore(quoteValidityDate)(scheduleDepartureDate);
  }
  return true;
};

const MissingFields: React.FC<Props> = ({
  bookingRequest,
  watchedFields = defaultWatchedFields,
  containerWatchedFields = defaultContainerWatchedFields,
}) => {
  const classes = useStyles();

  const userRecord = useUser()[1];

  const [nonMatchingFields, setNonMatchingFields] = useState<string[]>();
  const [containersNonMatchingFields, setContainersNonMatchingFields] = useState<string[][]>();
  const [validQuoteState, setValidQuoteState] = useState(true);

  const findNonMatchingFields = useCallback((): string[] => {
    return watchedFields.filter(field => !hasIn(field)(bookingRequest));
  }, [bookingRequest, watchedFields]);

  const containerHasNoDropOffLocation = (container: Container) => {
    return !!(container.containerType?.id && isShipperOwnedContainer(container.containerType.id));
  };

  const findContainerNonMatchingFields = useCallback((): string[][] => {
    const containersNonMatchingFields: string[][] = [];
    bookingRequest.containers?.forEach(container => {
      const containerNonMatchingFields = containerWatchedFields.filter(field => {
        return field === 'pickupLocation' && containerHasNoDropOffLocation(container)
          ? false
          : !hasIn(field)(container);
      });
      containersNonMatchingFields.push(containerNonMatchingFields);
    });

    return containersNonMatchingFields;
  }, [bookingRequest.containers, containerWatchedFields]);

  /*
  Thanks for using our online services.
  Your booking request has been submitted and is in requested status.
  You are allowed to make changes as long the booking is not in status In Progress.
  The next available booking agent will take care and check the availabilities.
*/

  useEffect(() => {
    validQuote(bookingRequest).then(vq => setValidQuoteState(vq));
    setNonMatchingFields(findNonMatchingFields());
    setContainersNonMatchingFields(findContainerNonMatchingFields());
  }, [bookingRequest, findContainerNonMatchingFields, findNonMatchingFields]);

  return (nonMatchingFields && nonMatchingFields.length > 0) ||
    (containersNonMatchingFields && !containersNonMatchingFields.every(isEmpty)) ? (
    <Paper className={classes.additionalInfo}>
      <Box border={1} borderColor={'error.main'}>
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">{isDashboardUser(userRecord) ? 'Warning message' : ''}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box display={'flex'} flexDirection={'column'}>
              {!validQuoteState && bookingRequest.schedule && (
                <Typography color={'error'} style={{ marginBottom: theme.spacing(2) }}>
                  {`You are booking on a vessel with an expired quotation date`}
                </Typography>
              )}
              <Typography variant="h4" style={{ whiteSpace: 'pre-line', paddingBottom: theme.spacing(1) }}>
                {isDashboardUser(userRecord)
                  ? 'These fields were not found on booking:'
                  : 'Thanks for using our online services.\n' +
                    '  Your booking request has been submitted and is in requested status.\n' +
                    '  You are allowed to make changes as long as the booking is not in status: In Progress.\n\n' +
                    '  The next available booking agent will take care and check the availabilities. Thank you.'}
              </Typography>
              {nonMatchingFields && nonMatchingFields.length > 0 && (
                <List dense={true}>
                  {isDashboardUser(userRecord) &&
                    nonMatchingFields.map((field, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FiberManualRecordIcon color={'error'} fontSize={'small'} />
                        </ListItemIcon>
                        <ListItemText>{WatchedFields[field]}</ListItemText>
                      </ListItem>
                    ))}
                </List>
              )}
              {isDashboardUser(userRecord) &&
                containersNonMatchingFields &&
                !containersNonMatchingFields.every(isEmpty) && (
                  <Box display={'flex'} flexWrap={'wrap'}>
                    {containersNonMatchingFields.map((container, index) => (
                      <List key={index} disablePadding={true}>
                        <ListItem>
                          <ListItemText>
                            <Typography variant="h5">Container {index + 1}: </Typography>
                          </ListItemText>
                        </ListItem>
                        <List dense={true}>
                          {container.map((field, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <FiberManualRecordIcon color={'error'} fontSize={'small'} />
                              </ListItemIcon>
                              <ListItemText>{ContainerWatchedFields[field]}</ListItemText>
                            </ListItem>
                          ))}
                        </List>
                      </List>
                    ))}
                  </Box>
                )}
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Box>
    </Paper>
  ) : null;
};

export default MissingFields;

interface Props {
  bookingRequest: BookingRequest;
  watchedFields?: string[];
  containerWatchedFields?: string[];
}
