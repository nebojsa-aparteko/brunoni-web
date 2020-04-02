import React, { Fragment } from 'react';
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
}

interface ChecklistItem {
  id: string;
  label: string;
  showFileUpload: boolean;
  status: StatusExport | StatusImport;
  filters: ((detail: CargoDetail) => boolean)[];
  additionalCondition?: string;
}
const isImcoContainer = (detail: CargoDetail): boolean => detail.IMCO === IMCO.Trigger;

const isOverdimensionedContainer = (detail: CargoDetail): boolean =>
  detail.Overdimension === CargoOverdimension.Trigger;

const isShipperOwnedContainer = (detail: CargoDetail): boolean =>
  !Object.values(ShipperOwnedContainer).includes(detail.CtypID as ShipperOwnedContainer);
let checklistItems: ChecklistItem[] = [
  {
    id: 'depot_out',
    label: 'DEPOT OUT',
    showFileUpload: true,
    status: StatusExport.DepotOut,
    filters: [isShipperOwnedContainer],
    additionalCondition: 'DepotOut',
  },
  {
    id: 'imo_requested',
    label: 'IMO REQUESTED',
    showFileUpload: false,
    status: StatusExport.ImoRequested,
    filters: [isImcoContainer],
  },
  {
    id: 'imo_approved',
    label: 'IMO APPROVED',
    showFileUpload: false,
    status: StatusExport.ImoApproved,
    filters: [isImcoContainer],
  },
  {
    id: 'final_dgd_sheet_and_delivery_details',
    label: 'FINAL DGD SHEET & DELIVERY DETAILS',
    showFileUpload: true,
    status: StatusExport.FinalDgdSheetAndDeliveryDetails,
    filters: [isImcoContainer],
  },
  {
    id: 'oog_requested',
    label: 'OOG REQUESTED',
    showFileUpload: false,
    status: StatusExport.OogRequested,
    filters: [isOverdimensionedContainer],
  },
  {
    id: 'oog_approved',
    label: 'OOG APPROVED',
    showFileUpload: false,
    status: StatusExport.OogApproved,
    filters: [isOverdimensionedContainer],
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

const ExportBody: React.FC<TableBodyProps> = ({ booking, isAdmin, onCheckboxChange, onFilesDrop, onDelete }) => {
  const classes = useStyles();

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
          <TableRow selected={false} className={classes.tableRow}>
            <TableCell>
              <Checkbox
                checked={
                  getRowData(item.status, 'checked') ||
                  // (item.additionalCondition && booking?.[item.additionalCondition] && booking?.[item.additionalCondition] === 'TRUE') ||
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
                  onDrop={(files: []) => onFilesDrop(files, StatusExport.ShippingInstructions, false)}
                  documents={getRowData(StatusExport.ShippingInstructions, 'documents', false) || []}
                  onDelete={(name: string) => onDelete(StatusExport.ShippingInstructions, name)}
                />
              </TableCell>
            ) : (
              <TableCell>&nbsp; </TableCell>
            )}
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

const ImportBody: React.FC<TableBodyProps> = ({ booking, isAdmin, onCheckboxChange, onFilesDrop, onDelete }) => {
  const classes = useStyles();

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
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusImport.BillOfLandingCopy, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.BillOfLandingCopy)}
          />
        </TableCell>

        <TableCell>BILL OF LANDING COPY</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.BillOfLandingCopy, false)}
            documents={getRowData(StatusImport.BillOfLandingCopy, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.BillOfLandingCopy, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.BillOfLandingCopy, true)}
              documents={getRowData(StatusImport.BillOfLandingCopy, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.BillOfLandingCopy, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusImport.ReleaseInstructions, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.ReleaseInstructions)}
          />
        </TableCell>

        <TableCell>RELEASE INSTRUCTIONS</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.ReleaseInstructions, false)}
            documents={getRowData(StatusImport.ReleaseInstructions, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.ReleaseInstructions, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.ReleaseInstructions, true)}
              documents={getRowData(StatusImport.ReleaseInstructions, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.ReleaseInstructions, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusImport.PinNumber, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.PinNumber)}
          />
        </TableCell>

        <TableCell>PIN NUMBER</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.PinNumber, true)}
              documents={getRowData(StatusImport.PinNumber, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.PinNumber, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusImport.GateOutTerminal, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.GateOutTerminal)}
          />
        </TableCell>

        <TableCell>GATE OUT TERMINAL</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.GateOutTerminal, true)}
              documents={getRowData(StatusImport.GateOutTerminal, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.GateOutTerminal, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusImport.DepotIn, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.DepotIn)}
          />
        </TableCell>

        <TableCell>DEPOT IN</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.DepotIn, true)}
              documents={getRowData(StatusImport.DepotIn, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.DepotIn, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={
              getRowData(StatusImport.Invoiced, 'checked') ||
              (booking?.Invoiced && booking?.Invoiced === 'TRUE') ||
              false
            }
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusImport.Invoiced)}
          />
        </TableCell>

        <TableCell>INVOICED</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.Invoiced, true)}
              documents={getRowData(StatusImport.Invoiced, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.Invoiced, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>&nbsp;</TableCell>
        <TableCell>OTHER</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.Other, false)}
            documents={getRowData(StatusImport.Other, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.Other, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.Other, true)}
              documents={getRowData(StatusImport.Other, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.Other, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
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
      {booking?.Category === 'Export' ? (
        <ExportBody
          booking={booking}
          isAdmin={showCompanyInfo}
          onCheckboxChange={onCheckboxChange}
          onFilesDrop={onFilesDrop}
          onDelete={onDelete}
        />
      ) : null}
      {booking?.Category === 'Import' ? (
        <ImportBody
          booking={booking}
          isAdmin={showCompanyInfo}
          onCheckboxChange={onCheckboxChange}
          onFilesDrop={onFilesDrop}
          onDelete={onDelete}
        />
      ) : null}
    </Table>
  );
};

export default CheckList;
