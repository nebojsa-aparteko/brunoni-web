import React, { useMemo } from 'react';
import {
  Checkbox,
  createStyles,
  Theme,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  makeStyles,
} from '@material-ui/core';
import {
  Booking,
  CheckListData,
  StatusExport,
  StatusImport,
  ShipperOwnedContainer,
  CargoOverdimension,
  IMCO,
  CargoDetail,
} from '../../model/Booking';
import DropZone from '../DropZone';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
  onDelete?: any;
}

interface TableBodyProps {
  booking: Booking | undefined;
  isAdmin?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
  onDelete?: any;
  checklistItems: ChecklistItem[];
}

type CargoDetailFilter = (detail: CargoDetail) => boolean;
type BookingFilter = (booking: Booking) => boolean;

interface ChecklistItem {
  id: string;
  label: string;
  showFileUpload: boolean;
  status: StatusExport | StatusImport;
  filters: BookingFilter[];
  additionalCondition?: (booking: Booking | undefined) => boolean | undefined | '';
}

const someCargoDetailsMatch = (fn: CargoDetailFilter): BookingFilter => booking => booking.CargoDetails.some(fn);

const isImcoContainer = (detail: CargoDetail): boolean => detail.IMCO === IMCO.Trigger;

const isOverdimensionedContainer = (detail: CargoDetail): boolean =>
  detail.Overdimension === CargoOverdimension.Trigger;

const isShipperOwnedContainer = (detail: CargoDetail): boolean =>
  !Object.values(ShipperOwnedContainer).includes(detail.CtypID as ShipperOwnedContainer);

const is20TKContainer = (detail: CargoDetail): boolean => detail.CtypID === ShipperOwnedContainer.The20TK;

const checklistItemsExport: ChecklistItem[] = [
  {
    id: 'depot_out',
    label: 'DEPOT OUT',
    showFileUpload: false,
    status: StatusExport.DepotOut,
    filters: [someCargoDetailsMatch(isShipperOwnedContainer)],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE',
  },
  {
    id: 'imo_requested',
    label: 'IMO REQUESTED',
    showFileUpload: false,
    status: StatusExport.ImoRequested,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'imo_approved',
    label: 'IMO APPROVED',
    showFileUpload: false,
    status: StatusExport.ImoApproved,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'final_dgd_sheet_and_delivery_details',
    label: 'FINAL DGD SHEET & DELIVERY DETAILS',
    showFileUpload: true,
    status: StatusExport.FinalDgdSheetAndDeliveryDetails,
    filters: [someCargoDetailsMatch(isImcoContainer)],
  },
  {
    id: 'oog_requested',
    label: 'OOG REQUESTED',
    showFileUpload: false,
    status: StatusExport.OogRequested,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer)],
  },
  {
    id: 'oog_approved',
    label: 'OOG APPROVED',
    showFileUpload: false,
    status: StatusExport.OogApproved,
    filters: [someCargoDetailsMatch(isOverdimensionedContainer)],
  },
  {
    id: 'tank_certificate',
    label: 'TANK CERTIFICATE',
    showFileUpload: true,
    status: StatusExport.tankCertificate,
    filters: [someCargoDetailsMatch(is20TKContainer)],
  },
  {
    id: 'gate_in_terminal',
    label: 'GATE IN TERMINAL',
    showFileUpload: false,
    status: StatusExport.GateInTerminal,
    filters: [],
  },
  {
    id: 'vgm_submission',
    label: 'VGM SUBMISSION',
    showFileUpload: false,
    status: StatusExport.VgmSubmission,
    filters: [],
  },
  {
    id: 'shipping_instructions',
    label: 'SHIPPING INSTRUCTIONS',
    showFileUpload: true,
    status: StatusExport.ShippingInstructions,
    filters: [],
  },
  {
    id: 'bl_draft_sent',
    label: 'B/L DRAFT SENT',
    showFileUpload: true,
    status: StatusExport.BlDraftSent,
    filters: [],
  },
  {
    id: 'bl_draft_approved',
    label: 'B/L DRAFT APPROVED',
    showFileUpload: false,
    status: StatusExport.BlDraftApproved,
    filters: [],
  },
  {
    id: 'shipped_on_board',
    label: 'SHIPPED ON BOARD',
    showFileUpload: false,
    status: StatusExport.ShippedOnBoard,
    filters: [],
  },
  {
    id: 'final_bl_copy',
    label: 'FINAL B/L COPY',
    showFileUpload: true,
    status: StatusExport.FinalBlCopy,
    filters: [],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    showFileUpload: false,
    status: StatusExport.Invoiced,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    showFileUpload: true,
    status: StatusExport.Other,
    filters: [],
  },
];

const checklistItemsImport: ChecklistItem[] = [
  {
    id: 'bill_of_landing_surrendered',
    label: 'BILL OF LANDING SURRENDERED',
    showFileUpload: true,
    status: StatusImport.BillOfLandingSurrendered,
    filters: [],
  },
  {
    id: 'release_done',
    label: 'RELEASE DONE',
    showFileUpload: true,
    status: StatusImport.ReleaseDone,
    filters: [],
  },
  {
    id: 'pin_number',
    label: 'PIN NUMBER',
    showFileUpload: false,
    status: StatusImport.PinNumber,
    filters: [],
  },
  {
    id: 'gate_out_terminal',
    label: 'GATE OUT TERMINAL',
    showFileUpload: false,
    status: StatusImport.GateOutTerminal,
    filters: [],
  },
  {
    id: 'depot_in',
    label: 'DEPOT IN',
    showFileUpload: false,
    status: StatusImport.DepotIn,
    filters: [someCargoDetailsMatch(isShipperOwnedContainer)],
  },
  {
    id: 'invoiced',
    label: 'INVOICED',
    showFileUpload: false,
    status: StatusImport.Invoiced,
    filters: [],
  },
  {
    id: 'other',
    label: 'OTHER',
    showFileUpload: true,
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

const getRowData = (booking: Booking | undefined, label: string, property: string, isAdminColumn?: boolean): any => {
  const data: any = booking?.checklists?.find((row: CheckListData) => row.label === label);
  if (!data || !(property in data)) return null;

  if (typeof isAdminColumn === 'boolean') {
    let collection = data[property] || [];
    return collection.filter((item: any) => item.isAdmin === isAdminColumn);
  }
  return data[property];
};

const CheckListContent: React.FC<TableBodyProps> = ({
  booking,
  isAdmin,
  onCheckboxChange,
  onFilesDrop,
  onDelete,
  checklistItems,
}) => {
  const classes = useStyles();

  return (
    <TableBody>
      {/* Exception #2: Shipper's owned Container */}
      {checklistItems.map(item => {
        const showField = item.filters.every(filter => (booking ? filter(booking) : false));

        return showField ? (
          <TableRow selected={false} className={classes.tableRow}>
            <TableCell>
              <Checkbox
                checked={
                  getRowData(booking, item.status, 'checked') ||
                  (item?.additionalCondition && item?.additionalCondition(booking)) ||
                  false
                }
                disabled={!isAdmin}
                onChange={event => onCheckboxChange(event, item.status)}
              />
            </TableCell>

            <TableCell>{item.label}</TableCell>
            {item.showFileUpload ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, item.status, false)}
                  documents={getRowData(booking, item.status, 'documents', false) || []}
                  onDelete={(name: string) => onDelete(item.status, name)}
                />
              </TableCell>
            ) : (
              <TableCell>&nbsp; </TableCell>
            )}
            {isAdmin ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, item.status, true)}
                  documents={getRowData(booking, item.status, 'documents', true) || []}
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

const CheckList: React.FC<CheckListProps> = ({ booking, showCompanyInfo, onCheckboxChange, onFilesDrop, onDelete }) => {
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
      />
    </Table>
  );
};

export default CheckList;
