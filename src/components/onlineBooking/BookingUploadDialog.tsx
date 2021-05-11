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
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { BookingRequest, BookingRequestStatus } from '../../model/BookingRequest';
import UserRecord from '../../model/UserRecord';

import { Parse, HtmlBookingRequest, HtmlBookingContainer } from '../../utilities/bookingRequestHtmlParser';
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
import { isNil, omitBy, omit } from 'lodash/fp';
import { useHistory } from 'react-router';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import RouteSearchParams from '../../model/route-search/RouteSearchParams';
import RouteSearchResults from '../../model/route-search/RouteSearchResults';

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
  // console.log(container.EMPTY_CONTAINER_PICK_UP_LOCATION?.POSTAL_CODE)
  // console.log(htmlAddress)
  // console.log(match)
  const location = locations?.[match.bestMatchIndex];

  return location;
};
// todo better. types missing
const matchContainerType = (containerTypes: ContainerType[] | undefined, container: HtmlBookingContainer) => {
  const containerType = containerTypes?.find(
    containerType => container.TYPE?.includes(containerType.id) || container.SIZE?.includes(containerType.description),
  );
  // console.log(container.TYPE, container.SIZE)
  // console.log(containerType)
  return containerType;
};
// todo better. types missing
const matchCommodityType = (commodityTypes: CommodityType[] | undefined, object: HtmlBookingRequest) => {
  const commodityType = commodityTypes?.find(type => object.CARGO_DESCRIPTION.includes(type.name));
  // console.log(object.CARGO_DESCRIPTION)
  // console.log(commodityType)
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
    const commodityType = matchCommodityType(containerTypes, object);
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

const matchAndFetchSchedule = async (scheduleSearchParams: RouteSearchParams): Promise<RouteSearchResults> => {
  const date = scheduleSearchParams?.date && formatDate(scheduleSearchParams?.date, 'yyyy-MM-dd');
  const search = querySting.stringify({
    origin: scheduleSearchParams?.originPort?.id,
    destination: scheduleSearchParams?.destinationPort?.id,
    date,
    weeks: scheduleSearchParams?.weeks.toString(),
    carrier: scheduleSearchParams?.carrier,
  });

  const url = `${process.env.REACT_APP_API_URL}/routes?${search}`;
  const res = await fetch(url);
  const data = (await res.json()) as RouteSearchResults;
  return data;
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
    weeks: 3,
  } as RouteSearchParams;

  const schedule = await matchAndFetchSchedule(scheduleSearchParams);

  const bookingRequest = omitBy(isNil)({
    archived: false,
    carrier,
    containers,
    createdAt: new Date(),
    createdBy: user,
    destination,
    origin,
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
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [_, userRecord] = useUser();
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.every(file => ['html'].includes(file.name.split('.').pop() || ''))) {
        return enqueueSnackbar(<Typography color="inherit">File(s) must be .html format</Typography>, {
          variant: 'error',
        });
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
    [carriers, commodityTypes, containerTypes, enqueueSnackbar, pickupLocations, ports, userRecord],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleBookingPaste = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    console.log('here');
  };

  const handleBookingSave = () => {
    console.log('saved');
    // todo add uploaded files view
    try {
      bookingRequest &&
        createRequest(bookingRequest)
          .then(docReference => history.push(`/booking-requests/${docReference}`))
          .catch(error => console.log(error));
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
        <DialogContent className={classes.dialogContent} {...getRootProps()}>
          <input {...getInputProps()} />
          <Box>
            <TextField
              className={isDragActive ? classes.dropZone : classes.dropZoneDefault}
              id="booking-upload-dialog"
              InputLabelProps={{
                shrink: true,
              }}
              onClick={open}
              inputProps={{ style: { textAlign: 'center' } }}
              label={`Upload HTML Booking file inside this box`}
              variant="outlined"
              placeholder={`Please paste load HTML Booking files here`}
              multiline
              rows={10}
              onChange={handleBookingPaste}
              style={{ width: '100%' }}
              disabled={true}
            />
            <Typography variant="caption">Hint: You can drag & drop HTML bookings files over input.</Typography>
            <Box display="flex">
              <Button onClick={handleBookingSave} variant="contained" color="primary" className={classes.addBtn}>
                <CircularProgress
                  size={16}
                  color="inherit"
                  className={classes.progress}
                  style={{ visibility: loading ? 'visible' : 'hidden' }}
                />
                <span style={{ visibility: loading ? 'hidden' : 'visible' }}>Save Booking</span>
              </Button>
              <Button onClick={open} variant="contained" color="default" className={classes.addBtn} disabled={loading}>
                Attach File
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
