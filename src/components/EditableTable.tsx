import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  lighten,
  makeStyles,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { get, omit, set } from 'lodash/fp';
import EditingInput from './EditingInput';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { SelectProps } from '@material-ui/core/Select/Select';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import CloseIcon from '@material-ui/icons/Close';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Paper from '@material-ui/core/Paper';
import palette from '../theme/palette';
import EmptyStatePanel from './EmptyStatePanel';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';

export type CellType =
  | {
      fieldType: 'select';
      label: string;
      fieldName: string;
      options: { key: string; label: string }[];
      selectProps?: SelectProps;
    }
  | {
      fieldType: 'autocomplete';
      label: string;
      fieldName: string;
      options: any[];
      autocompleteProps?: Omit<AutocompleteProps<any>, 'options' | 'renderInput'>;
      renderValue: (value: any) => string;
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
  viewOnly?: boolean;
  canAddMore?: boolean;
  tableTitle?: string;
  actionLabel?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateActionLabel?: string;
  emptyStateActionIcon?: any;
  emptyStateAction?: any;
}

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: palette.background.hover,
  },
  title: {
    flex: '1 1 100%',
  },
  button: {
    flexShrink: 0,
  },
}));

const EditableTable = <T extends { id: string }>({
  deleteItem,
  addItem,
  editItem,
  data,
  cells,
  defaultItem,
  canAddMore = true,
  tableTitle,
  actionLabel,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateActionLabel,
  emptyStateActionIcon,
  emptyStateAction,
  viewOnly = false,
  ...props
}: EditableTableProps<T>) => {
  const classes = useStyles();
  const [newRow, setNewRow] = useState(false);
  const hasData = data && data?.length !== 0;
  return (
    <Box display="flex" flexDirection="column">
      <TableContainer component={Paper}>
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.title} variant="h4" id="tableTitle" component="div">
            {tableTitle || ''}
          </Typography>

          {canAddMore && hasData && !viewOnly && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              className={classes.button}
              startIcon={<AddIcon />}
              onClick={() => {
                setNewRow(true);
              }}
              disabled={newRow}
            >
              {actionLabel || 'Add Row'}
            </Button>
          )}
        </Toolbar>

        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {cells.map(item => (
                <TableCell key={`cell-header-${item.label}`}>{item.label}</TableCell>
              ))}
              {!viewOnly && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {hasData &&
              data?.map(dataItem => (
                <EditableRow
                  key={dataItem.id}
                  item={dataItem}
                  addItem={addItem}
                  deleteItem={deleteItem}
                  editItem={editItem}
                  cells={cells}
                  canEdit={!viewOnly}
                  {...props}
                />
              ))}
            {!hasData && !newRow && (
              <TableRow>
                <TableCell colSpan={cells?.length + 1}>
                  <EmptyStatePanel
                    title={emptyStateTitle}
                    subtitle={emptyStateSubtitle}
                    actionLabel={actionLabel}
                    actionIcon={emptyStateActionIcon}
                    action={!viewOnly && (emptyStateAction || (() => setNewRow(true)))}
                  />
                </TableCell>
              </TableRow>
            )}
            {newRow && !viewOnly && (
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
  canEdit?: boolean;
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
  canEdit = true,
}) => {
  const [isEditing, setEditing] = useState(!!isAddMode && canEdit);
  const [stateItem, setStateItem] = useState(item);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key &&
      setStateItem((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
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
                  <MenuItem
                    key={val.key}
                    value={val.key}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    {val.label}
                  </MenuItem>
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
                  setStateItem((prevState: any) =>
                    set(event.target.name, event.target.checked)(prevState),
                  );
                }}
                onClick={event => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
              />
            ) : (
              <FiberManualRecordIcon color={stateItem.active ? 'secondary' : 'error'} />
            )
          ) : cell.fieldType === 'autocomplete' ? (
            isEditing ? (
              <Autocomplete
                id={`editable-autocomplete-${cell.fieldName}`}
                options={cell.options}
                value={get(cell.fieldName)(stateItem)}
                style={{ flex: 1 }}
                //@ts-ignore
                onChange={(event, value) =>
                  setStateItem((prevState: any) => set(cell.fieldName, value)(prevState))
                }
                renderInput={params => (
                  <TextField {...params} name={cell.fieldName} variant="outlined" margin="dense" />
                )}
                {...cell.autocompleteProps}
              />
            ) : (
              <Typography>{cell.renderValue(get(cell.fieldName)(stateItem))}</Typography>
            )
          ) : null}
        </TableCell>
      ))}
      {canEdit && (
        <TableCell style={{ flex: 1 }}>
          <Box my={-1.5}>
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
          </Box>
        </TableCell>
      )}
    </TableRow>
  );
};

const removeEntityFields = (item: any) => omit(['id', 'createdAt'])(item) as any;

export default EditableTable;
