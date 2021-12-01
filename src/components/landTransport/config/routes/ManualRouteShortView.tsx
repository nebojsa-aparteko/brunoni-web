import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  getPriceRangeText,
  ManualProviderRoute,
  ManualProviderRouteEntity,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import EditingInput from '../../../EditingInput';
import { flow, get, set } from 'lodash/fp';
import theme from '../../../../theme';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { EquipmentControlContainerTypes } from '../../../../model/EquipmentControl';
import { Currency } from '../../../../model/Payment';
import EditIcon from '@material-ui/icons/Edit';
import useModal from '../../../../hooks/useModal';
import ManualRouteDialog from './ManualRouteDialog';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';

interface Props {
  route: ManualProviderRouteEntity;
  provider: ProviderEntity;
  isAddMode?: boolean;
  addItem: (item: ManualProviderRoute) => Promise<any>;
  editItem: (id: string, item: ManualProviderRoute) => Promise<any>;
  onCancel?: () => void;
}

const ManualRouteShortView: React.FC<Props> = ({ route, isAddMode, onCancel, addItem, editItem, provider }) => {
  const [isEditing, setEditing] = useState(!!isAddMode);
  const [stateRoute, setStateRoute] = useState(route);
  const { openModal, closeModal, isOpen } = useModal();
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
    <>
      <Box
        display="flex"
        flexDirection="column"
        border={1}
        p={2}
        borderRadius={5}
        borderColor="primary"
        style={{ cursor: 'pointer' }}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          openModal();
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} style={{ gap: theme.spacing(2) }}>
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
              onChange={event => {
                const name = event.target.name;
                const checked = event.target.checked;
                setStateRoute(prevState => set(name, checked)(prevState));
              }}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          ) : (
            <FiberManualRecordIcon color={stateRoute.active ? 'secondary' : 'error'} />
          )}

          {isEditing ? (
            <Box display="flex">
              <IconButton
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  (isAddMode ? addItem(stateRoute) : editItem(route.id, stateRoute)).finally(() =>
                    isAddMode ? onCancel?.() : setEditing(false),
                  );
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  isAddMode ? onCancel?.() : setEditing(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box>
              <IconButton
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setEditing(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        <ManualRouteTablePricing
          route={stateRoute}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          isEditing={isEditing}
        />
      </Box>
      {isOpen && <ManualRouteDialog isOpen={isOpen} closeModal={closeModal} route={route} provider={provider} />}
    </>
  );
};

interface ManualRouteTablePricingProps {
  route: ManualProviderRouteEntity;
  isEditing: boolean;
  handleInputChange: (event: any) => void;
  handleSelectChange: (event: any) => void;
}

export const ManualRouteTablePricing: React.FC<ManualRouteTablePricingProps> = ({
  route: stateRoute,
  isEditing,
  handleInputChange,
  handleSelectChange,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Currency</TableCell>
            {Object.values(EquipmentControlContainerTypes).map(val => (
              <TableCell key={val}>{val}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              {isEditing ? (
                <Select
                  margin="dense"
                  variant="outlined"
                  value={get('currency')(stateRoute)}
                  name="currency"
                  onChange={handleSelectChange}
                >
                  {Object.keys(Currency).map(val => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography>{get('currency')(stateRoute)}</Typography>
              )}
            </TableCell>
            {Object.keys(EquipmentControlContainerTypes).map(key => (
              <TableCell key={key}>
                <EditingInput
                  editing={isEditing}
                  inputProps={{
                    variant: 'outlined',
                    name: `pricePerContainer.${key}.value`,
                    onChange: handleInputChange,
                    type: 'number',
                  }}
                  value={flow(get(key), get('value'))(stateRoute.pricePerContainer) || '-'}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManualRouteShortView;
