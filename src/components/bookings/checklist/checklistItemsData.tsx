import {
  Booking,
  BookingVersion,
  CargoDetail,
  CargoOverdimension,
  IMCO,
  ShipperOwnedContainer,
  StatusExport,
  StatusImport,
} from '../../../model/Booking';
import React from 'react';
import { showForCities, showForShortcut } from '../../../utilities/portOfLoadingHelperData';

export enum FieldType {
  BASIC,
  FILE,
  TEXT,
}

type CargoDetailFilter = (detail: CargoDetail) => boolean;
type BookingFilter = (booking: Booking) => boolean;

export interface ChecklistItem {
  id: string;
  label: string;
  type: FieldType;
  status: StatusExport | StatusImport;
  selectedRow: boolean;
  filters: BookingFilter[];
  additionalCondition?: (booking: Booking | undefined) => boolean | undefined | '';
}

const someCargoDetailsMatch = (fn: CargoDetailFilter): BookingFilter => booking => booking.CargoDetails.some(fn);

const isLongVersion = (booking: Booking): boolean => booking.Version === BookingVersion.long;
const isShortVersion = (booking: Booking): boolean => booking.Version === BookingVersion.short;

const isImcoContainer = (detail: CargoDetail): boolean => detail.IMCO === IMCO.Trigger;

const isOverdimensionedContainer = (detail: CargoDetail): boolean =>
  detail.Overdimension === CargoOverdimension.Trigger;

const isNotShipperOwnedContainer = (detail: CargoDetail): boolean =>
  !Object.values(ShipperOwnedContainer).includes(detail.CtypID as ShipperOwnedContainer);

const isShipperOwnedContainer = (detail: CargoDetail): boolean =>
  Object.values(ShipperOwnedContainer).includes(detail.CtypID as ShipperOwnedContainer);

const is20TKContainer = (detail: CargoDetail): boolean => detail.CtypID === ShipperOwnedContainer.The20TK;

const isZIM = (booking: Booking): boolean => {
  return booking.CarrierID === 'ZIM';
};

const isGermanPort = (booking: Booking): boolean =>
  showForCities.includes(booking.POLName.toLowerCase()) && showForShortcut.includes(booking.POL.toUpperCase());

const isAllmarine = (): boolean => process.env.REACT_APP_BRAND === 'allmarine';

export const checklistItemsExport: ChecklistItem[] = [
  {
    id: 'depot_out',
    label: 'DEPOT OUT',
    type: FieldType.BASIC,
    status: StatusExport.DepotOut,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isNotShipperOwnedContainer)],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE',
  },
  {
    id: 'soc_certificate',
    label: 'SOC CERTIFICATE',
    type: FieldType.FILE,
    status: StatusExport.SocCertificate,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isShipperOwnedContainer)],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE', //TODO check if needed
  },
  {
    id: 'imo_requested',
    label: 'IMO REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.ImoRequested,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'imo_approved',
    label: 'IMO APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.ImoApproved,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'final_dgd_sheet_and_delivery_details',
    label: 'FINAL DGD SHEET & DELIVERY DETAILS',
    type: FieldType.FILE,
    status: StatusExport.FinalDgdSheetAndDeliveryDetails,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'oog_requested',
    label: 'OOG REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.OogRequested,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer), isLongVersion],
  },
  {
    id: 'oog_approved',
    label: 'OOG APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.OogApproved,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer), isLongVersion],
  },
  {
    id: 'lashing_certificate',
    label: 'LASHING CERTIFICATE',
    type: FieldType.BASIC,
    status: StatusExport.OogApproved,
    selectedRow: false,
    filters: [isAllmarine, isZIM, isLongVersion],
  },
  {
    id: 'tank_certificate',
    label: 'TANK CERTIFICATE',
    type: FieldType.FILE,
    status: StatusExport.tankCertificate,
    selectedRow: false,
    filters: [someCargoDetailsMatch(is20TKContainer), isLongVersion],
  },
  {
    id: 'gate_in_terminal',
    label: 'GATE IN TERMINAL',
    type: FieldType.BASIC,
    status: StatusExport.GateInTerminal,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'bht_number_issuance',
    label: 'B/BHT NUMBER ISSUANCE',
    type: FieldType.TEXT,
    status: StatusExport.BhtNumberIssuance,
    selectedRow: false,
    filters: [isLongVersion, isGermanPort],
  },
  {
    id: 'vgm_submission',
    label: 'VGM SUBMISSION',
    type: FieldType.BASIC,
    status: StatusExport.VgmSubmission,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'shipping_instructions',
    label: 'SHIPPING INSTRUCTIONS',
    type: FieldType.FILE,
    status: StatusExport.ShippingInstructions,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'bl_draft_sent',
    label: 'B/L DRAFT SENT',
    type: FieldType.FILE,
    status: StatusExport.BlDraftSent,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'bl_draft_approved',
    label: 'B/L DRAFT APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.BlDraftApproved,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'shipped_on_board',
    label: 'SHIPPED ON BOARD',
    type: FieldType.BASIC,
    status: StatusExport.ShippedOnBoard,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'final_bl_copy',
    label: 'FINAL B/L COPY',
    type: FieldType.FILE,
    status: StatusExport.FinalBlCopy,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    type: FieldType.BASIC,
    status: StatusExport.Invoiced,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    type: FieldType.FILE,
    status: StatusExport.Other,
    selectedRow: false,
    filters: [],
  },
];

export const checklistItemsImport: ChecklistItem[] = [
  {
    id: 'bill_of_landing_surrendered',
    label: 'BILL OF LANDING SURRENDERED',
    type: FieldType.FILE,
    status: StatusImport.BillOfLandingSurrendered,
    selectedRow: false,
    filters: [isLongVersion],
  },
  {
    id: 'release_done',
    label: 'RELEASE DONE',
    type: FieldType.FILE,
    status: StatusImport.ReleaseDone,
    selectedRow: true,
    filters: [isLongVersion],
  },
  {
    id: 'pin_number',
    label: 'PIN NUMBER',
    type: FieldType.BASIC,
    status: StatusImport.PinNumber,
    selectedRow: false,
    filters: [],
  },
  {
    id: 'gate_out_terminal',
    label: 'GATE OUT TERMINAL',
    type: FieldType.BASIC,
    status: StatusImport.GateOutTerminal,
    selectedRow: true,
    filters: [],
  },
  {
    id: 'depot_in',
    label: 'DEPOT IN',
    type: FieldType.BASIC,
    status: StatusImport.DepotIn,
    selectedRow: false,
    filters: [someCargoDetailsMatch(isNotShipperOwnedContainer)],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    type: FieldType.BASIC,
    status: StatusImport.Invoiced,
    selectedRow: true,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    type: FieldType.FILE,
    status: StatusImport.Other,
    selectedRow: false,
    filters: [],
  },
];

export const applyRule = (item: ChecklistItem, booking: Booking | undefined) =>
  item.filters.every(filter => (booking ? filter(booking) : false));
