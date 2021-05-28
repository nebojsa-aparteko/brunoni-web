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

interface Object {
  [key: string]: string;
}

export const WatchedFields: Object = {
  carrier: 'Carrier',
  schedule: 'Schedule',
  vgmSubmittedBy: 'VGM Submission By',
  assignedUser: 'Watcher (Assigned agent)',
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

const MissingFields: React.FC<Props> = ({
  bookingRequest,
  watchedFields = defaultWatchedFields,
  containerWatchedFields = defaultContainerWatchedFields,
}) => {
  const classes = useStyles();

  const [nonMatchingFields, setNonMatchingFields] = useState<string[]>();
  const [containersNonMatchingFields, setContainersNonMatchingFields] = useState<string[][]>();

  const findNonMatchingFields = useCallback((): string[] => {
    return watchedFields.filter(field => !hasIn(field)(bookingRequest));
  }, [bookingRequest, watchedFields]);

  const findContainerNonMatchingFields = useCallback((): string[][] => {
    const containersNonMatchingFields: string[][] = [];
    bookingRequest.containers?.forEach(container => {
      const containerNonMatchingFields = containerWatchedFields.filter(field => !hasIn(field)(container));
      containersNonMatchingFields.push(containerNonMatchingFields);
    });

    return containersNonMatchingFields;
  }, [bookingRequest.containers, containerWatchedFields]);

  useEffect(() => {
    setNonMatchingFields(findNonMatchingFields());
    setContainersNonMatchingFields(findContainerNonMatchingFields());
  }, [findContainerNonMatchingFields, findNonMatchingFields]);

  return (nonMatchingFields && nonMatchingFields.length > 0) ||
    (containersNonMatchingFields && !containersNonMatchingFields.every(isEmpty)) ? (
    <Paper className={classes.additionalInfo}>
      <Box border={1} borderColor={'error.main'}>
        <ExpansionPanel defaultExpanded={true} TransitionProps={{ unmountOnExit: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Missing fields</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box display={'flex'} flexDirection={'column'}>
              {nonMatchingFields && nonMatchingFields.length > 0 && (
                <>
                  <Typography variant="h4">These fields were not found on Inttra booking: </Typography>
                  <List dense={true}>
                    {nonMatchingFields.map((field, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FiberManualRecordIcon color={'error'} fontSize={'small'} />
                        </ListItemIcon>
                        <ListItemText>{WatchedFields[field]}</ListItemText>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {containersNonMatchingFields && !containersNonMatchingFields.every(isEmpty) && (
                <Box display={'flex'} flexWrap={'wrap'}>
                  {containersNonMatchingFields.map((container, index) => (
                    <List key={index} disablePadding={true}>
                      <ListItem>
                        <ListItemText>
                          <Typography variant="h4">Container {index + 1}: </Typography>
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
