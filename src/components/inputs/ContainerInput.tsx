import React, {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import set from 'lodash/fp/set';
import unset from 'lodash/fp/unset';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import { Grid, IconButton, makeStyles, TextField, Theme } from '@material-ui/core';
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
import ActingAs from '../../contexts/ActingAs';
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';

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

const defaultIMOItem: IMO = {
  IMOClass: '',
  UNNumber: '',
  PGNumber: '',
};

const defaultOOGItem: OOG = {
  width: '',
  height: '',
  length: '',
  weight: '',
};

const ContainerInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, ...rest }, ref) => {
  const classes = useStyles();
  const containerTypeInput = useRef();
  const commodityTypeInput = useRef();
  const locationInput = useRef();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [linkedReferences, setLinkedReferences] = useState<boolean>(true);
  const [container, setContainer] = useState<Container & ContainerDetails>(value);

  useEffect(() => {
    setContainer(value);
  }, [value]);

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
      )(container) as Container & ContainerDetails,
    );
    (commodityTypeInput.current! as { focus: () => void }).focus();
  };

  const handleCommodityTypeChange = (v: CommodityType | null) => {
    onChange(set('commodityType', v)(container));
    if (locationInput.current) {
      (locationInput.current! as { focus: () => void }).focus();
    }
  };

  const handleLocationChange = (v: PickupLocation | null) => {
    onChange(set('pickupLocation', v)(container));
  };

  const handleQuantityChange = (v: number | null) => {
    onChange(set('quantity', v)(container));
  };

  const handleIMOChange = (v: [false] | [true, IMO[]]) => {
    onChange(set('imo', v[0] ? v : undefined)(container));
  };

  const handleOOGChange = (v: [false] | [true, OOG[]]) => {
    onChange(set('oog', v[0] ? v : undefined)(container));
  };

  const handlePickupDateChange = (v: Date | null) => {
    onChange(set('pickupDate', v)(container));
  };

  const handleWeightTextChange = (v: number | null) => {
    setContainer(set('weight', v)(container));
  };

  const handleWeightChange = (v: number | null) => {
    onChange(set('weight', v)(container));
  };

  const handleTemperatureChange = (v: number | null) => {
    onChange(set('temperature', v)(container));
  };

  const handleHumidityChange = (v: string | null) => {
    onChange(set('humidity', v)(container));
  };

  const handleVentilationChange = (v: string | null) => {
    onChange(set('ventilation', v)(container));
  };

  const handlePickupReferenceTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: v, deliveryReference: v, vgmPin: v }
      : { ...container, pickupReference: v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handlePickupReferenceChange = (v: string | null) => {
    if (v !== container.pickupReference) {
      const newValue = (linkedReferences
        ? {
            ...container,
            pickupReference: v,
            deliveryReference: v,
            vgmPin: v,
          }
        : { ...container, pickupReference: v }) as Container & ContainerDetails;
      onChange(newValue);
    }
  };

  const handleDeliveryReferenceTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: v, deliveryReference: v, vgmPin: v }
      : { ...container, deliveryReference: v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handleDeliveryReferenceChange = (v: string | null) => {
    if (v !== container.deliveryReference) {
      const newValue = (linkedReferences
        ? {
            ...container,
            pickupReference: v,
            deliveryReference: v,
            vgmPin: v,
          }
        : { ...container, deliveryReference: v }) as Container & ContainerDetails;
      onChange(newValue);
    }
  };

  const handleVGMPinTextChange = (v: string | null) => {
    const newValue = (linkedReferences
      ? { ...container, pickupReference: v, deliveryReference: v, vgmPin: v }
      : { ...container, vgmPin: v }) as Container & ContainerDetails;
    setContainer(newValue);
  };

  const handleVGMPinChange = (v: string | null) => {
    if (v !== container.vgmPin) {
      const newValue = (linkedReferences
        ? {
            ...container,
            pickupReference: v,
            deliveryReference: v,
            vgmPin: v,
          }
        : { ...container, vgmPin: v }) as Container & ContainerDetails;
      onChange(newValue);
    }
  };

  return (
    <Fragment>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <ContainerTypeInput
            ref={containerTypeInput}
            margin="dense"
            value={container.containerType!}
            onChange={handleContainerTypeChange}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <CommodityTypeInput
            ref={commodityTypeInput}
            margin="dense"
            value={container.commodityType!}
            onChange={handleCommodityTypeChange}
          />
        </Grid>
        {get('showLocations')(rest) && !value.containerType?.description?.endsWith('S.O.') && (
          <Grid item md={4} xs={12}>
            <LocationInput
              ref={locationInput}
              margin="dense"
              value={container.pickupLocation!}
              onChange={handleLocationChange}
            />
          </Grid>
        )}
        <Grid item md={2} xs={12}>
          <QuantityInput value={container.quantity} margin="dense" onChange={handleQuantityChange} />
        </Grid>
        {get('isDetailedInput')(rest) && (
          <>
            <Grid item md={2} xs={12}>
              <DateInput
                value={container.pickupDate || null}
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
                value={container.weight}
                onChange={event => handleWeightTextChange(parseInt(event.target.value))}
                onBlur={event => handleWeightChange(parseInt(event.target.value))}
              />
            </Grid>
            {(container.containerType?.id === '45R1' || container.containerType?.id === '22R1') && (
              <React.Fragment>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.temperature}
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
                    value={container.humidity}
                    onChange={event => handleHumidityChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    label="Ventilation"
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.ventilation}
                    onChange={event => handleVentilationChange(event.target.value)}
                  />
                </Grid>
              </React.Fragment>
            )}
            {isAdmin && (
              <React.Fragment>
                <Grid item md={3} xs={12}>
                  <TextField
                    label={linkedReferences ? 'Pickup Reference (Linked)' : 'Pickup Reference'}
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.pickupReference || ''}
                    onChange={event => handlePickupReferenceTextChange(event.target.value)}
                    onBlur={event => handlePickupReferenceChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    label={linkedReferences ? 'Delivery Reference (Linked)' : 'Delivery Reference'}
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.deliveryReference || ''}
                    onChange={event => handleDeliveryReferenceTextChange(event.target.value)}
                    onBlur={event => handleDeliveryReferenceChange(event.target.value)}
                  />
                </Grid>
                <Grid item md={2} xs={12} style={{ display: 'flex' }}>
                  <TextField
                    label={linkedReferences ? 'VGM Pin (Linked)' : 'VGM Pin'}
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    value={container.vgmPin || ''}
                    onChange={event => handleVGMPinTextChange(event.target.value)}
                    onBlur={event => handleVGMPinChange(event.target.value)}
                  />
                  <IconButton onClick={() => setLinkedReferences(prevState => !prevState)} size="small">
                    {linkedReferences ? <LinkOffIcon /> : <LinkIcon />}
                  </IconButton>
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
          defaultItemValue={[defaultIMOItem]}
          value={
            container.imo && container.imo.length > 0 && typeof container.imo[0] !== 'boolean'
              ? container.imo
                ? container.imo.length > 0
                  ? [true, (container.imo as unknown) as IMO[]]
                  : [false]
                : [false]
              : container.imo || [false]
          }
          onChange={handleIMOChange}
        />
        {(container.containerType || {}).couldBeOversize && (
          <OptionalInput
            label="This container is out of gauge"
            ItemInput={OOGListInput}
            defaultItemValue={[defaultOOGItem]}
            value={
              container.oog && container.oog.length > 0 && typeof container.oog[0] !== 'boolean'
                ? container.oog
                  ? container.oog.length > 0
                    ? [true, (container.oog as unknown) as OOG[]]
                    : [false]
                  : [false]
                : container.oog || [false]
            }
            onChange={handleOOGChange}
          />
        )}
      </FormControl>
    </Fragment>
  );
};

export default forwardRef(ContainerInput);
