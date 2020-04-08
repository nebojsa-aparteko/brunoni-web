import React, { useMemo } from 'react';
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
import { Booking, CheckListData } from '../../../model/Booking';
import DropZone from '../../DropZone';
import debounce from 'lodash/fp/debounce';
import { applyRule, ChecklistItem, checklistItemsExport, checklistItemsImport, FieldType } from './checklistItemsData';

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
        [theme.breakpoints.down('xs')]: {
          display: 'block',
          marginTop: theme.spacing(0),
          marginBottom: theme.spacing(0),
          padding: theme.spacing(0),
        },
      },
    },
    hidePrint: {
      ['@media print']: {
        display: 'none',
        width: '0',
        height: '0',
      },
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
  onInputChange,
}) => {
  return (
    <TableBody>
      {/* Exception #2: Shipper's owned Container */}
      {checklistItems.map(item => {
        return applyRule(item, booking) ? (
          <ChecklistItemRow
            checklistItem={item}
            isAdmin={isAdmin}
            isChecked={
              getRowData(booking, item.status, 'checked') ||
              (item?.additionalCondition && item?.additionalCondition(booking)) ||
              false
            }
            adminDocuments={getRowData(booking, item.status, 'documents', true) || []}
            userDocuments={getRowData(booking, item.status, 'documents', false) || []}
            inputValue={getRowData(booking, item.status, 'bhtNumberValue') || ''}
            onInputChange={onInputChange}
            onCheckboxChange={onCheckboxChange}
            onFilesDrop={onFilesDrop}
            onDelete={onDelete}
          />
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
          <TableCell align="center" className={classes.hidePrint}>
            &nbsp;
          </TableCell>
          <TableCell className={classes.hidePrint}>&nbsp;</TableCell>
          <TableCell className={classes.hidePrint}>Customer</TableCell>
          {showCompanyInfo && <TableCell className={classes.hidePrint}>Admin</TableCell>}
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

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  isChecked: boolean;
  userDocuments: any;
  adminDocuments: any;
  inputValue: string;
  onCheckboxChange: any;
  onFilesDrop: any;
  onDelete?: any;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>, label: string) => void;
}
const ChecklistItemRow = ({
  checklistItem,
  isAdmin,
  isChecked,
  userDocuments,
  adminDocuments,
  inputValue,
  onCheckboxChange,
  onDelete,
  onFilesDrop,
  onInputChange,
}: ChecklistItemRowProp) => {
  const classes = useStyles();
  const saveInput = useMemo(() => debounce(250, onInputChange), [onInputChange]);

  return (
    <TableRow selected={checklistItem.selectedRow} className={classes.tableRow} key={checklistItem.id}>
      <TableCell>
        <Checkbox
          checked={isChecked}
          disabled={!isAdmin}
          onChange={event => onCheckboxChange(event, checklistItem.status)}
        />
      </TableCell>

      <TableCell>{checklistItem.label}</TableCell>
      {checklistItem.type === FieldType.FILE ? (
        <TableCell className={classes.hidePrint}>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, checklistItem.status, false)}
            documents={userDocuments || []}
            onDelete={(name: string) => onDelete(checklistItem.status, name)}
          />
        </TableCell>
      ) : null}
      {checklistItem.type === FieldType.TEXT ? (
        <TableCell className={classes.hidePrint}>
          <TextField
            variant="outlined"
            multiline
            rowsMax="2"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => saveInput({ ...event }, checklistItem.status)}
            defaultValue={inputValue || ''}
          />
        </TableCell>
      ) : null}
      {checklistItem.type === FieldType.BASIC ? <TableCell>&nbsp; </TableCell> : null}

      {isAdmin ? (
        <TableCell className={classes.hidePrint}>
          <DropZone
            onDrop={(files: []) => onFilesDrop(files, checklistItem.status, true)}
            documents={adminDocuments || []}
            onDelete={(name: string) => onDelete(checklistItem.status, name)}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
};
export default CheckList;
