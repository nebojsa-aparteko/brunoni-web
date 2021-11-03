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
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Collection,
  LandTransportFilter,
  LandTransportFilterContext,
} from '../../providers/LandTransportFilterProvider';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '25%',
  },
  form: {
    padding: theme.spacing(2),
  },
}));

const LandTransportFilterBar = () => {
  const [filters, setFilters] = useContext(LandTransportFilterContext);

  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Filter
        collection={filters.transfers}
        setCollection={setFilters}
        name={'transfers'}
        label={'Number of transfers'}
      />
      <Filter
        collection={filters.companies}
        setCollection={setFilters}
        name={'companies'}
        label={'Company'}
        limit={5}
      />
      <Filter
        collection={filters.transportModes}
        setCollection={setFilters}
        name={'transportModes'}
        label={'Transport Mode'}
        limit={2}
      />
      <Filter
        collection={filters.containerTypes}
        setCollection={setFilters}
        name={'containerTypes'}
        label={'Container Types'}
        limit={2}
      />
      <Filter
        collection={filters.equipmentGroupTypes}
        setCollection={setFilters}
        name={'equipmentGroupTypes'}
        label={'Equipment Group Types'}
        limit={2}
      />
    </Box>
  );
};

const Filter: React.FC<CompProps> = ({ collection, setCollection, name, label, limit = 3 }) => {
  const classes = useStyles();
  const [limited, setLimited] = useState(collection.length > limit);
  const allSelected = useMemo(() => collection.every(e => e.checked), [collection]);

  const handleSelect = (i: number, checked: boolean) => {
    const newSelected = collection.slice();
    newSelected[i] = { ...newSelected[i], checked };
    setCollection(prev => ({ ...prev, [name]: newSelected }));
  };

  const handleSelectAll = (allSelected: boolean) => {
    const newSelected = collection.map(v => Object.assign({}, v, { checked: allSelected }));
    setCollection(prev => ({ ...prev, [name]: newSelected }));
  };

  return (
    <Box className={classes.form}>
      <FormControl component="fieldset">
        <FormLabel component="legend">{label}</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                color={'primary'}
                checked={allSelected}
                onChange={(e, v) => handleSelectAll(v)}
                name="multiple"
              />
            }
            label={'Select all'}
          />
          {collection.slice(0, limited ? limit : collection.length).map((c, i) => (
            <FormControlLabel
              key={`${c}-${i}`}
              control={<Checkbox checked={c.checked} onChange={(e, v) => handleSelect(i, v)} name="single" />}
              label={c.name}
            />
          ))}
        </FormGroup>
        {limit < collection.length && (
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
  collection: Collection[];
  setCollection: React.Dispatch<React.SetStateAction<LandTransportFilter>>;
  name: string;
  label: string;
}

export default LandTransportFilterBar;
