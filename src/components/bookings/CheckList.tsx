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
  makeStyles
} from '@material-ui/core';
import { Booking, CheckListData, StatusExport, StatusImport, ShipperOwnedContainer } from '../../model/Booking';
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

    if( !data || !(property in data) ) return null;

    if (typeof isAdminColumn === 'boolean') {
      let collection = data[property] || [];

      return collection.filter((item: any) => item.isAdmin === isAdminColumn);
    }

    return data[property];
  }

  const isShipperOwnedContainer = () => {
    let isShipper: boolean = false;

    let isShipperOwned = (id: any) => {
      return Object.values(ShipperOwnedContainer).includes(id);
    };

    if( Array.isArray(booking?.CargoDetails) ) {
      let t = booking?.CargoDetails?.find(detail => isShipperOwned(detail.CargoDetail.CtypID));

      if(t) isShipper = true;
    }

    if (
      booking &&
      booking?.CargoDetails &&
      booking?.CargoDetails?.CargoDetail &&
      'CtypID' in booking?.CargoDetails?.CargoDetail
    ) {
      isShipper = isShipperOwned(booking.CargoDetails.CargoDetail.CtypID);
    }

    return isShipper;
  };

  return (
    <TableBody>
      {!isShipperOwnedContainer() ? (
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>
            <Checkbox
              checked={
                getRowData(StatusExport.DepotOut, 'checked') ||
                (booking?.DepotOut && booking?.DepotOut === 'TRUE') ||
                false
              }
              disabled={!isAdmin}
              onChange={event => onCheckboxChange(event, StatusExport.DepotOut)}
            />
          </TableCell>

          <TableCell>DEPOT OUT</TableCell>
          <TableCell>&nbsp;</TableCell>

          {isAdmin ? (
            <TableCell>
              <DropZone
                onDrop={(files: []) => onFilesDrop(files, StatusExport.DepotOut, true)}
                accept="application/pdf"
                documents={getRowData(StatusExport.DepotOut, 'documents', true) || []}
                onDelete={(name: string) => onDelete(StatusExport.DepotOut, name)}
              />
            </TableCell>
          ) : null}
        </TableRow>
      ) : null}

      {booking?.IMCO ? (
        <Fragment>
          <TableRow selected={false} className={classes.tableRow}>
            <TableCell>
              <Checkbox
                checked={getRowData(StatusExport.ImoRequested, 'checked') || false}
                disabled={!isAdmin}
                onChange={event => onCheckboxChange(event, StatusExport.ImoRequested)}
              />
            </TableCell>

            <TableCell>IMO REQUESTED</TableCell>

            <TableCell>
              <DropZone
                onDrop={(files: []) => onFilesDrop(files, StatusExport.ImoRequested, false)}
                accept="application/pdf"
                documents={getRowData(StatusExport.ImoRequested, 'documents', false) || []}
                onDelete={(name: string) => onDelete(StatusExport.ImoRequested, name)}
              />
            </TableCell>

            {isAdmin ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, StatusExport.ImoRequested, true)}
                  accept="application/pdf"
                  documents={getRowData(StatusExport.ImoRequested, 'documents', true) || []}
                  onDelete={(name: string) => onDelete(StatusExport.ImoRequested, name)}
                />
              </TableCell>
            ) : null}
          </TableRow>

          <TableRow selected={false} className={classes.tableRow}>
            <TableCell>
              <Checkbox
                checked={getRowData(StatusExport.ImoApproved, 'checked') || false}
                disabled={!isAdmin}
                onChange={event => onCheckboxChange(event, StatusExport.ImoApproved)}
              />
            </TableCell>

            <TableCell>IMO APPROVED</TableCell>

            <TableCell>
              <DropZone
                onDrop={(files: []) => onFilesDrop(files, StatusExport.ImoApproved, false)}
                accept="application/pdf"
                documents={getRowData(StatusExport.ImoApproved, 'documents', false) || []}
                onDelete={(name: string) => onDelete(StatusExport.ImoApproved, name)}
              />
            </TableCell>

            {isAdmin ? (
              <TableCell>
                <DropZone
                  onDrop={(files: []) => onFilesDrop(files, StatusExport.ImoApproved, true)}
                  accept="application/pdf"
                  documents={getRowData(StatusExport.ImoApproved, 'documents', true) || []}
                  onDelete={(name: string) => onDelete(StatusExport.ImoApproved, name)}
                />
              </TableCell>
            ) : null}
          </TableRow>

          <TableRow selected={false} className={classes.tableRow}>
          <TableCell>
            <Checkbox
              checked={getRowData(StatusExport.FinalDgdSheetAndDeliveryDetails, 'checked') || false}
              disabled={!isAdmin}
              onChange={event => onCheckboxChange(event, StatusExport.FinalDgdSheetAndDeliveryDetails)}
            />
          </TableCell>

          <TableCell>FINAL DGD SHEET &amp; DELIVERY DETAILS</TableCell>

          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.FinalDgdSheetAndDeliveryDetails, false)}
              accept="application/pdf"
              documents={getRowData(StatusExport.FinalDgdSheetAndDeliveryDetails, 'documents', false) || []}
              onDelete={(name: string) => onDelete(StatusExport.FinalDgdSheetAndDeliveryDetails, name)}
            />
          </TableCell>

          {isAdmin ? (
            <TableCell>
              <DropZone
                onDrop={(files: []) => onFilesDrop(files, StatusExport.FinalDgdSheetAndDeliveryDetails, true)}
                accept="application/pdf"
                documents={getRowData(StatusExport.FinalDgdSheetAndDeliveryDetails, 'documents', true) || []}
                onDelete={(name: string) => onDelete(StatusExport.FinalDgdSheetAndDeliveryDetails, name)}
              />
            </TableCell>
          ) : null}
        </TableRow>
        </Fragment>
      ) : null}

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={
              getRowData(StatusExport.GateInTerminal, 'checked') ||
              (booking?.GateIn && booking?.GateIn === 'TRUE') ||
              false
            }
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.GateInTerminal)}
          />
        </TableCell>

        <TableCell>GATE IN TERMINAL</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.GateInTerminal, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.GateInTerminal, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.GateInTerminal, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusExport.VgmSubmission, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.VgmSubmission)}
          />
        </TableCell>

        <TableCell>VGM SUBMISSION</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.VgmSubmission, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.VgmSubmission, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.VgmSubmission, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusExport.ShippingInstructions, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.ShippingInstructions)}
          />
        </TableCell>

        <TableCell>SHIPPING INSTRUCTIONS</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusExport.ShippingInstructions, false)}
            accept="application/pdf"
            documents={getRowData(StatusExport.ShippingInstructions, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusExport.ShippingInstructions, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.ShippingInstructions, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.ShippingInstructions, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.ShippingInstructions, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusExport.BlDraftSent, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.BlDraftSent)}
          />
        </TableCell>

        <TableCell>B/L DRAFT SENT</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusExport.BlDraftSent, false)}
            accept="application/pdf"
            documents={getRowData(StatusExport.BlDraftSent, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusExport.BlDraftSent, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.BlDraftSent, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.BlDraftSent, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.BlDraftSent, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusExport.BlDraftApproved, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.BlDraftApproved)}
          />
        </TableCell>

        <TableCell>B/L DRAFT APPROVED</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.BlDraftApproved, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.BlDraftApproved, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.BlDraftApproved, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={
              getRowData(StatusExport.ShippedOnBoard, 'checked') ||
              (booking?.ShippedOnBoard && booking?.ShippedOnBoard === 'TRUE') ||
              false
            }
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.ShippedOnBoard)}
          />
        </TableCell>

        <TableCell>SHIPPED ON BOARD</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.ShippedOnBoard, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.ShippedOnBoard, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.ShippedOnBoard, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={getRowData(StatusExport.FinalBlCopy, 'checked') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.FinalBlCopy)}
          />
        </TableCell>

        <TableCell>FINAL B/L COPY</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusExport.FinalBlCopy, false)}
            accept="application/pdf"
            documents={getRowData(StatusExport.FinalBlCopy, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusExport.FinalBlCopy, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.FinalBlCopy, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.FinalBlCopy, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.FinalBlCopy, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={
              getRowData(StatusExport.Invoiced, 'checked') ||
              (booking?.Invoiced && booking?.Invoiced === 'TRUE') ||
              false
            }
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, StatusExport.Invoiced)}
          />
        </TableCell>

        <TableCell>INVOICED</TableCell>
        <TableCell>&nbsp;</TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.Invoiced, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.Invoiced, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.Invoiced, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>&nbsp;</TableCell>

        <TableCell>OTHER</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusExport.Other, false)}
            accept="application/pdf"
            documents={getRowData(StatusExport.Other, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusExport.Other, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusExport.Other, true)}
              accept="application/pdf"
              documents={getRowData(StatusExport.Other, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusExport.Other, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
    </TableBody>
  );
};

const ImportBody: React.FC<TableBodyProps> = ({ booking, isAdmin, onCheckboxChange, onFilesDrop, onDelete }) => {
  const classes = useStyles();

  const getRowData = (label: string, property: string, isAdminColumn?: boolean): any => {
    const data: any = booking?.checklists?.find((row: CheckListData) => row.label === label);

    if( !data || !(property in data) ) return null;

    if (typeof isAdminColumn === 'boolean') {
      let collection = data[property] || [];

      return collection.filter((item: any) => item.isAdmin === isAdminColumn);
    }

    return data[property];
  }

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
            accept="application/pdf"
            documents={getRowData(StatusImport.BillOfLandingCopy, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.BillOfLandingCopy, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.BillOfLandingCopy, true)}
              accept="application/pdf"
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
            accept="application/pdf"
            documents={getRowData(StatusImport.ReleaseInstructions, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.ReleaseInstructions, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.ReleaseInstructions, true)}
              accept="application/pdf"
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

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.PinNumber, false)}
            accept="application/pdf"
            documents={getRowData(StatusImport.PinNumber, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.PinNumber, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.PinNumber, true)}
              accept="application/pdf"
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

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.GateOutTerminal, false)}
            accept="application/pdf"
            documents={getRowData(StatusImport.GateOutTerminal, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.GateOutTerminal, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.GateOutTerminal, true)}
              accept="application/pdf"
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

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.DepotIn, false)}
            accept="application/pdf"
            documents={getRowData(StatusImport.DepotIn, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.DepotIn, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.DepotIn, true)}
              accept="application/pdf"
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

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, StatusImport.Invoiced, false)}
            accept="application/pdf"
            documents={getRowData(StatusImport.Invoiced, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.Invoiced, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.Invoiced, true)}
              accept="application/pdf"
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
            accept="application/pdf"
            documents={getRowData(StatusImport.Other, 'documents', false) || []}
            onDelete={(name: string) => onDelete(StatusImport.Other, name)}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, StatusImport.Other, true)}
              accept="application/pdf"
              documents={getRowData(StatusImport.Other, 'documents', true) || []}
              onDelete={(name: string) => onDelete(StatusImport.Other, name)}
            />
          </TableCell>
        ) : null}
      </TableRow>
    </TableBody>
  );
};

const CheckList: React.FC<CheckListProps> = ({
  booking,
  showCompanyInfo,
  onCheckboxChange,
  onFilesDrop,
  onDelete
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
      {booking?.Category === 'Export' ?
        <ExportBody
          booking={booking}
          isAdmin={showCompanyInfo}
          onCheckboxChange={onCheckboxChange}
          onFilesDrop={onFilesDrop}
          onDelete={onDelete}
        />
      : null}
      {booking?.Category === 'Import' ?
        <ImportBody
          booking={booking}
          isAdmin={showCompanyInfo}
          onCheckboxChange={onCheckboxChange}
          onFilesDrop={onFilesDrop}
          onDelete={onDelete}
        />
      : null}
    </Table>
  );
};

export default CheckList;
