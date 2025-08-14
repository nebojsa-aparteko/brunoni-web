import React, { ChangeEvent, HTMLAttributes, MutableRefObject, Ref } from 'react';
import { Autocomplete } from '@material-ui/lab';
import {
  CircularProgress,
  makeStyles,
  Paper,
  Popper,
  PopperProps,
  TextField,
  Theme,
} from '@material-ui/core';
import { OpportunityMatchDefinition } from '../../model/Opportunity';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';

interface Props {
  label: string;
  options: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  }[];
  value: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null;
  onChange: (
    group: {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityPlacesGroup | string;
    } | null,
  ) => void;
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

const OpportunityPlacesGroupInput: React.FC<Props> = ({
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
      onChange={(_, newValue) => onChange(newValue)}
      autoSelect
      autoHighlight
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      getOptionLabel={(option: {
        definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
        value: OpportunityPlacesGroup | string;
      }) => (typeof option.value === 'string' ? option.value : option.value.name + ' (Group)')}
      getOptionSelected={(option, value) => {
        if (typeof option.value === 'string' && typeof value?.value === 'string') {
          return option.value === value.value;
        }
        if (typeof option.value === 'object' && typeof value?.value === 'object') {
          return option.value.id === value.value.id;
        }
        return false;
      }}
      options={options}
      loading={loading}
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
        const name =
          typeof option.value === 'string' ? option.value : option.value.name + ' (Group)';
        const matches = match(name, inputValue);
        const parts = parse(name, matches);

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

export default OpportunityPlacesGroupInput;
