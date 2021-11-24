import React, { ChangeEvent, useState } from 'react';
import { AppBar, Box, Dialog, IconButton, Slide, Switch, Toolbar, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';
import {
  getPriceRangeText,
  ManualProviderRouteEntity,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import ExtensionTables from '../ExtensionTables';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import EditingInput from '../../../EditingInput';
import { get, set } from 'lodash/fp';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import { theme } from '../../../../theme';
import Container from '../../../Container';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  route: ManualProviderRouteEntity;
  provider: ProviderEntity;
}

const ManualRouteDialog: React.FC<Props> = ({ closeModal, isOpen, route, provider }) => {
  const classes = useStyles();
  const [isEditing, setEditing] = useState(false);
  const [stateRoute, setStateRoute] = useState(route);
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setStateRoute((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target?.name;
    const value = event.target?.value;
    if (name && value) {
      setStateRoute(prevState => set(name, value)(prevState));
    }
  };
  return (
    <Dialog open={isOpen} fullScreen onClose={closeModal} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography variant="h4" className={classes.title}>
            {provider.name} - Manual route
          </Typography>
          <IconButton edge="start" color="inherit" onClick={closeModal} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex">
            <Box display="flex" alignItems="center">
              <FiberManualRecordIcon color={stateRoute.active ? 'secondary' : 'error'} />
              Active route
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            style={{ gap: theme.spacing(2) }}
          >
            <EditingInput
              editing={isEditing}
              inputProps={{
                variant: 'outlined',
                label: 'Origin',
                name: 'origin',
                onChange: handleInputChange,
              }}
              typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              value={get('origin')(stateRoute)}
            />
            <EditingInput
              editing={isEditing}
              inputProps={{
                variant: 'outlined',
                label: 'Destination',
                name: 'destination',
                onChange: handleInputChange,
              }}
              typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              value={get('destination')(stateRoute)}
            />
            <EditingInput
              editing={isEditing}
              inputProps={{
                variant: 'outlined',
                label: 'Transport mode',
                name: 'transportMode',
                onChange: handleInputChange,
              }}
              typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              value={get('transportMode')(stateRoute)}
            />

            <Typography
              variant="h5"
              style={{ whiteSpace: 'nowrap', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {getPriceRangeText(route.priceRange)}
            </Typography>
            {isEditing ? (
              <Switch
                name="active"
                checked={get('active')(stateRoute)}
                onChange={event => setStateRoute(prevState => set(event.target.name, event.target.checked)(prevState))}
              />
            ) : (
              <FiberManualRecordIcon color={stateRoute.active ? 'secondary' : 'error'} />
            )}

            {isEditing ? (
              <Box display="flex">
                <IconButton onClick={() => {}}>
                  <CheckIcon />
                </IconButton>
                <IconButton onClick={() => {}}>
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <IconButton onClick={() => setEditing(true)}>
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Box>
          <ExtensionTables providerId={provider.id} />
        </Box>
      </Container>
    </Dialog>
  );
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default ManualRouteDialog;
