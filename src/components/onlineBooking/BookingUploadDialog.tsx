import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { DropzoneArea } from 'material-ui-dropzone';
import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import UserRecord from '../../model/UserRecord';

import { HtmlBookingContainer, HtmlBookingRequest, Parse } from '../../utilities/bookingRequestHtmlParser';
import useUser from '../../hooks/useUser';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import Port from '../../model/Port';
import Carrier from '../../model/Carrier';
import Container from '../../model/Container';
import { createRequest } from './Summary';
import ContainerTypes from '../../contexts/ContainerTypes';
import CommodityTypes from '../../contexts/CommodityTypes';
import CommodityType from '../../model/CommodityType';
import ContainerType from '../../model/ContainerType';
import PickupLocations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import string_similarity from 'string-similarity';
import { isNil, omitBy } from 'lodash/fp';
import { useHistory } from 'react-router';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import RouteSearchParams from '../../model/route-search/RouteSearchParams';
import RouteSearchResults, { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import useGlobalAppState from '../../hooks/useGlobalAppState';

import { subDays } from 'date-fns';

const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogBody: {
      width: theme.spacing(100),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    dropZone: {
      border: '1px dashed black',
    },
    dropZoneDefault: {
      border: '1px solid transparent',
    },
    addBtn: {
      margin: theme.spacing(1),
    },
    progress: {
      position: 'absolute',
    },
  }),
);

const matchLocation = (
  pickupLocations: PickupLocation[] | undefined,
  container: HtmlBookingContainer,
): PickupLocation | undefined => {
  let locations = pickupLocations?.filter(location =>
    container.EMPTY_CONTAINER_PICK_UP_LOCATION?.POSTAL_CODE.includes(location?.zip),
  );
  locations = locations?.filter(location =>
    container.EMPTY_CONTAINER_PICK_UP_LOCATION?.COUNTRY_CODE.includes(location.countryCode),
  );

  const concatenatedAddresses = locations?.map(addr => {
    const address = addr.name + ' ' + addr.street + ' ' + addr.poBox + ' ' + addr.city;
    return address.toLowerCase();
  });
  const htmlAddress = container.EMPTY_CONTAINER_PICK_UP_LOCATION?.ADDRESS.join(' ').toLowerCase();
  const match = string_similarity.findBestMatch(htmlAddress as string, concatenatedAddresses as string[]);

  return locations?.[match.bestMatchIndex];
};
// todo better ?
const matchContainerType = (containerTypes: ContainerType[] | undefined, container: HtmlBookingContainer) => {
  let containerType = containerTypes?.find(
    containerType => container.TYPE?.includes(containerType.id) || container.SIZE?.includes(containerType.description),
  );
  // console.log(containerType)
  return containerType;
};
// todo better ?
const matchCommodityType = (commodityTypes: CommodityType[] | undefined, object: HtmlBookingRequest) => {
  const commodityTypeNames = commodityTypes?.map(type => type.name);
  const match = string_similarity.findBestMatch(object.CARGO_DESCRIPTION, commodityTypeNames as string[]);

  // console.log(object.CARGO_DESCRIPTION)
  // console.log('match')
  // console.log(match)

  const commodityType = match.bestMatch.rating > 0.5 ? commodityTypes?.[match.bestMatchIndex] : undefined;
  //console.log(commodityType)
  return commodityType;
};
// todo. date always in this format <2021-06-16 09:00> ?
const matchDate = (date?: string) => {
  return date ? new Date(date) : undefined;
};

const getContainers = (
  object: HtmlBookingRequest,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
): Container[] => {
  const containers = object.CONTAINERS.map(container => {
    const containerType = matchContainerType(containerTypes, container);
    const commodityType = matchCommodityType(commodityTypes, object);
    const pickupDate = matchDate(container.EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE);
    const pickupLocation = container.EMPTY_CONTAINER_PICK_UP_LOCATION
      ? matchLocation(pickupLocations, container)
      : undefined;

    return omitBy(isNil)({
      commodityType,
      containerType,
      pickupDate,
      pickupLocation,
      quantity: Number(container.QUANTITY),
    }) as Container;
  });
  return containers;
};

const fetchSchedule = async (scheduleSearchParams: RouteSearchParams, date?: string): Promise<RouteSearchResults> => {
  const queryObject = {
    origin: scheduleSearchParams?.originPort?.id,
    destination: scheduleSearchParams?.destinationPort?.id,
    weeks: scheduleSearchParams?.weeks.toString(),
    carrier: scheduleSearchParams?.carrier,
  };
  let query = querySting.stringify({
    ...queryObject,
    date,
  });
  const url = `${process.env.REACT_APP_API_URL}/routes?${query}`;
  const res = await fetch(url);
  const data = (await res.json()) as RouteSearchResults;
  return data;
};

const matchAndFetchSchedule = async (
  scheduleSearchParams: RouteSearchParams,
  object: HtmlBookingRequest,
): Promise<RouteSearchResult[]> => {
  let date = scheduleSearchParams?.date && formatDate(scheduleSearchParams?.date, 'yyyy-MM-dd');
  let data = await fetchSchedule(scheduleSearchParams, date);
  let schedules = data.Routes.filter(schedule => object.VESSEL.includes(schedule.OriginInfo.VoyageInfo.VesselName));
  schedules = schedules.filter(schedule => object.VOYAGE.includes(schedule.OriginInfo.VoyageInfo.VoyageNr));

  //if no match try again 3 days before departure date
  if (schedules.length === 0) {
    date = scheduleSearchParams?.date && formatDate(subDays(scheduleSearchParams?.date, 3), 'yyyy-MM-dd');
    data = await fetchSchedule(scheduleSearchParams, date);
    schedules = data.Routes.filter(schedule => object.VESSEL.includes(schedule.OriginInfo.VoyageInfo.VesselName));
    schedules = schedules.filter(schedule => object.VOYAGE.includes(schedule.OriginInfo.VoyageInfo.VoyageNr));
  }
  return schedules;
};

const mapIntoBookingRequestModel = async (
  object: HtmlBookingRequest,
  user: UserRecord,
  ports: Port[] | undefined,
  carriers: Carrier[] | undefined,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
): Promise<BookingRequest> => {
  const origin = ports?.find(port => object.PLACE_OF_CARRIER_RECEIPT.includes(port.id));
  const destination = ports?.find(port => object.PLACE_OF_CARRIER_DELIVERY.includes(port.id));
  const carrier = carriers?.find(carrier => object.CARRIER_ID.includes(carrier.name));
  const containers = getContainers(object, containerTypes, commodityTypes, pickupLocations);

  const departureDate = matchDate(object.SAIL_DATE);
  const scheduleSearchParams = {
    originPort: origin,
    destinationPort: destination,
    carrier: carrier,
    date: departureDate,
    weeks: 4,
  } as RouteSearchParams;

  const schedules = await matchAndFetchSchedule(scheduleSearchParams, object);

  //console.log(schedules)

  const schedule = schedules.length === 1 ? schedules[0] : undefined;

  const bookingRequest = omitBy(isNil)({
    archived: false,
    carrier,
    containers,
    createdAt: new Date(),
    createdBy: user,
    destination,
    origin,
    schedule,
    status: BookingRequestStatus.REQUESTED,
  }) as BookingRequest;

  return bookingRequest;
};

export const readAndParseFile = (
  file: File,
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  user: UserRecord,
  ports: Port[] | undefined,
  carriers: Carrier[] | undefined,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
) => {
  const reader = new FileReader();
  reader.readAsText(file, 'utf-8');
  reader.onload = async () => {
    setLoading(true);
    // Parse HTML
    const object = Parse(reader.result as string) as HtmlBookingRequest;
    // Create booking request
    const bookingRequest = (await mapIntoBookingRequestModel(
      object,
      user,
      ports,
      carriers,
      containerTypes,
      commodityTypes,
      pickupLocations,
    )) as BookingRequest;

    setLoading(false);

    setBookingRequest(bookingRequest);
  };
};

const BookingUploadDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useState<BookingRequest>();
  const [loading, setLoading] = useState<boolean>(false);
  const [, dispatch] = useGlobalAppState();
  const history = useHistory();

  const [, userRecord] = useUser();
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.every(file => ['html'].includes(file.name.split('.').pop() || ''))) {
        return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'File(s) must be .html format' });
      }
      acceptedFiles.forEach(file =>
        readAndParseFile(
          file,
          setBookingRequest,
          setLoading,
          userRecord,
          ports,
          carriers,
          containerTypes,
          commodityTypes,
          pickupLocations,
        ),
      );
    },
    [carriers, commodityTypes, containerTypes, dispatch, pickupLocations, ports, userRecord],
  );

  const handleBookingSave = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      bookingRequest &&
        createRequest(bookingRequest)
          .then(docReference => history.push(`/booking-requests/${docReference}`))
          .catch(error => console.error(error))
          .finally(() => dispatch({ type: 'STOP_GLOBAL_LOADING' }));
    } catch (e) {
      console.error('Booking Upload Dialog - FirestoreCollection threw an error', e);
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Upload Booking</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box>
            <DropzoneArea
              showPreviews={true}
              showPreviewsInDropzone={false}
              useChipsForPreview
              filesLimit={1}
              previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
              previewText="Selected files"
              alertSnackbarProps={{ autoHideDuration: 3000 }}
              onDrop={onDrop}
              onDelete={() => setBookingRequest(undefined)}
            />
            <Typography variant="caption">Hint: You can drag & drop HTML bookings file over input.</Typography>
            <Box display="flex">
              <Button
                onClick={handleBookingSave}
                variant="contained"
                color="primary"
                className={classes.addBtn}
                disabled={!bookingRequest || loading}
              >
                <CircularProgress
                  size={16}
                  color="inherit"
                  className={classes.progress}
                  style={{ visibility: loading ? 'visible' : 'hidden' }}
                />
                <span style={{ visibility: loading ? 'hidden' : 'visible' }}>Save Booking</span>
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default BookingUploadDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}
