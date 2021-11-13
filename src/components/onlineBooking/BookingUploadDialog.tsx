import React, { useContext, useMemo, useState } from 'react';
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
import {
  BookingRequest,
  BookingRequestStatusCode,
  BookingRequestStatusText,
  VGMSubmittedBy,
} from '../../model/BookingRequest';
import UserRecord from '../../model/UserRecord';

import { HtmlBookingContainer, HtmlBookingRequest, Parse } from '../../utilities/bookingRequestHtmlParser';
import useUser from '../../hooks/useUser';
import Ports from '../../contexts/Ports';
import Carriers from '../../contexts/Carriers';
import Port from '../../model/Port';
import Carrier from '../../model/Carrier';
import Container, { Ventilation } from '../../model/Container';
import { createRequest, getItineraryFromSchedule, takeQuoteDetails } from './Summary';
import ContainerTypes from '../../contexts/ContainerTypes';
import CommodityTypes from '../../contexts/CommodityTypes';
import CommodityType from '../../model/CommodityType';
import ContainerType from '../../model/ContainerType';
import PickupLocations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import string_similarity from 'string-similarity';
import { compact, flow, isNil, omitBy, update } from 'lodash/fp';
import { useHistory } from 'react-router';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import RouteSearchParams from '../../model/route-search/RouteSearchParams';
import RouteSearchResults, { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import useGlobalAppState from '../../hooks/useGlobalAppState';

import { subDays } from 'date-fns';
import { saveFilesToFirestore } from '../bookings/InternalStorage';
import { ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import firebase from '../../firebase';
import { globalActions } from '../../store/types/globalAppState';
import MissingFields, { defaultWatchedFields } from './MissingFields';
import Client from '../../model/Client';
import { normalizeDateRange, Quote } from '../../providers/QuoteGroupsProvider';
import ChargeCodes from '../../contexts/ChargeCodes';
import ChargeCode from '../../model/ChargeCode';
import getEnumKeyByEnumValue from '../../utilities/getEnumKeyByEnumValue';
import useSaveFiles from '../../hooks/useSaveFiles';
import DropZoneArea from '../dropzone/DropZoneArea';
import safeInvoke from '../../utilities/safeInvoke';
import ContainerDetails from '../../model/ContainerDetails';
import { generateCommission, isAgencyCommission } from '../bookingRequests/BookingRequestFreightDetails';
import { getVoyageInfo } from '../bookingRequests/BookingRequestView';
import useNormalizeQuote from '../../hooks/useNormalizedQuote';

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
  return containerTypes?.find(
    containerType => container.TYPE?.includes(containerType.id) || container.SIZE?.includes(containerType.description),
  );
};
// todo better ?
const matchCommodityType = (commodityTypes: CommodityType[] | undefined, object: HtmlBookingRequest) => {
  if (!object.CARGO_DESCRIPTION) return;
  const commodityTypeNames = commodityTypes?.map(type => type.name);
  const match = string_similarity.findBestMatch(object.CARGO_DESCRIPTION, commodityTypeNames as string[]);

  return match.bestMatch.rating > 0.5 ? commodityTypes?.[match.bestMatchIndex] : undefined;
};

const matchDate = (date?: string) => {
  return date ? new Date(date) : undefined;
};

const getContainers = (
  object: HtmlBookingRequest,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
): (Container & ContainerDetails)[] => {
  return object.CONTAINERS.map(container => {
    const containerType = matchContainerType(containerTypes, container);
    const commodityType = matchCommodityType(commodityTypes, object);
    const pickupDate = matchDate(container.EMPTY_CONTAINER_REQUESTED_PICK_UP_DATE);
    const pickupLocation = container.EMPTY_CONTAINER_PICK_UP_LOCATION
      ? matchLocation(pickupLocations, container)
      : undefined;

    // Reefer settings
    const temperature = container.TEMPERATURE && Number(container.TEMPERATURE);
    const ventilation =
      container.VENTILATION && getEnumKeyByEnumValue(Ventilation, container.VENTILATION.toUpperCase());

    return omitBy(isNil)({
      commodityType,
      containerType,
      pickupDate,
      pickupLocation,
      quantity: container.QUANTITY && Number(container.QUANTITY),
      temperature,
      ventilation,
      weight: container.NET_WEIGHT && Number(container.NET_WEIGHT),
    }) as Container & ContainerDetails;
  });
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
  return (await res.json()) as RouteSearchResults;
};

const filterScheduleByVoyage = (schedules: RouteSearchResult[], voyage: string) => {
  const voySchedules = schedules.filter(schedule =>
    voyage.includes(schedule.OriginInfo.VoyageInfo.VoyageNr.replace(/ /g, '')),
  );
  return voySchedules.length === 0 ? schedules : voySchedules;
};

const filterScheduleByVessel = (schedules: RouteSearchResult[], vessel: string) => {
  const vesselSchedules = schedules.filter(schedule =>
    vessel.toUpperCase()?.includes(schedule.OriginInfo.VoyageInfo.VesselName),
  );
  return vesselSchedules.length === 0 ? schedules : vesselSchedules;
};

const matchAndFetchSchedule = async (
  scheduleSearchParams: RouteSearchParams,
  object: HtmlBookingRequest,
  ports?: Port[],
): Promise<RouteSearchResult | undefined> => {
  // return undefined if params are not valid
  if (!validScheduleSearch(scheduleSearchParams)) return;

  let date = scheduleSearchParams?.date && formatDate(scheduleSearchParams?.date, 'yyyy-MM-dd');
  let data = await fetchSchedule(scheduleSearchParams, date);
  let schedules = data.Routes;

  if (schedules.length > 1 && object.VOYAGE) {
    schedules = filterScheduleByVoyage(schedules, object.VOYAGE);
  }
  // only filter more if more than 1
  if (schedules.length > 1 && object.VESSEL) {
    schedules = filterScheduleByVessel(schedules, object.VESSEL);
  }
  //if no match try again 3 days before departure date
  if (schedules.length === 0) {
    date = scheduleSearchParams?.date && formatDate(subDays(scheduleSearchParams?.date, 3), 'yyyy-MM-dd');
    data = await fetchSchedule(scheduleSearchParams, date);
    schedules = data.Routes;

    if (schedules.length > 1 && object.VOYAGE) {
      schedules = filterScheduleByVoyage(schedules, object.VOYAGE);
    }

    if (schedules.length > 1 && object.VESSEL) {
      schedules = filterScheduleByVessel(schedules, object.VESSEL);
    }
  }
  // if still more than 1 check for intermediate ports
  if (schedules.length > 1) {
    const POL = ports?.find(port => object.MAIN_PORT_OF_LOAD?.includes(port.id));
    const POD = ports?.find(port => object.MAIN_PORT_OF_DISCHARGE?.includes(port.id));

    if (POL?.id !== scheduleSearchParams.originPort?.id) {
      const polSchedules = schedules.filter(schedule =>
        schedule.IntermediatePortInfos.find(port => port.Port.ID === POL?.id),
      );
      schedules = polSchedules.length === 0 ? schedules : polSchedules;
    }
    if (POD?.id !== scheduleSearchParams.destinationPort?.id) {
      const podSchedules = schedules.filter(schedule =>
        schedule.IntermediatePortInfos.find(port => port.Port.ID === POD?.id),
      );
      schedules = podSchedules.length === 0 ? schedules : podSchedules;
    }
  }
  return schedules[0];
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

interface LatestQuote {
  quote: Quote | undefined;
  showWarningMessage: boolean;
}

export const getLatestQuote = async (quoteSearchParams: QuoteSearchParams): Promise<LatestQuote> => {
  if (quoteSearchParams.agreementNo) {
    try {
      const quoteByAgreement = await firebase
        .firestore()
        .collection('quotes')
        .doc(quoteSearchParams.agreementNo)
        .get();
      if (quoteByAgreement.exists) {
        return {
          quote: normalizeQuote(quoteByAgreement.data() as Quote),
          showWarningMessage: false,
        };
      }
    } catch (e) {
      console.error('Error fetching quote by Agreement No.');
    }
  }
  let query = (await firebase.firestore().collection('quotes')) as firebase.firestore.Query;

  if (quoteSearchParams.originPort) {
    query = query.where('origin', '==', quoteSearchParams.originPort.id);
  }
  if (quoteSearchParams.destinationPort) {
    query = query.where('destination', '==', quoteSearchParams.destinationPort.id);
  }
  if (quoteSearchParams.carrier) {
    query = query.where('carrier', '==', quoteSearchParams.carrier);
  }

  let quotesRef = await query.orderBy('dateIssued', 'desc').get();
  let quotes: Quote[] = quotesRef.docs.map(quote => normalizeQuote(quote.data())) as Quote[];

  if (quotes.length > 1) {
    if (quoteSearchParams.clientId) {
      const clientFilteredQuotes = quotes.filter(q => q.clientId === quoteSearchParams.clientId);
      // Apply client filter if size > 0, otherwise no
      quotes = clientFilteredQuotes.length === 0 ? quotes : clientFilteredQuotes;
      if (quoteSearchParams.containers?.[0].containerType) {
        const containerFilteredQuotes = quotes.filter(q =>
          q.containers.some(c => c.containerType === quoteSearchParams.containers![0].containerType?.id),
        );
        // Apply container filter if size > 0, otherwise no
        quotes = containerFilteredQuotes.length === 0 ? quotes : containerFilteredQuotes;
      }
    }
  }
  return {
    quote: quotes[0] || undefined,
    showWarningMessage: true,
  };
};

export const normalizeQuote = (data: any) => {
  return flow(update('dateIssued', safeInvoke('toDate')), update('validityPeriod', normalizeDateRange))(data);
};

interface QuoteSearchParams extends Omit<RouteSearchParams, 'date' | 'weeks'> {
  agreementNo: string | undefined;
  clientId: string | undefined;
  containers: (Container & ContainerDetails)[] | undefined;
}

const mapIntoBookingRequestModel = async (
  object: HtmlBookingRequest,
  user: UserRecord,
  ports: Port[] | undefined,
  carriers: Carrier[] | undefined,
  containerTypes: ContainerType[] | undefined,
  commodityTypes: CommodityType[] | undefined,
  pickupLocations: PickupLocation[] | undefined,
  chargeCodes: ChargeCode[] | undefined,
  normalize: (...args: any[]) => any,
): Promise<BookingRequest> => {
  let createdBy = object.BOOKER_CONTACT_EMAIL ? await getUserByEmail(object.BOOKER_CONTACT_EMAIL.toLowerCase()) : user;

  if (!createdBy) createdBy = user;

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
  const intraRefNumber = object.INTTRA_REFERENCE_NUMBER;
  const origin = ports?.find(port => object.PLACE_OF_CARRIER_RECEIPT?.includes(port.id));
  const destination = ports?.find(port => object.PLACE_OF_CARRIER_DELIVERY?.includes(port.id));

  const departureDate = matchDate(object.SAIL_DATE || object.ETD);
  const scheduleSearchParams = {
    originPort: origin,
    destinationPort: destination,
    carrier: carrier,
    date: departureDate,
    weeks: 4,
  } as RouteSearchParams;

  const schedule = await matchAndFetchSchedule(scheduleSearchParams, object, ports);

  const quoteSearchParams = {
    originPort: origin,
    destinationPort: destination,
    carrier: carrier?.name,
    agreementNo,
    clientId: client?.id,
    containers: containers,
  } as QuoteSearchParams;

  // Get the latest quote by origin and dest
  const { quote, showWarningMessage } = await getLatestQuote(quoteSearchParams);

  const normalizedQuote = quote && (normalize(quote) as Quote);

  const freightDetails = normalizedQuote && takeQuoteDetails(normalizedQuote?.quoteDetails, containers, chargeCodes);

  const voyageInfo = getVoyageInfo(schedule);

  const commission = generateCommission(schedule, freightDetails, carrier?.id, containers);

  const createdAt = new Date();

  return {
    agreementNo,
    carrier,
    client,
    containers,
    createdAt,
    updatedAt: createdAt,
    createdBy,
    customerReference,
    destination,
    freightDetails: compact([...(freightDetails?.filter(value => !isAgencyCommission(value)) || []), commission]),
    hold: false,
    intraRefNumber,
    origin,
    quoteNumber: showWarningMessage ? null : normalizedQuote?.id,
    schedule,
    showWarningMessage,
    statusCode: BookingRequestStatusCode.REQUESTED,
    statusText: BookingRequestStatusText.REQUESTED,
    vessel: voyageInfo?.VesselName,
    vgmSubmittedBy,
    voyage: voyageInfo?.VoyageNr,
  } as BookingRequest;
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
  normalize: (...args: any[]) => any,
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
        normalize,
      );
      console.log(bookingRequest);
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
  const normalize = useNormalizeQuote();

  const storageBasePath = useMemo((): string => {
    return [`bookings-requests-documents-internal`, bookingRequest?.id].join('/');
  }, [bookingRequest]);

  const { saveFiles } = useSaveFiles(storageBasePath);

  const handleOnDrop = (files: File[]) => {
    readAndParseFile(
      files[0],
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
      normalize,
    );
  };

  const handleOnDelete = () => {
    setBookingRequest(undefined);
  };

  const handleBookingSave = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      bookingRequest &&
        createRequest({
          ...bookingRequest,
          assignedUser: null,
          itinerary: getItineraryFromSchedule(bookingRequest?.schedule),
        })
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
                    isInternal: false,
                  } as ChecklistItemValueDocument),
              );
              values.map(value => saveFilesToFirestore('bookings-requests', docReference, value));
            } catch (e) {
              dispatch({ type: 'STOP_GLOBAL_LOADING' });
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
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
      console.error('Booking Upload Dialog - FirestoreCollection threw an error', e);
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Upload Booking</Typography>
          <IconButton onClick={handleClose} disabled={loading} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box>
            <DropZoneArea
              handleOnDrop={handleOnDrop}
              handleOnDelete={handleOnDelete}
              filesLimit={1}
              acceptedExtensions={['.html']}
              showPreviews={!!bookingRequest}
              dropzoneProps={{ disabled: loading }}
              previewChipProps={{ disabled: !bookingRequest || loading }}
              dropzoneText={'Upload HTML Document'}
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
