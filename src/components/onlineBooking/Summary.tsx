import {
  BookingRequest,
  BookingRequestStatusCode,
  BookingRequestStatusText,
  FreightDetail,
  VGMSubmittedBy,
} from '../../model/BookingRequest';
import React, { Fragment, useContext, useMemo } from 'react';
import useUser from '../../hooks/useUser';
import { Box, Button, Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import omitEmptyDeep from '../../utilities/omitEmptyDeep';
import { ChecklistItemValueDocument, DocumentType } from '../bookings/checklist/ChecklistItemModel';
import Stepper from '@material-ui/core/Stepper';
import ItineraryItem from '../ItineraryItem';
import RouteDeadlines from '../routeSearch/RouteDeaadlines';
import RouteSummary from '../routeSearch/RouteSummary';
import ContainersList from './ContainersList';
import { useHistory } from 'react-router';
import firebase from 'firebase';
import { format } from 'date-fns';
import useSaveFiles from '../../hooks/useSaveFiles';
import { saveFilesToFirestore } from '../bookings/InternalStorage';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import { BookingReqFiles } from './OnlineBookingContainer';
import { getVoyageInfo } from '../bookingRequests/BookingRequestView';
import {
  calculateTotal,
  generateCommission,
  isAgencyCommission,
} from '../bookingRequests/BookingRequestFreightDetails';
import { compact, flow, get, isNil, map, omitBy, set, update } from 'lodash/fp';
import Container from '@material-ui/core/Container';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { isVesselIntermediate } from '../bookingRequests/BookingRequestSummary';
import { QuoteDetail } from '../../providers/QuoteGroupsProvider';
import { FreightDetailGroup } from '../../model/Booking';
import ContainerDetails from '../../model/ContainerDetails';
import Ctg from '../../model/Container';
import ChargeCode from '../../model/ChargeCode';
import ChargeCodes from '../../contexts/ChargeCodes';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
  carrierAvatar: {
    width: '.75em',
    height: '.75em',
    marginRight: theme.spacing(1),
  },
  stepper: {
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
  },
  actions: {
    marginTop: theme.spacing(3),
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
}));

export const createRequest = async (bookingRequest: BookingRequest) => {
  const autoIncrementId = await getBookingRequestId();
  const generatedId = `${autoIncrementId}`.padStart(4, '0');
  const id = `req-${format(new Date(), 'yyyyMM')}${generatedId}`;
  await firebase
    .firestore()
    .collection('bookings-requests')
    .doc(id)
    .set({
      id,
      ...bookingRequest,
    });
  return id;
};

export const getBookingRequestId = async () => {
  let counter = 0;
  const path = format(new Date(), 'yyyy-MM');
  await firebase
    .database()
    .ref(`/booking-request-ids/${path}`)
    .transaction(value => {
      counter = value || 1;
      return +value + 1;
    });

  return counter;
};

export const getItineraryFromSchedule = (schedule?: RouteSearchResult) => {
  if (!schedule) return null;
  if (schedule.IntermediatePortInfos.length === 0) {
    // pol - pod
    return { portOfLoading: schedule.OriginInfo, portOfDischarge: schedule.DestinationInfo };
  } else if (schedule.IntermediatePortInfos.length === 2) {
    // plr - pol - pod - fdp
    const intermediatePorts =
      schedule.IntermediatePortInfos[0].ArrivalDate > schedule.IntermediatePortInfos[1].ArrivalDate
        ? { portOfLoading: schedule.IntermediatePortInfos[1], portOfDischarge: schedule.IntermediatePortInfos[0] }
        : { portOfLoading: schedule.IntermediatePortInfos[0], portOfDischarge: schedule.IntermediatePortInfos[1] };
    return {
      placeOfReceipt: schedule.OriginInfo,
      ...intermediatePorts,
      finalDestinationPort: schedule.DestinationInfo,
    };
  } else if (schedule.IntermediatePortInfos.length === 1) {
    // plr - pol - pod or pol - pod - fdp
    if (isVesselIntermediate(schedule.OriginInfo?.VoyageInfo?.VesselName)) {
      return {
        placeOfReceipt: schedule.OriginInfo,
        portOfLoading: schedule.IntermediatePortInfos[0],
        portOfDischarge: schedule.DestinationInfo,
      };
    } else if (isVesselIntermediate(schedule.DestinationInfo?.VoyageInfo?.VesselName)) {
      return {
        portOfLoading: schedule.OriginInfo,
        portOfDischarge: schedule.IntermediatePortInfos[0],
        finalDestinationPort: schedule.DestinationInfo,
      };
    } else {
      return {
        portOfLoading: schedule.OriginInfo,
        portOfDischarge: schedule.IntermediatePortInfos[0],
        finalDestinationPort: schedule.DestinationInfo,
      };
    }
  } else {
    // nothing
  }
};

const isRelevantFreight = (
  freightDetail: FreightDetail,
  containers: { TEU: number; Total: number; [key: string]: number },
) => {
  if (!freightDetail.Unit?.includes("'")) return true;
  return Object.entries(containers).some(
    ([key, value]) => value > 0 && [`PRO ${key}`, `PER ${key}`].includes(freightDetail.Unit?.toUpperCase() || ''),
  );
};

const getRelevantFreightDetailsFromQuote = (quoteDetails: QuoteDetail[]) =>
  quoteDetails.filter(
    detail =>
      ![
        'VGM manual submission',
        'Umbuchungsgebühr',
        'Stornierungsgebühr',
        'Zertifikat',
        'Rebooking Fee',
        'Cancellation Fee',
        'House-Bill of Lading',
        'Certificate',
      ].includes(detail.Description) && !['Inkl.', 'incl.'].includes(detail.Currency),
  );

const findIsChargeCodeInternal = (chargeCodes: ChargeCode[], chargeId?: string) => {
  if (!chargeId) return undefined;
  const chargeCode = chargeCodes?.find(code => code.chargeCodeId === chargeId);
  return chargeCode && chargeCode.internal1 === 'TRUE' ? true : undefined;
};

const findChargeIdByDescription = (chargeCodes: ChargeCode[], description: string): string | undefined => {
  return chargeCodes.find(code => code.text === description)?.chargeCodeId;
};

export const findChargeCodeTextInEnglish = (chargeCodes: ChargeCode[], chargeId?: string, description?: string) => {
  let chargeCodeId = chargeId || (description && findChargeIdByDescription(chargeCodes, description));
  if (!chargeCodeId) {
    return description;
  }
  const chargeCode = chargeCodes?.find(code => code.chargeCodeId === chargeCodeId && code.language === 'E');
  return chargeCode && chargeCode.text;
};

const transformFreightDetails = (
  chargeCodes: ChargeCode[],
  containers: { TEU: number; Total: number; [key: string]: number },
  freightDetails: QuoteDetail[],
): FreightDetail[] =>
  freightDetails?.map((quoteDetail, index) =>
    omitBy(isNil)({
      Anz: getQuantity(containers, quoteDetail.CostUnit) || 1,
      SeqNr: index + 1,
      Txt: findChargeCodeTextInEnglish(chargeCodes, quoteDetail.ChargeID, quoteDetail.Description),
      Currency: quoteDetail.Currency,
      UnitValue: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
      Unit: quoteDetail.CostUnit,
      Group: FreightDetailGroup.EXTERNAL,
      Total: quoteDetail.CostValue && parseFloat(quoteDetail.CostValue.replaceAll(',', '')),
      Internal1: findIsChargeCodeInternal(chargeCodes, quoteDetail.ChargeID),
    }),
  ) as FreightDetail[];

const recalculateQuantity = (
  containers: { TEU: number; Total: number; [key: string]: number },
  freightDetails: FreightDetail[],
) => {
  return freightDetails.map(detail => {
    const newQuantity = getQuantity(containers, detail.Unit?.toUpperCase());
    return set('Anz', newQuantity || detail.Anz || 1)(detail);
  });
};

const getQuantity = (containers: { TEU: number; Total: number; [key: string]: number }, costUnit?: string) => {
  switch (costUnit?.toUpperCase()) {
    case 'PRO TEU':
    case 'PER TEU':
      return containers.TEU;
    case 'PER CONTAINER':
    case 'PRO CONTAINER':
      return containers.Total;
    default:
      return containers[costUnit?.split(' ')?.pop() || ''] || undefined;
  }
};

const updateFreightDetails = (
  containers: { TEU: number; Total: number; [key: string]: number },
  freightDetails: FreightDetail[],
) => {
  if (containers.Total === 0) return freightDetails;
  return freightDetails.reduce((previousValue, currentValue) => {
    if (isRelevantFreight(currentValue, containers)) {
      return previousValue.concat(currentValue);
    } else {
      return previousValue;
    }
  }, [] as FreightDetail[]);
};

export const onContainersChange = (
  containers: { TEU: number; Total: number; [key: string]: number },
  freightDetails: FreightDetail[],
) =>
  flow(
    recalculateQuantity.bind(this, containers),
    updateFreightDetails.bind(this, containers),
    recalculateFreightDetails.bind(this),
  )(freightDetails);
// const checkIfPercent = (freightDetail: FreightDetail) => freightDetail.Unit?.trim() === '%';
const recalculateFreightDetails = (freights: FreightDetail[]) =>
  freights.map(freightDetail => {
    const total = calculateTotal(freightDetail);
    return set('Total', total)(freightDetail);
  });

export const takeQuoteDetails = (
  quoteDetails: QuoteDetail[],
  bkgContainers?: (Ctg & ContainerDetails)[],
  chargeCodes?: ChargeCode[],
) => {
  const containers = calculateContainers(bkgContainers);

  return flow(
    getRelevantFreightDetailsFromQuote,
    transformFreightDetails.bind(this, chargeCodes || [], containers),
    updateFreightDetails.bind(this, containers),
    recalculateFreightDetails,
  )(quoteDetails);
};

const Summary: React.FC<Props> = ({ handlePrevious, bookingRequest, setBookingRequest, files }) => {
  const classes = useStyles();
  const history = useHistory();
  const [, userRecord] = useUser();
  const [, dispatch] = useGlobalAppState();
  const chargeCodes = useContext(ChargeCodes);

  const activityLogUserData = useActivityLogUserData();
  const storageBasePath = useMemo(
    (): string => [`bookings-requests-documents-internal`, bookingRequest?.id].join('/'),
    [bookingRequest],
  );
  const { saveFiles } = useSaveFiles(storageBasePath);

  const handleCreateRequest = () => {
    const voyageInfo = getVoyageInfo(bookingRequest?.schedule);

    const freights = takeQuoteDetails(bookingRequest?.quoteDetails || [], bookingRequest?.containers, chargeCodes);
    const commission = generateCommission(
      bookingRequest?.schedule,
      freights,
      bookingRequest?.carrier?.id,
      bookingRequest?.containers,
    );
    let writableRequest = {
      ...bookingRequest,
      createdAt: new Date(),
      createdBy: activityLogUserData,
      statusCode: BookingRequestStatusCode.REQUESTED,
      statusText: BookingRequestStatusText.REQUESTED,
      vgmSubmittedBy: VGMSubmittedBy.CLIENT,
      hold: false,
      vessel: voyageInfo?.VesselName,
      voyage: voyageInfo?.VoyageNr,
      itinerary: getItineraryFromSchedule(bookingRequest?.schedule),
      freightDetails: compact([...(freights?.filter(value => !isAgencyCommission(value)) || []), commission]),
    } as BookingRequest;
    omitEmptyDeep(writableRequest);
    // Setting assignedUser: null for filtering purposes
    writableRequest = {
      ...writableRequest,
      assignedUser: null,
    } as BookingRequest;
    setBookingRequest(
      update(
        'containers',
        map((value: any) =>
          flow(
            update('imo', val => (val?.[0] ? val[1] : null)),
            update('oog', val => (val?.[0] ? val[1] : null)),
          )(value),
        ),
      )(writableRequest),
    );
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      bookingRequest &&
        createRequest(
          update(
            'containers',
            map((value: any) =>
              flow(
                update('imo', val => (val?.[0] ? val[1] : null)),
                update('oog', val => (val?.[0] ? val[1] : null)),
              )(value),
            ),
          )(writableRequest),
        )
          .then(async docReference => {
            try {
              const additional = (await saveFiles(files.additional)) as ChecklistItemValueDocument[];
              const certificate = (await saveFiles(files.certificate)) as ChecklistItemValueDocument[];
              const imo = (await saveFiles(files.imo)) as ChecklistItemValueDocument[];

              const additionalValues = additional.map(
                item =>
                  ({
                    uploadedBy: userRecord,
                    uploadedAt: new Date(),
                    name: item.name,
                    url: item.url,
                    storedName: item.storedName,
                    isInternal: false,
                    documentType: DocumentType.ADDITIONAL_DOCUMENTS,
                  } as ChecklistItemValueDocument),
              );
              const certificateValues = certificate.map(
                item =>
                  ({
                    uploadedBy: userRecord,
                    uploadedAt: new Date(),
                    name: item.name,
                    url: item.url,
                    storedName: item.storedName,
                    isInternal: false,
                    documentType: DocumentType.SOC,
                  } as ChecklistItemValueDocument),
              );
              const IMOValues = imo.map(
                item =>
                  ({
                    uploadedBy: userRecord,
                    uploadedAt: new Date(),
                    name: item.name,
                    url: item.url,
                    storedName: item.storedName,
                    isInternal: false,
                    documentType: DocumentType.IMO,
                  } as ChecklistItemValueDocument),
              );
              const values = [...additionalValues, ...certificateValues, ...IMOValues];
              await Promise.all(values.map(value => saveFilesToFirestore('bookings-requests', docReference, value)));
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
    } catch (error) {
      console.error('useFirestoreCollection threw an error', error);
      return null;
    }
  };

  return (
    <Container maxWidth="md">
      {bookingRequest && bookingRequest?.schedule && (
        <Grid container spacing={4} xs={12}>
          <Grid item xs={12} title={'General Information'}>
            <RouteSummary route={bookingRequest?.schedule} carrier={bookingRequest?.carrier} />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {bookingRequest.containers && (
            <Fragment>
              <Grid item xs={12}>
                <Typography variant="subtitle2" display="block" gutterBottom>
                  <Box fontWeight="fontWeightBold" mb={2}>
                    Cargo details
                  </Box>
                </Typography>
                <ContainersList containers={bookingRequest?.containers} />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Fragment>
          )}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <RouteDeadlines route={bookingRequest.schedule} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Stepper orientation="vertical" className={classes.stepper}>
              {bookingRequest?.schedule!.OriginInfo && (
                <ItineraryItem noLine={false} itineraryItem={bookingRequest?.schedule!.OriginInfo} />
              )}
              {bookingRequest?.schedule!.IntermediatePortInfos.map((intermediatePortInfo, i) => (
                <ItineraryItem key={i} noLine={false} itineraryItem={intermediatePortInfo} />
              ))}
              {bookingRequest?.schedule!.DestinationInfo && (
                <ItineraryItem noLine={true} itineraryItem={bookingRequest?.schedule!.DestinationInfo} />
              )}
            </Stepper>
          </Grid>
        </Grid>
      )}
      <div className={classes.actions}>
        <Button onClick={handlePrevious}>Previous</Button>
        <Button variant="contained" color="primary" onClick={handleCreateRequest}>
          Submit
        </Button>
      </div>
    </Container>
  );
};

export const calculateContainers = (containers?: (Ctg & ContainerDetails)[]) =>
  containers?.reduce(
    (previousValue, currentValue) => {
      const lastValue = get(currentValue.containerType?.name || '')(previousValue) || 0;
      const lastTEU = get('TEU')(previousValue) || 0;
      const lastTotal = get('Total')(previousValue) || 0;
      if (currentValue.containerType?.name)
        return flow(
          set(currentValue.containerType.name, lastValue + +currentValue.quantity),
          set(
            'TEU',
            lastTEU +
              (currentValue.containerType?.id
                ? (currentValue.containerType.id.startsWith('2') ? 1 : 2) * currentValue.quantity
                : 0),
          ),
          set('Total', lastTotal + +currentValue.quantity),
        )(previousValue);
      return previousValue;
    },
    { TEU: 0, Total: 0 },
  ) || { TEU: 0, Total: 0 };

interface Props {
  handlePrevious: () => void;
  handleNext: () => void;
  bookingRequest: BookingRequest | undefined;
  files: BookingReqFiles;
  setBookingRequest: React.Dispatch<React.SetStateAction<BookingRequest | undefined>>;
}

export default Summary;
