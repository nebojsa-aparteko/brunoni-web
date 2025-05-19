import React, { Fragment, useContext, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Theme, makeStyles, Tabs, Tab, Box, Button, CircularProgress } from '@material-ui/core';
import isEqual from 'lodash/fp/isEqual';
import Carriers from '../../contexts/Carriers';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import ListInput from '../inputs/ListInput';
import TableInput from '../inputs/TableInput';
import Carrier, { SideCharge } from '../../model/Carrier';
import firebase from '../../firebase';

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  button: {
    position: 'relative',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  progress: {
    position: 'absolute',
  },
}));

const emptySideCharge: SideCharge = { columns: ['', ''], rows: [] };

const SideCharges: React.FC<{ carrier: Carrier }> = ({ carrier }) => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [importCharges, setImportCharges] = useState<SideCharge[]>(
    carrier.sideCharges?.importCharges || [],
  );
  const [exportCharges, setExportCharges] = useState<SideCharge[]>(
    carrier.sideCharges?.exportCharges || [],
  );

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const save = async () => {
    setBusy(true);
    try {
      await firebase.firestore().collection('carriers').doc(carrier.id).update({
        sideCharges: {
          importCharges,
          exportCharges,
        },
      });
    } finally {
      setBusy(false);
    }
  };

  const importChargesModified = useMemo(
    () => !isEqual(carrier.sideCharges?.importCharges || [], importCharges),
    [carrier.sideCharges, importCharges],
  );

  const exportChargesModified = useMemo(
    () => !isEqual(carrier.sideCharges?.exportCharges || [], exportCharges),
    [carrier.sideCharges, exportCharges],
  );

  const hasChanges = importChargesModified || exportChargesModified;

  return (
    <Fragment>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        className={classes.tabs}
      >
        <Tab label="Import / Crosstrade" />
        <Tab label="Export" />
      </Tabs>
      <Box p={2}>
        {tab === 0 && (
          <ListInput
            key={0}
            ItemInput={TableInput}
            defaultItemValue={emptySideCharge}
            value={importCharges}
            onChange={setImportCharges}
          />
        )}
        {tab === 1 && (
          <ListInput
            key={1}
            ItemInput={TableInput}
            defaultItemValue={emptySideCharge}
            value={exportCharges}
            onChange={setExportCharges}
          />
        )}
        {hasChanges && (
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={save} className={classes.button}>
              <CircularProgress
                size={16}
                color="inherit"
                className={classes.progress}
                style={{ visibility: busy ? 'visible' : 'hidden' }}
              />
              <span style={{ visibility: busy ? 'hidden' : 'visible' }}>Save</span>
            </Button>
          </Box>
        )}
      </Box>
    </Fragment>
  );
};

const WaitFor =
  (Component: React.FC<{ carrier: Carrier }>) => (props: RouteComponentProps<{ id: string }>) => {
    const carrierId = props.match.params.id;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const carriers = useContext(Carriers);
    const carrier = carriers?.find(carrier => carrier.id === carrierId);

    return carrier ? <Component key={carrierId} carrier={carrier} /> : <ChartsCircularProgress />;
  };

export default WaitFor(SideCharges);
