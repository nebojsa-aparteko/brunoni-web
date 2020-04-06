import React, { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  TextField,
} from '@material-ui/core';
import {
  Booking,
  BookingVersion,
  CargoDetail,
  CargoOverdimension,
  CheckListData,
  IMCO,
  ShipperOwnedContainer,
  StatusExport,
  StatusImport,
} from '../../model/Booking';
import DropZone from '../DropZone';
import debounce from 'lodash/fp/debounce';

enum FieldType {
  BASIC,
  FILE,
  TEXT,
}

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
  onDelete?: any;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>, label: string) => void;
}

interface TableBodyProps {
  booking: Booking | undefined;
  isAdmin?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
  onDelete?: any;
  checklistItems: ChecklistItem[];
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>, label: string) => void;
}

type CargoDetailFilter = (detail: CargoDetail) => boolean;
type BookingFilter = (booking: Booking) => boolean;

interface ChecklistItem {
  id: string;
  label: string;
  type: FieldType;
  status: StatusExport | StatusImport;
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
  // console.log(booking.CarrierID);
  return booking.CarrierID === 'ZIM SHIPPING LINE';
};

const isAllmarine = (): boolean => process.env.REACT_APP_BRAND === 'allmarine';

const checklistItemsExport: ChecklistItem[] = [
  {
    id: 'depot_out',
    label: 'DEPOT OUT',
    type: FieldType.BASIC,
    status: StatusExport.DepotOut,
    filters: [someCargoDetailsMatch(isNotShipperOwnedContainer)],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE',
  },
  {
    id: 'soc_certificate',
    label: 'SOC CERTIFICATE',
    type: FieldType.FILE,
    status: StatusExport.SocCertificate,
    filters: [someCargoDetailsMatch(isShipperOwnedContainer)],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE', //TODO check if needed
  },
  {
    id: 'imo_requested',
    label: 'IMO REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.ImoRequested,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'imo_approved',
    label: 'IMO APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.ImoApproved,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'final_dgd_sheet_and_delivery_details',
    label: 'FINAL DGD SHEET & DELIVERY DETAILS',
    type: FieldType.FILE,
    status: StatusExport.FinalDgdSheetAndDeliveryDetails,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'oog_requested',
    label: 'OOG REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.OogRequested,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer), isLongVersion],
  },
  {
    id: 'oog_approved',
    label: 'OOG APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.OogApproved,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer), isLongVersion],
  },
  {
    id: 'lashing_certificate',
    label: 'LASHING CERTIFICATE',
    type: FieldType.BASIC,
    status: StatusExport.OogApproved,
    filters: [isAllmarine, isZIM, isLongVersion],
  },
  {
    id: 'tank_certificate',
    label: 'TANK CERTIFICATE',
    type: FieldType.FILE,
    status: StatusExport.tankCertificate,
    filters: [someCargoDetailsMatch(is20TKContainer), isLongVersion],
  },
  {
    id: 'gate_in_terminal',
    label: 'GATE IN TERMINAL',
    type: FieldType.BASIC,
    status: StatusExport.GateInTerminal,
    filters: [],
  },
  {
    id: 'bht_number_issuance',
    label: 'B/BHT NUMBER ISSUANCE',
    type: FieldType.TEXT,
    status: StatusExport.BhtNumberIssuance,
    filters: [],
  },
  {
    id: 'vgm_submission',
    label: 'VGM SUBMISSION',
    type: FieldType.BASIC,
    status: StatusExport.VgmSubmission,
    filters: [],
  },
  {
    id: 'shipping_instructions',
    label: 'SHIPPING INSTRUCTIONS',
    type: FieldType.FILE,
    status: StatusExport.ShippingInstructions,
    filters: [],
  },
  {
    id: 'bl_draft_sent',
    label: 'B/L DRAFT SENT',
    type: FieldType.FILE,
    status: StatusExport.BlDraftSent,
    filters: [],
  },
  {
    id: 'bl_draft_approved',
    label: 'B/L DRAFT APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.BlDraftApproved,
    filters: [],
  },
  {
    id: 'shipped_on_board',
    label: 'SHIPPED ON BOARD',
    type: FieldType.BASIC,
    status: StatusExport.ShippedOnBoard,
    filters: [],
  },
  {
    id: 'final_bl_copy',
    label: 'FINAL B/L COPY',
    type: FieldType.FILE,
    status: StatusExport.FinalBlCopy,
    filters: [],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    type: FieldType.BASIC,
    status: StatusExport.Invoiced,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    type: FieldType.FILE,
    status: StatusExport.Other,
    filters: [],
  },
];

const checklistItemsImport: ChecklistItem[] = [
  {
    id: 'bill_of_landing_surrendered',
    label: 'BILL OF LANDING SURRENDERED',
    type: FieldType.FILE,
    status: StatusImport.BillOfLandingSurrendered,
    filters: [isLongVersion],
  },
  {
    id: 'release_done',
    label: 'RELEASE DONE',
    type: FieldType.FILE,
    status: StatusImport.ReleaseDone,
    filters: [isLongVersion],
  },
  {
    id: 'pin_number',
    label: 'PIN NUMBER',
    type: FieldType.BASIC,
    status: StatusImport.PinNumber,
    filters: [],
  },
  {
    id: 'gate_out_terminal',
    label: 'GATE OUT TERMINAL',
    type: FieldType.BASIC,
    status: StatusImport.GateOutTerminal,
    filters: [],
  },
  {
    id: 'depot_in',
    label: 'DEPOT IN',
    type: FieldType.BASIC,
    status: StatusImport.DepotIn,
    filters: [someCargoDetailsMatch(isNotShipperOwnedContainer)],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    type: FieldType.BASIC,
    status: StatusImport.Invoiced,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    type: FieldType.FILE,
    status: StatusImport.Other,
    filters: [],
  },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '100%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
    },
    table: {
      overflowX: 'auto',
      marginBottom: '1.5em',
    },
    tableRow: {
      height: '55px',
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 12px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
  }),
);

const CheckListContent: React.FC<TableBodyProps> = ({
  booking,
  isAdmin,
  onCheckboxChange,
  onFilesDrop,
  onDelete,
  checklistItems,
  onInputChange,
}) => {
  const classes = useStyles();

  const saveInput = useMemo(() => debounce(250, onInputChange), [onInputChange]);

  const getRowData = (label: string, property: string, isAdminColumn?: boolean): any => {
    const data: any = booking?.checklists?.find((row: CheckListData) => row.label === label);
    if (!data || !(property in data)) return null;

    if (typeof isAdminColumn === 'boolean') {
      let collection = data[property] || [];
      return collection.filter((item: any) => item.isAdmin === isAdminColumn);
    }
    return data[property];
  };

  return (
    <TableBody>
      {/* Exception #2: Shipper's owned Container */}
      {checklistItems.map(item => {
        const showField = item.filters.every(filter => (booking ? filter(booking) : false));

        return showField ? (
          <TableRow selected={false} className={classes.tableRow} key={item.id}>
            <TableCell>
              <Checkbox
                checked={
                  getRowData(item.status, 'checked') ||
                  (item?.additionalCondition && item?.additionalCondition(booking)) ||
                  false
                }
                disabled={!isAdmin}
                onChange={event => onCheckboxChange(event, item.status)}
              />
            </TableCell>

            <TableCell>{item.label}</TableCell>
            {item.type === FieldType.FILE ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, item.status, false)}
                  documents={getRowData(item.status, 'documents', false) || []}
                  onDelete={(name: string) => onDelete(item.status, name)}
                />
              </TableCell>
            ) : null}
            {item.type === FieldType.TEXT ? (
              <TableCell>
                <TextField
                  variant="outlined"
                  multiline
                  rowsMax="2"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => saveInput({ ...event }, item.status)}
                  // defaultValue={getRowData(item.status, 'bhtNumberValue') || ''} // How to set default value from db
                />
              </TableCell>
            ) : null}
            {item.type === FieldType.BASIC ? <TableCell>&nbsp; </TableCell> : null}

            {isAdmin ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, item.status, true)}
                  documents={getRowData(item.status, 'documents', true) || []}
                  onDelete={(name: string) => onDelete(item.status, name)}
                />
              </TableCell>
            ) : null}
          </TableRow>
        ) : null;
      })}
    </TableBody>
  );
};

const CheckList: React.FC<CheckListProps> = ({
  booking,
  showCompanyInfo,
  onCheckboxChange,
  onFilesDrop,
  onDelete,
  onInputChange,
}) => {
  const classes = useStyles();

  return (
    <Table className={classes.table} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell align="center">&nbsp;</TableCell>
          <TableCell>&nbsp;</TableCell>
          <TableCell>Customer</TableCell>
          {showCompanyInfo && <TableCell>Admin</TableCell>}
        </TableRow>
      </TableHead>
      <CheckListContent
        booking={booking}
        isAdmin={showCompanyInfo}
        onCheckboxChange={onCheckboxChange}
        onFilesDrop={onFilesDrop}
        onDelete={onDelete}
        checklistItems={booking?.Category === 'Export' ? checklistItemsExport : checklistItemsImport}
        onInputChange={onInputChange}
      />
    </Table>
  );
};

export default CheckList;
