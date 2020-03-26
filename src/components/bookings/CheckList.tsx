import React from 'react';
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
import { Booking } from '../../model/Booking';
import DropZone from '../DropZone';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
}

// interface CheckListData {
//   label: string;
//   value?: boolean;
//   documents: CheckListDocument[];
// }

// interface CheckListDocument {
//   isAdmin: boolean;
//   url: string;
// }

interface TableBodyProps {
  booking: Booking | undefined;
  isAdmin?: boolean;
  onCheckboxChange: any;
  onFilesDrop: any;
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

const ExportBody: React.FC<TableBodyProps> = ({ booking, isAdmin, onCheckboxChange, onFilesDrop }) => {
  const classes = useStyles();

  console.log('export: ', booking);

  return (
    <TableBody>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={(booking?.DepotOut && booking?.DepotOut === 'TRUE') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'DEPOT OUT')}
          />
        </TableCell>

        <TableCell>DEPOT OUT</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'DEPOT OUT', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'DEPOT OUT', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={(booking?.GateIn && booking?.GateIn === 'TRUE') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'GATE IN TERMINAL')}
          />
        </TableCell>

        <TableCell>GATE IN TERMINAL</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'GATE IN TERMINAL', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'GATE IN TERMINAL', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'VGM SUBMISSION')}
          />
        </TableCell>

        <TableCell>VGM SUBMISSION</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'VGM SUBMISSION', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'VGM SUBMISSION', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'SHIPPING INSTRUCTIONS')}
          />
        </TableCell>

        <TableCell>SHIPPING INSTRUCTIONS</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'SHIPPING INSTRUCTIONS', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'SHIPPING INSTRUCTIONS', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'B/L DRAFT SENT')}
          />
        </TableCell>

        <TableCell>B/L DRAFT SENT</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'B/L DRAFT SENT', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'B/L DRAFT SENT', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'B/L DRAFT APPROVED')}
          />
        </TableCell>

        <TableCell>B/L DRAFT APPROVED</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'B/L DRAFT APPROVED', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'B/L DRAFT APPROVED', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={(booking?.ShippedOnBoard && booking?.ShippedOnBoard === 'TRUE') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'SHIPPED ON BOAR')}
          />
        </TableCell>

        <TableCell>SHIPPED ON BOARD</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'SHIPPED ON BOARD', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'SHIPPED ON BOARD', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'FINAL B/L COPY')}
          />
        </TableCell>

        <TableCell>FINAL B/L COP</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'FINAL B/L COP', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'FINAL B/L COP', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={(booking?.Invoiced && booking?.Invoiced === 'TRUE') || false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'INVOICED')}
          />
        </TableCell>

        <TableCell>INVOICED</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'INVOICED', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'INVOICED', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>

      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>&nbsp;</TableCell>

        <TableCell>OTHER</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'OTHER', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'OTHER', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
    </TableBody>
  );
};

const ImportBody: React.FC<TableBodyProps> = ({ booking, isAdmin, onCheckboxChange, onFilesDrop }) => {
  const classes = useStyles();

  console.log('import: ', booking);

  return (
    <TableBody>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'BILL OF LANDING COPY')}
          />
        </TableCell>

        <TableCell>BILL OF LANDING COPY</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'BILL OF LANDING COPY', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'BILL OF LANDING COPY', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'RELEASE INSTRUCTIONS')}
          />
        </TableCell>

        <TableCell>RELEASE INSTRUCTIONS</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'RELEASE INSTRUCTIONS', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'RELEASE INSTRUCTIONS', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'PIN NUMBER')}
          />
        </TableCell>

        <TableCell>PIN NUMBER</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'PIN NUMBER', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'PIN NUMBER', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'GATE OUT TERMINAL')}
          />
        </TableCell>

        <TableCell>GATE OUT TERMINAL</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'GATE OUT TERMINAL', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'GATE OUT TERMINAL', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'DEPOT IN')}
          />
        </TableCell>

        <TableCell>DEPOT IN</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'DEPOT IN', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'DEPOT IN', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={true} className={classes.tableRow}>
        <TableCell>
          <Checkbox
            checked={false}
            disabled={!isAdmin}
            onChange={event => onCheckboxChange(event, 'INVOICED')}
          />
        </TableCell>

        <TableCell>INVOICED</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'INVOICED', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'INVOICED', true)}
              accept="application/pdf"
              documents={[]}
            />
          </TableCell>
        ) : null}
      </TableRow>
      <TableRow selected={false} className={classes.tableRow}>
        <TableCell>&nbsp;</TableCell>
        <TableCell>OTHER</TableCell>

        <TableCell>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, 'OTHER', false)}
            accept="application/pdf"
            documents={[]}
          />
        </TableCell>

        {isAdmin ? (
          <TableCell>
            <DropZone
              onDrop={(files: []) => onFilesDrop(files, 'OTHER', true)}
              accept="application/pdf"
              documents={[]}
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
  onFilesDrop
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
        />
      : null}
      {booking?.Category === 'Import' ?
        <ImportBody
          booking={booking}
          isAdmin={showCompanyInfo}
          onCheckboxChange={onCheckboxChange}
          onFilesDrop={onFilesDrop}
        />
      : null}
    </Table>
  );
};

export default CheckList;
