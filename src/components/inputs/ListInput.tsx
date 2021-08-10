import React, { useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
import { Box, Button, Paper, IconButton, makeStyles, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import InputProps from '../../model/InputProps';
import palette from '../../theme/palette';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface Props<T> {
  ref?: React.Ref<unknown>;
  listRef?: React.Ref<unknown>;
  addButtonRef?: React.Ref<unknown>;
  ItemInput: React.ComponentType<InputProps<T>>;
  ItemInputProps?: { [key: string]: any };
  addText?: string;
  defaultItemValue: T;
  value: T[];
  onChange: (value: T[]) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paper: {
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
  actionSection: {
    backgroundColor: theme.palette.grey['50'],
  },
}));

function ListInput<T>({
  listRef,
  addButtonRef,
  ItemInput,
  ItemInputProps,
  addText,
  defaultItemValue,
  value,
  onChange,
}: Props<T>) {
  const classes = useStyles();
  const refs = useRef<unknown[]>([]);

  useImperativeHandle(listRef, () => ({
    focus: (i: number) => {
      if (refs.current.length > i) {
        const ref = refs.current[i] as { focus?: () => void };
        if (ref.focus) {
          ref.focus();
        }
      }
    },
  }));

  const handleAdd = () => {
    onChange([...value, defaultItemValue]);
    setTimeout(() => {
      const ref = refs.current[refs.current.length - 1] as { focus: () => void };
      if (ref && ref.focus) {
        ref.focus();
      }
    });
  };

  const handleRemove = (i: number) => () => {
    const v = [...value];
    v.splice(i, 1);
    onChange(v);
  };

  return (
    <Box className={classes.root}>
      {value.map((item, i) => (
        <Paper key={i} className={classes.paper}>
          <Box display="flex">
            <Box flex="1" p={2}>
              <ItemInput
                ref={ref => (refs.current[i] = ref)}
                value={item}
                onChange={v => onChange(set(i, v)(value))}
                {...(ItemInputProps || {})}
              />
            </Box>
            <Box
              py={2}
              px={1}
              display="flex"
              alignContent="center"
              alignItems="center"
              className={classes.actionSection}
            >
              <IconButton onClick={handleRemove(i)} aria-label="delete" size="small">
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ))}
      <Box pt={value.length > 0 ? 1 : 0}>
        <Button buttonRef={addButtonRef} variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAdd}>
          {addText ? addText : 'Add'}
        </Button>
      </Box>
    </Box>
  );
}

interface ControlledProps<T>
  extends Omit<Props<any>, 'onChange' | 'value' | 'onBlur' | 'ItemInput' | 'defaultItemValue'> {
  name: string;
  ItemInput: React.ComponentType<T>;
}

export const ControlledListInput: React.FC<ControlledProps<any>> = ({ ItemInput, name, addText, ItemInputProps }) => {
  const classes = useStyles();

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  return (
    <Box className={classes.root}>
      {fields.map(({ id }, i) => (
        <Paper key={id} className={classes.paper}>
          <Box display="flex">
            <Box flex="1" p={2}>
              <ItemInput name={`${name}.${i}.${ItemInputProps?.['label']}`} {...ItemInputProps} />
            </Box>
            <Box
              py={2}
              px={1}
              display="flex"
              alignContent="center"
              alignItems="center"
              className={classes.actionSection}
            >
              <IconButton onClick={() => remove(i)} aria-label="delete" size="small">
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ))}
      <Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => append({})}>
          {addText ? addText : 'Add'}
        </Button>
      </Box>
    </Box>
  );
};

export default ListInput;
