import React from 'react';
import { makeStyles, MenuItem, Select, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import PortTerm from '../../model/PortTerm';

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    maxWidth: '40em',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  menuItemPrimaryText: {
    fontWeight: 500,
  },
  menuItemSecondaryText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    marginLeft: theme.spacing(1),
  },
}));

const PortTermsInput: React.FC<Props> = ({ value, onChange, terms }) => {
  const classes = useStyles();

  return (
    <Select
      value={value?.id || ''}
      onChange={event => onChange(terms?.find(t => t.id === event.target.value)!)}
      style={{ flex: 1, height: 'fit-content' }}
      renderValue={value => `${value && terms?.find(term => term.id === value)?.port}`}
    >
      {terms.map(term => {
        const termNoHTML = term.address?.replace(/(<([^>]+)>)/gi, '');

        return (
          <MenuItem key={`term-${term.id}`} value={term.id} className={classes.menuItem}>
            <Typography className={classes.menuItemPrimaryText}>{term.port}</Typography>
            <Typography
              className={classes.menuItemSecondaryText}
              variant="body2"
              color="textSecondary"
              title={termNoHTML}
            >
              {termNoHTML}
            </Typography>
          </MenuItem>
        );
      })}
    </Select>
  );
};

interface Props {
  value?: PortTerm;
  onChange: (term: PortTerm) => void;
  terms: PortTerm[];
}

export default PortTermsInput;
