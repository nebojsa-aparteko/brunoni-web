import Container from '../model/Container';
import ContainerDetails from '../model/ContainerDetails';
import firebase from '../firebase';
import { BookingRequest, VGMSubmittedBy } from '../model/BookingRequest';
import ChargeCode from '../model/ChargeCode';
import Client from '../model/Client';
import { getItineraryFromSchedule } from '../components/bookingRequests/BookingRequestSummary';
import { flow, get, omit, set } from 'lodash/fp';
import { BookingCategory, BookingVersion } from '../model/Booking';
import { getRepresentationFromClient } from '../components/bookingRequests/BookingRequestPortTerms';
import { formatDateSafe } from './formattingHelpers';

const getTariffs = (container: Container & ContainerDetails) => {
  const tariffs = [];
  if (container.demDetTariffs && container.demDetTariffs.length > 0) {
    tariffs.push({
      Type: 'DEM/DET',
      ID: container.demDetTariffs[0].id,
    });
  }
  if (container.storageTariffs && container.storageTariffs.length > 0) {
    tariffs.push({
      Type: 'STORAGE',
      ID: container.storageTariffs[0].id,
    });
  }
  if (container.pluginTariffs && container.pluginTariffs.length > 0) {
    tariffs.push({
      Type: 'PLUGIN',
      ID: container.pluginTariffs[0].id,
    });
  }
  return tariffs;
};

const twentyFootContainers = ["20'DC", "20'SO", "20'FR", "20'PF", "20'SR", "20'RF", "20'TK", "20'OT"];
const fortyFootContainers = ["40'DC", "40'SO", "40'FR", "40'PF", "40'SR", "40'OT", "40'HC", "40'FH", "40'RH", "40'OH"];

const getRelevantUnit = (unit: string) => {
  if (unit === 'PRO CONTAINER' || unit === 'PER CONTAINER') return 'CTR';
  if (unit === 'PRO SENDUNG' || unit === 'PER SHIPMENT') return 'FEE';
  if (unit === 'PRO SET' || unit === 'PER SET') return 'SET';
  if (unit === 'PRO TEU' || unit === 'PER TEU') return 'TEU';
  if (twentyFootContainers.some(containerName => unit === 'PRO ' + containerName || unit === 'PER ' + containerName))
    return "20'";
  if (fortyFootContainers.some(containerName => unit === 'PRO ' + containerName || unit === 'PER ' + containerName))
    return "40'";
  return unit;
};

const fetchClientByAlphacomId = async (alphacomId: string) =>
  await firebase
    .firestore()
    .collection('clients')
    .doc(alphacomId)
    .get();

export default async (request: BookingRequest, chargeCodes: ChargeCode[] | undefined) => {
  const [erpCarrierId, erpServiceId] = request.schedule?.Service?.split('-')?.map(str => str.trim()) || [
    undefined,
    undefined,
  ];
  const vgmSubmittedByClient =
    request?.vgmSubmittedBy === VGMSubmittedBy.CLIENT
      ? request.client
      : request.assignedUser?.alphacomClientId &&
        ((await fetchClientByAlphacomId(request.assignedUser?.alphacomClientId)).data() as Client);
  const itinerary = getItineraryFromSchedule(request.schedule);
  const portOfLoading = itinerary?.portOfLoading;

  return flow(
    set('Agreement', request.agreementNo),
    set('BL-No', request.blNumber),
    set('INTBL', request.intBlNumber),
    set('BkgAgentContact', request.assignedUser?.alphacomId),
    set('BkgAgentContactEml', request.assignedUser?.emailAddress),
    set('BkgAgentContactTxt', `${request.assignedUser?.firstName} ${request.assignedUser?.lastName}`),
    set('BkgCreateTimeStamp', new Date()),
    set('BkgTouchTimeStamp', new Date()),
    set('TimeStamp', new Date()),
    set('CarrierID', request.carrier?.name),
    set('Category', BookingCategory.Export),
    set('Version', BookingVersion.long),
    set('VesselCode', portOfLoading?.VoyageInfo?.VesselCode),
    set('Vessel', portOfLoading?.VoyageInfo?.VesselName),
    set('Voyage', portOfLoading?.VoyageInfo?.VoyageNr),
    set('requestId', request.id),
    set('ForwAdrCity', request.client?.city),
    set('ForwAdrId', request.client?.id),
    set('ForwAdrName', request.client?.name),
    set('StatClient', request.statClient?.id),
    set('StatClientRef', request.agreementNo),
    set('ForwPersID', request.createdBy?.alphacomId),
    set('ForwarderPersTxt', `${request.createdBy?.firstName} ${request.createdBy?.lastName}`),
    set('ScheduleChanged', request.isScheduleChanged),
    set(
      'FreightDetails',
      set(
        'FreightDetail',
        request.freightDetails?.map(detail => ({
          ...detail,
          Unit: detail.Unit ? getRelevantUnit(detail.Unit.trim().toUpperCase()) : undefined,
          ChgCode: chargeCodes ? chargeCodes.find(code => code.text === detail.Txt)?.chargeCodeId : undefined,
        })),
      )({}),
    ),
    set('leadingCurrency', request.leadingCurrency),
    set('ERP-CarrierID', erpCarrierId),
    set('ERP-ServiceID', erpServiceId),
    set('Carrier-BkgRef', null),
    set('Cust-BkgRef', request.customerReference),
    set(
      'PlaceOfRecieptISO',
      itinerary?.placeOfReceipt ? itinerary?.placeOfReceipt?.Port.ID : itinerary?.portOfLoading?.Port.ID,
    ),
    set(
      'PlaceOfRecieptName',
      itinerary?.placeOfReceipt
        ? itinerary?.placeOfReceipt?.Port.HarbourName
        : itinerary?.portOfLoading?.Port.HarbourName,
    ),
    set(
      'PlaceOfReceiptETS',
      itinerary?.placeOfReceipt ? itinerary?.placeOfReceipt?.DepartureDate : itinerary?.portOfLoading?.DepartureDate,
    ),
    set('POL', itinerary?.portOfLoading?.Port.ID),
    set('POLName', itinerary?.portOfLoading?.Port.HarbourName),
    set('POLETS', itinerary?.portOfLoading?.DepartureDate),
    set('POD', itinerary?.portOfDischarge?.Port.ID),
    set('PODName', itinerary?.portOfDischarge?.Port.HarbourName),
    set('PODETS', itinerary?.portOfDischarge?.DepartureDate), //TODO check if ETA or ETS is needed
    set(
      'FinalDestinationISO',
      itinerary?.placeOfDelivery ? itinerary?.placeOfDelivery?.Port.ID : itinerary?.portOfDischarge?.Port.ID,
    ),
    set(
      'FinalDestinationName',
      itinerary?.placeOfDelivery
        ? itinerary?.placeOfDelivery?.Port.HarbourName
        : itinerary?.portOfDischarge?.Port.HarbourName,
    ),
    set(
      'FinalDestinationETA',
      itinerary?.placeOfDelivery ? itinerary?.placeOfDelivery?.ArrivalDate : itinerary?.portOfDischarge?.ArrivalDate,
    ),
    set(
      'Remarks',
      flow(set('Remark'))(
        request.specialRemarks?.map((remark, index) =>
          flow(set('RemarkSeq', `${index}`), renameField('id', 'RemarkType'), renameField('text', 'RemarkTxt'))(remark),
        ),
      )({}),
    ),
    set(
      'PortTerms',
      flow(
        set('RelevantPort', 'POL'), //For export this is always POL, for import it is always POD
        set('LinerPortAgent', portOfLoading?.Port.PortAgent),
        set('FOBDeliveryBy', portOfLoading?.Port.PortAgent.split('<br/>')[0]),
        set('VGMSubmByID', vgmSubmittedByClient && vgmSubmittedByClient?.id),
        set('VGMSubmByTxt', vgmSubmittedByClient && getRepresentationFromClient(vgmSubmittedByClient)),
        set(
          'Closings',
          set(
            'Closing',
            request.schedule?.Deadlines.map(closing => {
              const [date, time] = closing.Time?.split('-')?.map(str => str.trim()) || [undefined, undefined];
              return {
                ClosingType: closing.Typ,
                ClosingDate: date,
                ClosingTime: time,
                ClosingTxt: ['DELIVERY', 'FCL'].includes(closing.Typ)
                  ? null
                  : '(TO BE SUBMITTED BEFORE CONTAINER DELIVERY AT THE TERMINAL)',
              };
            }),
          )({}),
        ),
      )({}),
    ),
    set(
      'CargoDetails',
      flow(
        set(
          'CargoDetail',
          request.containers?.map((value, index) => {
            const tariffs = getTariffs(value);
            return {
              ItemNo: index + 1,
              CtrQuantity: value.quantity,
              CtypID: value.containerType?.id,
              CommodityID: value.commodityType?.id,
              CommodityTXT:
                value.commodityType?.name && value.commodityType?.name !== ''
                  ? value.commodityType?.name
                  : value.commodityType?.id,
              CtrWeight: `${value.weight?.toFixed(2)} KGS`,
              'VGM-PIN': value.vgmPin,
              DemDetTariff: value.demDetTariffs && value.demDetTariffs.length > 0 ? value.demDetTariffs[0].id : null,
              StorageTariff:
                value.storageTariffs && value.storageTariffs.length > 0 ? value.storageTariffs[0].id : null,
              PluginTariff: value.pluginTariffs && value.pluginTariffs.length > 0 ? value.pluginTariffs[0].id : null,
              Temperature: value.temperature
                ? `${value.temperature > 0 ? '+' + value.temperature : value.temperature}° Celsius`
                : null,
              Dehumidification: value.humidity ? `${value.humidity}%` : null,
              Ventilation: value.ventilation,
              LocRefs: {
                LocRef: [
                  {
                    LocType: 'DEPOT',
                    LocID: value.pickupLocation?.id,
                    LocRef: value.pickupReference,
                    LocDate: value.pickupDate && formatDateSafe(value.pickupDate, 'dd.mm.yyyy'),
                  },
                  {
                    LocType: 'TERMINAL',
                    LocID: request.schedule?.OriginInfo.Port.TerminalID || null,
                    LocRef: value.deliveryReference,
                    LocDate: null,
                  },
                ],
              },
              IMCO: value.imo?.length > 0 ? 'Yes' : 'No',
              IMCOs: {
                IMCO: value.imo?.map((imco: any) => ({
                  IMOClass: imco?.IMOClass,
                  UNNumber: imco?.UNNumber,
                  PackingNumber: imco?.PGNumber,
                  FlashPoint: null,
                })),
              },
              Overdimension: value.oog?.length > 0 ? 'Yes' : 'No',
              Overwidth: value.oog?.length > 0 ? (value.oog[0] as any).diffWidth : null,
              Overheight: value.oog?.length > 0 ? (value.oog[0] as any).diffHeight : null,
              Overlength: value.oog?.length > 0 ? (value.oog[0] as any).diffLength : null,
              Overweight: value.oog?.length > 0 ? (value.oog[0] as any).diffWeight : null,
              EmptySlots: value.oog?.length > 0 ? (value.oog[0] as any).displacement : null,
              CtrMaxCaseDim: value.oog
                ? {
                    MaxWidth: value.oog?.length > 0 ? (value.oog[0] as any).width : null,
                    MaxHeight: value.oog?.length > 0 ? (value.oog[0] as any).height : null,
                    MaxLength: value.oog?.length > 0 ? (value.oog[0] as any).length : null,
                    MaxWeight: value.oog?.length > 0 ? (value.oog[0] as any).weight : null,
                  }
                : null,
              CtrOverDimRemark: value.oog ? 'OUT-OF-GAUGE' : null,
              BBQuantity: null,
              BBWeight: null,
              BBVolume: null,
              CargoDetailRemarks: null,
              Stock: null,
              DropOffRef: null,
              Equipment: {
                EquipmentDetail: request.containers?.map(ctg => ({
                  ContainerNumber: ctg.containerNumbers ? ctg.containerNumbers : 'NOT AVAILABLE',
                  CtypID: value.containerType?.id,
                  PickUpDate: ctg.pickupDate && formatDateSafe(ctg.pickupDate, 'dd.mm.yyyy'),
                  GateInDate: null,
                  GateOutDate: null,
                  DropOffDate: null,
                  PINNr: null,
                  CtrTariffs: {
                    CtrTariff: tariffs,
                  },
                })),
              },
            };
          }),
        ),
      )({}),
    ),
  )({});
};

const renameField = (oldName: string, newName: string, transformationFunction?: any) => (value: any) =>
  get(oldName)(value)
    ? flow(renameKey(oldName, newName, transformationFunction), omit([oldName]))(value)
    : (() => {
        delete value[oldName];
        return value;
      })();

const renameKey = (oldName: string, newName: string, transformationFunction?: any) => (value: { [key: string]: any }) =>
  transformationFunction
    ? set(newName, transformationFunction(get(oldName)(value)))(value)
    : set(newName, get(oldName)(value))(value);
