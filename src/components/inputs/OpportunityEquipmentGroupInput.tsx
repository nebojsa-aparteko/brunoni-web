// filepath: /Users/urosd/Documents/coding/brunoni/oskar-web/src/components/inputs/OpportunityEquipmentGroupInput.tsx
import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  CircularProgress,
  Chip,
  makeStyles,
  Paper,
  Popper,
  PopperProps,
  TextField,
  Theme,
} from '@material-ui/core';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';

interface Props {
  label: string;
  options: OpportunityEquipmentGroup[];
  value: OpportunityEquipmentGroup | null;
  onChange: (groups: OpportunityEquipmentGroup | null) => void;
  open?: boolean;
  onOpen?: (event: React.ChangeEvent<{}>) => void;
  onClose?: (event: React.ChangeEvent<{}>) => void;
  margin?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  input: {
    flexWrap: 'nowrap',
  },
}));

const OpportunityEquipmentGroupInput: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  open,
  onOpen,
  onClose,
  margin,
  ...rest
}) => {
  const classes = useStyles();
  const loading = open && !options;

  return (
    <Autocomplete
      {...rest}
      className={classes.root}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue as OpportunityEquipmentGroup | null)}
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionLabel={(option: OpportunityEquipmentGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      options={options}
      loading={loading}
      renderTags={(value: OpportunityEquipmentGroup[], getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option.name} size="small" {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          variant="outlined"
          margin={margin}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
            className: classes.input,
          }}
        />
      )}
      PopperComponent={Popup}
      PaperComponent={Papyrus}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

        return (
          <div>
            {parts.map((part: { highlight: boolean; text: string }, index: number) => (
              <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                {part.text}
              </span>
            ))}
          </div>
        );
      }}
    />
  );
};

const usePopupStyles = makeStyles((theme: Theme) => ({
  popper: {
    width: theme.breakpoints.values.md / 2,
    zIndex: 5000,
  },
}));

function Popup(props: PopperProps) {
  const { popperRef, anchorEl, open, children } = props;
  const classes = usePopupStyles();

  return (
    <Popper
      placement="bottom-start"
      popperRef={popperRef as Ref<any>}
      anchorEl={anchorEl}
      open={open}
      children={children}
      className={classes.popper}
    />
  );
}

const Papyrus: React.FC<HTMLAttributes<HTMLElement>> = ({ ...props }) => <Paper {...props} />;

export default OpportunityEquipmentGroupInput;
