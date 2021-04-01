import React, { forwardRef, ForwardRefRenderFunction, Fragment, useImperativeHandle, useRef, useState } from 'react';
import set from 'lodash/fp/set';
import unset from 'lodash/fp/unset';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import { Grid, makeStyles, TextField, Theme } from '@material-ui/core';
import InputProps from '../../model/InputProps';
import Container from '../../model/Container';
import ContainerTypeInput from './ContainerTypeInput';
import CommodityTypeInput from './CommodityTypeInput';
import QuantityInput from './QuantityInput';
import LocationInput from './LocationInput';
import ContainerType from '../../model/ContainerType';
import CommodityType from '../../model/CommodityType';
import PickupLocation from '../../model/PickupLocation';
import OptionalInput, { OptionalInputProps } from './OptionalInput';
import ListInput from './ListInput';
import IMOInput from './IMOInput';
import OOGInput from './OOGInput';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';
import ContainerDetails from '../../model/ContainerDetails';
import FormControl from '@material-ui/core/FormControl';
import DateInput from './DateInput';

interface Props extends InputProps<Container & ContainerDetails> {}

const useStyles = makeStyles((theme: Theme) => ({
  containerFormGroup: {
    backgroundColor: theme.palette.grey['100'],
    padding: theme.spacing(2),
  },
  inlineForm: {
    display: 'flex',
  },
}));

const OOGListInput = forwardRef((props: OptionalInputProps<OOG[]>, ref) => (
  <ListInput
    ref={ref}
    ItemInput={OOGInput}
    addText="Add container info"
    defaultItemValue={{ width: '', height: '', length: '', weight: '' }}
    {...props}
  />
));

const IMOListInput = forwardRef((props: OptionalInputProps<IMO[]>, ref) => (
  <ListInput
    ref={ref}
    ItemInput={IMOInput}
    addText="Add new IMO"
    defaultItemValue={{ IMOClass: '', UNNumber: '', PGNumber: '' }}
    {...props}
  />
));

const ContainerInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, ...rest }, ref) => {
  const classes = useStyles();
  const containerTypeInput = useRef();
  const commodityTypeInput = useRef();
  const locationInput = useRef();
  const [dateOpen, setDateOpen] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (!value.containerType) {
        (containerTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.commodityType) {
        (commodityTypeInput.current! as { focus: () => void }).focus();
      } else if (!value.pickupLocation) {
        try {
          (locationInput.current! as { focus: () => void }).focus();
        } catch (e) {
          // ignore, cannot focus the field that is not there
        }
      } else {
        (containerTypeInput.current! as { focus: () => void }).focus();
      }
    },
  }));

  const handleContainerTypeChange = (v: ContainerType | null) => {
    onChange(
      flow(
        set('containerType', v),
        (v || {}).couldBeOversize ? identity : set('oog', [false]),
        (v || {}).description?.endsWith('S.O.') ? unset('location') : identity,
      )(value) as Container & ContainerDetails,
    );
    (commodityTypeInput.current! as { focus: () => void }).focus();
  };

  const handleCommodityTypeChange = (v: CommodityType | null) => {
    onChange(set('commodityType', v)(value));
    if (locationInput.current) {
      (locationInput.current! as { focus: () => void }).focus();
    }
  };

  const handleLocationChange = (v: PickupLocation | null) => {
    onChange(set('pickupLocation', v)(value));
  };

  const handleQuantityChange = (v: number | null) => {
    onChange(set('quantity', v)(value));
  };

  const handleIMOChange = (v: [false] | [true, IMO[]]) => {
    onChange(set('imo', v)(value));
  };

  const handleOOGChange = (v: [false] | [true, OOG[]]) => {
    onChange(set('oog', v)(value));
  };

  const handlePickupDateChange = (v: Date | null) => {
    onChange(set('pickupDate', v)(value));
  };

  const handleWeightChange = (v: number | null) => {
    onChange(set('weight', v)(value));
  };

  const handleTemperatureChange = (v: number | null) => {
    onChange(set('temperature', v)(value));
  };

  const handleHumidityChange = (v: string | null) => {
    onChange(set('humidity', v)(value));
  };

  const handleVentilationChange = (v: string | null) => {
    onChange(set('ventilation', v)(value));
  };

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item md={3} xs={12}>
          <ContainerTypeInput
            ref={containerTypeInput}
            margin="dense"
            value={value.containerType!}
            onChange={handleContainerTypeChange}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <CommodityTypeInput
            ref={commodityTypeInput}
            margin="dense"
            value={value.commodityType!}
            onChange={handleCommodityTypeChange}
          />
        </Grid>
        {get('showLocations')(rest) && !value.containerType?.description?.endsWith('S.O.') && (
          <Grid item md={4} xs={12}>
            <LocationInput
              ref={locationInput}
              margin="dense"
              value={value.pickupLocation!}
              onChange={handleLocationChange}
            />
          </Grid>
        )}
        <Grid item md={2} xs={12}>
          <QuantityInput value={value.quantity} margin="dense" onChange={handleQuantityChange} />
        </Grid>
        {get('isDetailedInput')(rest) && (
          <>
            <Grid item md={2} xs={12}>
              <DateInput
                value={value.pickupDate || null}
                onChange={handlePickupDateChange}
                open={dateOpen}
                onOpen={() => setDateOpen(true)}
                onClose={() => setDateOpen(false)}
                label="Pickup Date"
                margin="dense"
                fullWidth
              />
            </Grid>
            <Grid item md={2} xs={12}>
              <TextField
                label="Weight (Kg)"
                type="number"
                margin="dense"
                variant="outlined"
                fullWidth
                value={value.weight}
                onChange={event => handleWeightChange(parseInt(event.target.value))}
              />
            </Grid>
            {(value.containerType?.id === '45R1' || value.containerType?.id === '22R1') && (
              <React.Fragment>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={value.temperature}
                    onChange={event => handleTemperatureChange(parseInt(event.target.value))}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Humidity (%)"
                    type="number"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={value.humidity}
                    onChange={event => handleHumidityChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Ventilation"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={value.ventilation}
                    onChange={event => handleVentilationChange(event.target.value)}
                  />
                </Grid>
              </React.Fragment>
            )}
          </>
        )}
      </Grid>
      <FormControl margin="dense" className={classes.inlineForm}>
        <OptionalInput
          label="This container contains IMO"
          ItemInput={IMOListInput}
          defaultItemValue={[]}
          value={
            value.imo && value.imo.length > 0 && typeof value.imo[0] !== 'boolean'
              ? value.imo
                ? value.imo.length > 0
                  ? [true, (value.imo as unknown) as IMO[]]
                  : [false]
                : [false]
              : value.imo || [false]
          }
          onChange={handleIMOChange}
        />
        {(value.containerType || {}).couldBeOversize && (
          <OptionalInput
            label="This container is out of gauge"
            ItemInput={OOGListInput}
            defaultItemValue={[]}
            value={
              value.oog && value.oog.length > 0 && typeof value.oog[0] !== 'boolean'
                ? value.oog
                  ? value.oog.length > 0
                    ? [true, (value.oog as unknown) as OOG[]]
                    : [false]
                  : [false]
                : value.oog || [false]
            }
            onChange={handleOOGChange}
          />
        )}
      </FormControl>
    </Fragment>
  );
};

export default forwardRef(ContainerInput);
