import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
import { Currency } from '../model/Payment';
import EditingInput from './EditingInput';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { SelectProps } from '@material-ui/core/Select/Select';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';

type CellType =
  | {
      fieldType: 'select';
      label: string;
      fieldName: string;
      options: { key: string; label: string }[];
      selectProps?: SelectProps;
    }
  | { label: string; fieldName: string; fieldType: 'input'; inputProps?: TextFieldProps };

interface EditableTableProps<T> {
  cells: CellType[];
  data: T[];
  defaultItem: T;
  addItem: (item: T) => Promise<any>;
  editItem: (id: string, item: T) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
}
const EditableTable = <T extends { id: string }>({
  deleteItem,
  addItem,
  editItem,
  data,
  cells,
  defaultItem,
  ...props
}: EditableTableProps<T>) => {
  const [newRow, setNewRow] = useState(false);

  return (
    <Box my={2} display="flex" flexDirection="column">
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
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {cells.map(item => (
                <TableCell>{item.label}</TableCell>
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
                addItem={item => addItem(item).finally(() => setNewRow(false))}
                deleteItem={deleteItem}
                editItem={editItem}
                cells={cells}
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
}

const EditableRow: React.FC<EditableRowProps> = ({ item, isAddMode, addItem, editItem, deleteItem, cells }) => {
  const [isEditing, setEditing] = useState(!!isAddMode);
  const [stateItem, setStateItem] = useState(item);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setStateItem((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    event.target?.name &&
      setStateItem((prevState: any) => ({
        ...prevState,
        price: { ...prevState.price, currency: event.target.value as Currency },
      }));
  };
  return (
    <TableRow>
      {cells.map(cell => (
        <TableCell>
          {cell.fieldType === 'input' ? (
            <EditingInput
              editing={isEditing}
              inputProps={{
                variant: 'outlined',
                label: cell.label,
                name: cell.fieldName,
                onChange: handleInputChange,
                ...(cell.inputProps || {}),
              }}
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
                {...cell.selectProps}
              >
                {cell.options.map(val => (
                  <MenuItem value={val.key}>{val.label}</MenuItem>
                ))}
              </Select>
            ) : (
              <Typography>{get(cell.fieldName)(stateItem)}</Typography>
            )
          ) : null}
        </TableCell>
      ))}
      <TableCell>
        {isEditing ? (
          <IconButton
            onClick={() => {
              (isAddMode ? addItem(removeEntityFields(stateItem)) : editItem(item.id, stateItem)).finally(() =>
                setEditing(false),
              );
            }}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton
          onClick={() => {
            deleteItem(item.id).finally(() => {
              console.log('Test');
              console.log();
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const removeEntityFields = (item: any) => omit(['id', 'createdAt'])(item) as any;

export default EditableTable;
