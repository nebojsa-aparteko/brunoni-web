import React, { useCallback, useContext, useMemo, useState } from 'react';
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
import { BookingRequest, BookingRequestStatus, VGMSubmittedBy } from '../../model/BookingRequest';
import UserRecord from '../../model/UserRecord';

import { HtmlBookingContainer, HtmlBookingRequest, Parse } from '../../utilities/bookingRequestHtmlParser';
import useUser from '../../hooks/useUser';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import Port from '../../model/Port';
import Carrier from '../../model/Carrier';
import Container, { Ventilation } from '../../model/Container';
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
import { saveFilesToFirestore } from '../bookings/InternalStorage';
import { ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import { fileWithExt } from '../bookings/checklist/ChecklistItemRow';
import firebase from '../../firebase';
import { globalActions } from '../../store/types/globalAppState';
import MissingFields, { defaultWatchedFields } from './MissingFields';
import Client from '../../model/Client';
import { Quote } from '../../providers/QuoteGroupsProvider';
import { getRelevantFreightDetails } from './ShippingInfo';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import getEnumKeyByEnumValue from '../../utilities/getEnumKeyByEnumValue';

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
    container.EMPTY_CONTAINER_PICK_UP_LOCATION?.COUNTRY_CODE?.includes(location.countryCode),
  );
  // todo. Keep it?
  locations = locations?.filter(location =>
    container.EMPTY_CONTAINER_PICK_UP_LOCATION?.POSTAL_CODE?.includes(location.zip),
  );

  const concatenatedAddresses = locations?.map(addr => {
    const address = addr.name + ' ' + addr.street + ' ' + addr.poBox + ' ' + addr.city;
    return address.toLowerCase();
  });

  if (concatenatedAddresses?.length === 0) return undefined;

  const htmlAddress = container.EMPTY_CONTAINER_PICK_UP_LOCATION?.ADDRESS.join(' ').toLowerCase();

  const match = string_similarity.findBestMatch(htmlAddress as string, concatenatedAddresses as string[]);

  return locations?.[match.bestMatchIndex];
};
// todo better ?
const matchContainerType = (containerTypes: ContainerType[] | undefined, container: HtmlBookingContainer) => {
  const containerType = containerTypes?.find(
    containerType => container.TYPE?.includes(containerType.id) || container.SIZE?.includes(containerType.description),
  );
  return containerType;
};
// todo better ?
const matchCommodityType = (commodityTypes: CommodityType[] | undefined, object: HtmlBookingRequest) => {
  if (!object.CARGO_DESCRIPTION) return;
  const commodityTypeNames = commodityTypes?.map(type => type.name);
  const match = string_similarity.findBestMatch(object.CARGO_DESCRIPTION, commodityTypeNames as string[]);

  const commodityType = match.bestMatch.rating > 0.5 ? commodityTypes?.[match.bestMatchIndex] : undefined;

  return commodityType;
};

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

    // Reefer settings
    const temperature = Number(container.TEMPERATURE);
    const ventilation =
      container.VENTILATION && getEnumKeyByEnumValue(Ventilation, container.VENTILATION.toUpperCase());

    return omitBy(isNil)({
      commodityType,
      containerType,
      pickupDate,
      pickupLocation,
      quantity: Number(container.QUANTITY),
      temperature,
      ventilation,
      weight: Number(container.NET_WEIGHT),
    }) as Container;
  });
  return containers;
};

const validScheduleSearch = (search: RouteSearchParams) => {
  return search.carrier && search.originPort && search.destinationPort && search.date;
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
): Promise<RouteSearchResult[] | undefined> => {
  // return undefined if params are not valid
  if (!validScheduleSearch(scheduleSearchParams)) return;

  let date = scheduleSearchParams?.date && formatDate(scheduleSearchParams?.date, 'yyyy-MM-dd');
  let data = await fetchSchedule(scheduleSearchParams, date);
  let schedules = data.Routes.filter(schedule =>
    object.VESSEL?.toUpperCase()?.includes(schedule.OriginInfo.VoyageInfo.VesselName),
  );
  // only filter more if more than 1
  if (schedules.length > 1 && object.VOYAGE)
    schedules = schedules.filter(schedule => object.VOYAGE?.includes(schedule.OriginInfo.VoyageInfo.VoyageNr));
  //if no match try again 3 days before departure date
  if (schedules.length === 0) {
    date = scheduleSearchParams?.date && formatDate(subDays(scheduleSearchParams?.date, 3), 'yyyy-MM-dd');
    data = await fetchSchedule(scheduleSearchParams, date);
    schedules = data.Routes.filter(schedule => object.VESSEL?.includes(schedule.OriginInfo.VoyageInfo.VesselName));
    // only filter more if more than 1
    if (schedules.length > 1 && object.VOYAGE)
      schedules = schedules.filter(schedule => object.VOYAGE?.includes(schedule.OriginInfo.VoyageInfo.VoyageNr));
  }
  return schedules;
};

const getClientById = async (id: string): Promise<Client> => {
  const client = await firebase
    .firestore()
    .collection('clients')
    .doc(id)
    .get();
  return client.data() as Client;
};

const getUserByEmail = async (email: string): Promise<UserRecord> => {
  const usersRef = await firebase
    .firestore()
    .collection('users')
    .where('emailAddress', '==', email)
    .get();
  return (usersRef.docs.map(user => user.data())[0] as UserRecord) || undefined;
};

const getLatestQuote = async (originId: string, destinationId: string) => {
  const quotesRef = await firebase
    .firestore()
    .collection('quotes')
    .where('origin', '==', originId)
    .where('destination', '==', destinationId)
    .orderBy('dateIssued', 'desc')
    .limit(1)
    .get();
  return (quotesRef.docs.map(quote => quote.data()) as Quote[])[0] || undefined;
};

const mapIntoBookingRequestModel = async (
  object: HtmlBookingRequest,
  user: UserRecord,
  ports: Port[] | undefined,
  carriers: Carrier[] | undefined,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
  chargeCodes: ChargeCode[] | undefined,
): Promise<BookingRequest> => {
  const createdBy = object.BOOKER_CONTACT_EMAIL
    ? // todo. Could there be duplicates?
      await getUserByEmail(object.BOOKER_CONTACT_EMAIL.toLowerCase())
    : undefined;
  const vgmSubmittedBy = VGMSubmittedBy.CLIENT;
  const client = createdBy?.alphacomClientId ? await getClientById(createdBy.alphacomClientId) : undefined;

  const agreementNo = object.CONTRACT_NUMBER;
  const customerReference = object.FREIGHT_FORWARDERS_REFERENCE_NUMBERS
    ? object.FREIGHT_FORWARDERS_REFERENCE_NUMBERS[0]
    : undefined;

  const carrier = object.CARRIER_ID
    ? carriers?.find(carrier => {
        const match = string_similarity.compareTwoStrings(object.CARRIER_ID as string, carrier.name);
        return match > 0.7;
      })
    : undefined;

  const containers = getContainers(object, containerTypes, commodityTypes, pickupLocations);
  const inttraRefNumber = object.INTTRA_REFERENCE_NUMBER;
  const origin = ports?.find(port => object.PLACE_OF_CARRIER_RECEIPT?.includes(port.id));
  const destination = ports?.find(port => object.PLACE_OF_CARRIER_DELIVERY?.includes(port.id));
  const departureDate = matchDate(object.SAIL_DATE);
  const scheduleSearchParams = {
    originPort: origin,
    destinationPort: destination,
    carrier: carrier,
    date: departureDate,
    weeks: 4,
  } as RouteSearchParams;

  // Get the latest quote by origin and dest
  const quote = origin && destination && (await getLatestQuote(origin.id, destination.id));
  const freightDetails = quote && getRelevantFreightDetails(quote.quoteDetails, chargeCodes);

  //console.log(freightDetails)

  const schedules = await matchAndFetchSchedule(scheduleSearchParams, object);
  const schedule = schedules?.length === 1 ? schedules?.[0] : undefined;

  const bookingRequest = {
    agreementNo,
    archived: false,
    carrier,
    client,
    containers,
    createdAt: new Date(),
    createdBy,
    customerReference,
    destination,
    freightDetails,
    inttraRefNumber,
    origin,
    schedule,
    status: BookingRequestStatus.REQUESTED,
    vgmSubmittedBy,
  } as BookingRequest;

  console.log(bookingRequest);

  return bookingRequest;
};

export const readAndParseFile = (
  file: File,
  dispatch: React.Dispatch<globalActions>,
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFiles: React.Dispatch<React.SetStateAction<File[]>>,
  user: UserRecord,
  ports: Port[] | undefined,
  carriers: Carrier[] | undefined,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
  chargeCodes: ChargeCode[] | undefined,
) => {
  const reader = new FileReader();
  // accepting only single booking 4 now...
  reader.readAsText(file, 'utf-8');
  reader.onload = async () => {
    setLoading(true);
    try {
      // Parse HTML
      const object = Parse(reader.result as string) as HtmlBookingRequest;
      console.log(object);
      // throw error of no object
      if (!object) {
        setBookingRequest(undefined);
        setLoading(false);
        return dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          message: 'File must be of type: Booking - Requested',
          duration: 4000,
        });
      }
      // Create booking request
      let bookingRequest = await mapIntoBookingRequestModel(
        object,
        user,
        ports,
        carriers,
        containerTypes,
        commodityTypes,
        pickupLocations,
        chargeCodes,
      );

      // remove undefined fields
      bookingRequest = omitBy(isNil)(bookingRequest) as BookingRequest;
      setFiles([file]);
      setBookingRequest(bookingRequest);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: error.message, duration: 4000 });
    }
  };
};

const BookingUploadDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useState<BookingRequest>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [, dispatch] = useGlobalAppState();
  const history = useHistory();

  const [, userRecord] = useUser();
  const ports = useContext(Ports);
  const carriers = useContext(Carriers);
  const containerTypes = useContext(ContainerTypes);
  const commodityTypes = useContext(CommodityTypes);
  const pickupLocations = useContext(PickupLocations);
  const chargeCodes = useContext(ChargeCodes);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.every(file => ['html'].includes(file.name.split('.').pop() || ''))) {
        return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'File must be of .html format' });
      }
      acceptedFiles.forEach(file => {
        readAndParseFile(
          file,
          dispatch,
          setBookingRequest,
          setLoading,
          setFiles,
          userRecord,
          ports,
          carriers,
          containerTypes,
          commodityTypes,
          pickupLocations,
          chargeCodes,
        );
      });
    },
    [carriers, chargeCodes, commodityTypes, containerTypes, dispatch, pickupLocations, ports, userRecord],
  );

  const storageBasePath = useMemo((): string => {
    return [`bookings-requests-documents-internal`, bookingRequest?.id].join('/');
  }, [bookingRequest]);

  const saveFiles = useCallback(
    async (files: File[]): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          const fileWithExtension = fileWithExt(file.name);
          const storedFileName = `${fileWithExtension.name}_${new Date().getTime()}.${fileWithExtension.ext}`;
          let path = [storageBasePath, storedFileName].join('/');

          let storageRef = firebase.storage().ref(encodeURI(path));
          let uploadTask = storageRef.put(file);

          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
              console.log('progress: ', (snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            error => {
              reject(error);
              console.error(error);
              dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to upload file!' });
            },
            () => {
              // success
              storageRef.updateMetadata({
                contentDisposition: `attachment; filename=${file.name}`,
              });
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                resolve({ url: downloadURL, name: file.name, storedName: storedFileName });
              });
            },
          );
        });
      };

      const requests = files.map((file: File) => {
        return uploadFile(file).then(storedItem => {
          return storedItem;
        });
      });

      return Promise.all(requests);
    },
    [dispatch, storageBasePath],
  );

  const handleBookingSave = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      bookingRequest &&
        createRequest(bookingRequest)
          .then(async docReference => {
            // Save HTML file to storage
            try {
              const documents = (await saveFiles(files)) as ChecklistItemValueDocument[];
              const values = documents.map(
                item =>
                  ({
                    uploadedBy: userRecord,
                    uploadedAt: new Date(),
                    name: item.name,
                    url: item.url,
                    storedName: item.storedName,
                  } as ChecklistItemValueDocument),
              );
              values.map(value => saveFilesToFirestore('bookings-requests', docReference, value));
            } catch (e) {
              return dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: 'Failed to upload file!' });
            } finally {
              history.push(`/booking-requests/${docReference}`);
            }
          })
          .catch(error => {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
            console.error(error);
          })
          .finally(() => {
            dispatch({ type: 'STOP_GLOBAL_LOADING' });
          });
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
              disableRejectionFeedback={true}
              acceptedFiles={['.html']}
              showPreviews={!!bookingRequest}
              showPreviewsInDropzone={false}
              showAlerts={['error']}
              useChipsForPreview
              filesLimit={1}
              dropzoneProps={{ disabled: loading }}
              alertSnackbarProps={{ autoHideDuration: 4000 }}
              previewChipProps={{ disabled: !bookingRequest || loading }}
              previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
              previewText="Selected files"
              onDrop={onDrop}
              onDelete={() => {
                setBookingRequest(undefined);
              }}
            />
            <Typography variant="caption">Hint: You can drag & drop HTML booking file over input.</Typography>
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
            {bookingRequest && (
              <MissingFields
                bookingRequest={bookingRequest}
                watchedFields={defaultWatchedFields.filter(field => field !== 'assignedUser')}
              />
            )}
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
