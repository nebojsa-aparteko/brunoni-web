import React, { useEffect, useMemo, useState } from 'react';
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
  TextField,
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

interface ChecklistItem {
  id: string;
  label: string;
  type: FieldType;
  status: StatusExport | StatusImport;
  filters: ((detail: CargoDetail) => boolean)[];
  additionalCondition?: (booking: Booking | undefined) => boolean | undefined | '';
}
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
    type: FieldType.BASIC,
    status: StatusExport.DepotOut,
    filters: [isShipperOwnedContainer],
    additionalCondition: booking => booking?.DepotOut && booking?.DepotOut === 'TRUE',
  },
  {
    id: 'imo_requested',
    label: 'IMO REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.ImoRequested,
    filters: [isImcoContainer],
  },
  {
    id: 'imo_approved',
    label: 'IMO APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.ImoApproved,
    filters: [isImcoContainer],
  },
  {
    id: 'final_dgd_sheet_and_delivery_details',
    label: 'FINAL DGD SHEET & DELIVERY DETAILS',
    type: FieldType.FILE,
    status: StatusExport.FinalDgdSheetAndDeliveryDetails,
    filters: [isImcoContainer],
  },
  {
    id: 'oog_requested',
    label: 'OOG REQUESTED',
    type: FieldType.BASIC,
    status: StatusExport.OogRequested,
    filters: [isOverdimensionedContainer],
  },
  {
    id: 'oog_approved',
    label: 'OOG APPROVED',
    type: FieldType.BASIC,
    status: StatusExport.OogApproved,
    filters: [isOverdimensionedContainer],
  },
  {
    id: 'tank_certificate',
    label: 'TANK CERTIFICATE',
    type: FieldType.FILE,
    status: StatusExport.tankCertificate,
    filters: [is20TKContainer],
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
    filters: [],
  },
  {
    id: 'release_done',
    label: 'RELEASE DONE',
    type: FieldType.FILE,
    status: StatusImport.ReleaseDone,
    filters: [],
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
    filters: [isShipperOwnedContainer],
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
  const getCargoDetails = () => {
    if (Array.isArray(booking?.CargoDetails)) {
      return booking?.CargoDetails;
    } else {
      return [];
    }
  };

  const applyFilter = (filterMethod: (detail: CargoDetail) => boolean): boolean => {
    let details = getCargoDetails();
    let mainFilter = details?.find(detail => filterMethod(detail));
    return Boolean(mainFilter);
  };

  return (
    <TableBody>
      {/* Exception #2: Shipper's owned Container */}
      {checklistItems.map(item => {
        let showField = item.filters.reduce(
          (accumulator, currentValue) => applyFilter(currentValue) && accumulator,
          true,
        );
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
