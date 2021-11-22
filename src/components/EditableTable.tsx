import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { get, omit, set } from 'lodash/fp';
import theme from '../theme';
import EditingInput from './EditingInput';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { SelectProps } from '@material-ui/core/Select/Select';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import CloseIcon from '@material-ui/icons/Close';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

export type CellType =
  | {
      fieldType: 'select';
      label: string;
      fieldName: string;
      options: { key: string; label: string }[];
      selectProps?: SelectProps;
    }
  | {
      label: string;
      fieldName: string;
      fieldType: 'input';
      inputProps?: TextFieldProps;
      renderValue?: (value: any) => string;
    }
  | { label: string; fieldName: string; fieldType: 'date'; renderDate: (date: Date) => string }
  | { label: string; fieldName: string; fieldType: 'switch' };

interface EditableTableProps<T> {
  cells: CellType[];
  data?: T[];
  defaultItem: T;
  addItem: (item: T) => Promise<any>;
  onRowClick?: (item: T) => void;
  editItem: (id: string, item: T) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  canAddMore?: boolean;
}
const EditableTable = <T extends { id: string }>({
  deleteItem,
  addItem,
  editItem,
  data,
  cells,
  defaultItem,
  canAddMore = true,
  ...props
}: EditableTableProps<T>) => {
  const [newRow, setNewRow] = useState(false);

  return (
    <Box my={2} display="flex" flexDirection="column">
      {canAddMore && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewRow(true);
          }}
          style={{ alignSelf: 'flex-end', marginBottom: theme.spacing(2) }}
          disabled={newRow}
        >
          Add row
        </Button>
      )}
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {cells.map(item => (
                <TableCell key={`cell-header-${item.label}`}>{item.label}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map(dataItem => (
              <EditableRow
                key={dataItem.id}
                item={dataItem}
                addItem={addItem}
                deleteItem={deleteItem}
                editItem={editItem}
                cells={cells}
                {...props}
              />
            ))}
            {newRow && (
              <EditableRow
                item={defaultItem}
                isAddMode
                addItem={item => addItem(item).then(() => setNewRow(false))}
                deleteItem={deleteItem}
                editItem={editItem}
                cells={cells}
                onCancel={() => setNewRow(false)}
                {...props}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

interface EditableRowProps {
  cells: CellType[];
  item: any;
  addItem: (item: any) => Promise<any>;
  editItem: (id: string, item: any) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  isAddMode?: boolean;
  onRowClick?: (item: any) => void;
  onCancel?: () => void;
}

const EditableRow: React.FC<EditableRowProps> = ({
  item,
  isAddMode,
  addItem,
  editItem,
  deleteItem,
  cells,
  onCancel,
  onRowClick,
}) => {
  const [isEditing, setEditing] = useState(!!isAddMode);
  const [stateItem, setStateItem] = useState(item);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setStateItem((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target?.name;
    const value = event.target?.value;
    if (name && value) {
      setStateItem((prevState: any) => set(name, value)(prevState));
    }
  };
  return (
    <TableRow
      style={{ cursor: onRowClick ? 'pointer' : 'initial' }}
      onClick={() => !isAddMode && !isEditing && onRowClick?.(item)}
    >
      {cells.map(cell => (
        <TableCell style={{ flex: 1 }} key={`editable-row-${cell.fieldName}`}>
          {cell.fieldType === 'input' ? (
            <EditingInput
              noDefaultLabel
              editing={isEditing}
              inputProps={{
                variant: 'outlined',
                name: cell.fieldName,
                onChange: handleInputChange,
                onClick: event => {
                  event.preventDefault();
                  event.stopPropagation();
                },
                ...(cell.inputProps || {}),
              }}
              renderValue={cell.renderValue}
              value={get(cell.fieldName)(stateItem)}
            />
          ) : cell.fieldType === 'select' ? (
            isEditing ? (
              <Select
                margin="dense"
                variant="outlined"
                value={get(cell.fieldName)(stateItem)}
                name={cell.fieldName}
                onChange={handleSelectChange}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                {...cell.selectProps}
              >
                {cell.options.map(val => (
                  <MenuItem value={val.key}>{val.label}</MenuItem>
                ))}
              </Select>
            ) : (
              <Typography>{get(cell.fieldName)(stateItem)}</Typography>
            )
          ) : cell.fieldType === 'date' ? (
            <Typography>{cell.renderDate(get(cell.fieldName)(stateItem))}</Typography>
          ) : cell.fieldType === 'switch' ? (
            isEditing ? (
              <Switch
                name="active"
                checked={get('active')(stateItem)}
                onChange={event => {
                  setStateItem((prevState: any) => set(event.target.name, event.target.checked)(prevState));
                }}
                onClick={event => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
              />
            ) : (
              <FiberManualRecordIcon color={stateItem.active ? 'secondary' : 'error'} />
            )
          ) : null}
        </TableCell>
      ))}
      <TableCell style={{ flex: 1 }}>
        {isEditing ? (
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              isAddMode
                ? addItem(removeEntityFields(stateItem))
                : editItem(item.id, stateItem).then(() => setEditing(false));
            }}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
          >
            <EditIcon />
          </IconButton>
        )}
        {isEditing ? (
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              isAddMode ? onCancel?.() : setEditing(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              deleteItem(item.id).finally(() => {
                console.log('Test');
                console.log();
              });
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

const removeEntityFields = (item: any) => omit(['id', 'createdAt'])(item) as any;

export default EditableTable;
