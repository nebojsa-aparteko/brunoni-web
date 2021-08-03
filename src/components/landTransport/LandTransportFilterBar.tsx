import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  makeStyles,
  Theme,
} from '@material-ui/core';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '25%',
  },
  form: {
    padding: theme.spacing(2),
  },
}));

const LandTransportFilterBar = () => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Filter collection={transfers} label={'Number of transfers'} />
      <Filter collection={companies} limit={5} label={'Company'} />
    </Box>
  );
};

const transfers = ['Show direct lines only', '1 Transfer', '2+ Transfers'];

const companies = [
  'Contargo',
  'Swissterminal AG',
  'Maritime transport Ltd.',
  'IBA logistics Group',
  'Distrifresh B.V',
  'Company 1',
  'Company 2',
  'Company 3',
];

const Filter: React.FC<CompProps> = ({ limit, collection, label }) => {
  const classes = useStyles();
  const [limited, setLimited] = useState(!!limit);

  return (
    <Box className={classes.form}>
      <FormControl component="fieldset">
        <FormLabel component="legend">{label}</FormLabel>
        <FormGroup>
          {collection.slice(0, limited ? limit : companies.length).map((c, i) => (
            <FormControlLabel
              key={`${c}-${i}`}
              control={<Checkbox checked={true} onChange={(e, v) => console.log(v)} name="multiple" />}
              label={c}
            />
          ))}
        </FormGroup>
        {limit && (
          <>
            {limited ? (
              <Button onClick={() => setLimited(false)} variant={'text'}>
                Show more
              </Button>
            ) : (
              <Button onClick={() => setLimited(true)} variant={'text'}>
                Show less
              </Button>
            )}
          </>
        )}
      </FormControl>
    </Box>
  );
};

interface CompProps {
  limit?: number;
  collection: any[];
  label: string;
}

export default LandTransportFilterBar;
