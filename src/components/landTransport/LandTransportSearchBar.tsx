import React, { useContext, useState } from 'react';
import { Box, createStyles, makeStyles } from '@material-ui/core';
import { ControlledDateInput } from '../inputs/DateInput';
import { ControlledLandLocationInput } from '../inputs/LandLocationInput';
import { ControlledCheckBox } from '../inputs/CheckBox';
import { LandTransportContext } from '../../providers/LandTransportProvider';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: '20px',
    },
    body: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& > *:not(:last-child)': {
        marginRight: theme.spacing(2),
      },
    },
  }),
);

const LandTransportSearchBar: React.FC = () => {
  const classes = useStyles();

  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [, , locations] = useContext(LandTransportContext);
  return (
    <Box className={classes.root}>
      <Box className={classes.body}>
        <ControlledLandLocationInput label={'From'} name={'from'} locations={locations} />
        <ControlledLandLocationInput label={'To'} name={'to'} locations={locations} />
        <ControlledDateInput
          name={'earliestDate'}
          open={dateOpen}
          onOpen={() => setDateOpen(true)}
          onClose={() => setDateOpen(false)}
        />
      </Box>
      <Box>
        <ControlledCheckBox label={'Show direct lines only'} name={'directLines'} />
      </Box>
    </Box>
  );
};

export default LandTransportSearchBar;
