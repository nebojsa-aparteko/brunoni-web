import React, { ChangeEvent, useState } from 'react';
import { AppBar, Box, Button, Dialog, IconButton, Slide, TextField, Toolbar, Typography } from '@material-ui/core';
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
import EditIcon from '@material-ui/icons/Edit';
import { theme } from '../../../../theme';
import Container from '../../../Container';
import DeleteIcon from '@material-ui/icons/Delete';
import { TableRowData } from '../../../bookingRequests/BookingRequestSummary';
import SectionWithTitle from '../../../SectionWithTitle';
import { ManualRouteTablePricing } from './ManualRouteShortView';

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
        <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(2) }}>
          <Box display="flex" justifyContent="space-between" my={2}>
            <Box display="flex" alignItems="center">
              <FiberManualRecordIcon color={stateRoute.active ? 'secondary' : 'error'} />
              <Typography> Active route</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <IconButton>
                <EditIcon />
              </IconButton>
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Button variant="outlined" color="primary" style={{ alignSelf: 'center' }}>
            Valid from 01.01.2022. - 31.01.2022.
          </Button>
          <SectionWithTitle title="General info">
            <Box display="flex">
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="flex-start"
                flex={1}
              >
                <TableRowData
                  label={'Origin'}
                  content={
                    <EditingInput
                      editing={isEditing}
                      inputProps={{
                        variant: 'outlined',
                        label: 'Origin',
                        name: 'origin',
                        onChange: handleInputChange,
                      }}
                      typographyProps={{
                        style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                      value={get('origin')(stateRoute)}
                    />
                  }
                />

                <TableRowData
                  label={'Destination'}
                  content={
                    <EditingInput
                      editing={isEditing}
                      inputProps={{
                        variant: 'outlined',
                        name: 'destination',
                        onChange: handleInputChange,
                      }}
                      typographyProps={{
                        style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                      value={get('destination')(stateRoute)}
                    />
                  }
                />
                <TableRowData
                  label={'Transport Mode'}
                  content={
                    <EditingInput
                      editing={isEditing}
                      inputProps={{
                        variant: 'outlined',
                        name: 'transportMode',
                        onChange: handleInputChange,
                      }}
                      typographyProps={{
                        style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                      value={get('transportMode')(stateRoute)}
                    />
                  }
                />
              </Box>
              <Typography variant="h4">{getPriceRangeText(stateRoute.priceRange)}</Typography>
            </Box>
            <ManualRouteTablePricing
              route={stateRoute}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              isEditing={isEditing}
            />
          </SectionWithTitle>
          <SectionWithTitle title="Description">
            <TextField variant="outlined" placeholder="Write some description here..." multiline rows={6} rowsMax={8} />
          </SectionWithTitle>
          <SectionWithTitle title="Extensions">
            <ExtensionTables providerId={provider.id} />
          </SectionWithTitle>
        </Box>
      </Container>
    </Dialog>
  );
};

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default ManualRouteDialog;
