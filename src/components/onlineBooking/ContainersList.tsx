import { Box, Grid, SvgIcon } from '@material-ui/core';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import IMO from '../../model/IMO';
import OOG from '../../model/OOG';
import React from 'react';
import { ReactComponent as ContainerIconSVG } from '../../assets/container.svg';
import { ReactComponent as PackageIconSVG } from '../../assets/package.svg';
import DepotLocationIcon from '@material-ui/icons/LocalShipping';
import Typography from '@material-ui/core/Typography';

const ContainersList: React.FC<Props> = ({ containers }) => {
  return (
    <Grid container spacing={2}>
      {containers.map(container => (
        <Grid item md={4} key={container}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box mr={2}>
              <SvgIcon component={ContainerIconSVG} viewBox="0 0 512 512" />
            </Box>
            <Typography>{`${container.quantity} x ${container.containerType?.description}`}</Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Box mr={2}>
              <SvgIcon component={PackageIconSVG} viewBox="0 0 473.8 473.8" />
            </Box>
            <Typography variant="body2">{container.commodityType && `${container.commodityType?.name}`}</Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Box mr={2}>
              <DepotLocationIcon />
            </Box>
            <Typography variant="body2">
              {
                <>
                  {(container.pickupLocation ||
                    container.pickupDate ||
                    container.temperature ||
                    container.humidity ||
                    container.ventilation) &&
                    ` (`}
                  {container.pickupLocation &&
                    `${container.pickupLocation?.name}, ${container.pickupLocation?.city}, ${container.pickupLocation?.countryCode}`}
                  {container.pickupDate && ` - ${formatDateSafe(container.pickupDate as Date, DateFormats.LONG)}`}
                  {container.temperature &&
                    `, Temp: ${
                      parseFloat(container.temperature) > 0 ? '+' + container.temperature : container.temperature
                    } °C`}
                  {container.temperature && (container.humidity || container.ventilation) ? ', ' : null}
                  {container.humidity && `Humidity: ${container.humidity}%`}
                  {(container.temperature || container.humidity) && container.ventilation ? ', ' : null}
                  {container.ventilation && `Ventilation: ${container.ventilation}`}
                  {(container.pickupLocation ||
                    container.pickupDate ||
                    container.temperature ||
                    container.humidity ||
                    container.ventilation) &&
                    `)`}
                </>
              }
            </Typography>
          </Box>
          {container.containerNumbers && (
            <Typography variant="body2">{`Container numbers: ${container.containerNumbers?.join(', ')}`}</Typography>
          )}

          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {
                <>
                  {container.containerType &&
                    container.containerType?.description &&
                    container.containerType?.description.includes('S.O.') &&
                    'Container is shipper owned'}
                  {container.imo &&
                    container.imo?.[0] &&
                    container.imo?.[1]?.map(
                      (imoItem: IMO) =>
                        `(${'IMO Class: ' + imoItem.IMOClass} - ${'PG Number: ' + imoItem.PGNumber} - ${'UN Number: ' +
                          imoItem.UNNumber} )`,
                    )}
                  {container.oog &&
                    container.oog?.[0] &&
                    container.oog?.[1]?.map(
                      (oogItem: OOG) =>
                        `(${'Length: ' + oogItem.length} - ${'Width: ' + oogItem.width} - ${'Height: ' +
                          oogItem.height} - ${'Weight: ' + oogItem.weight})`,
                    )}
                </>
              }
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

interface Props {
  containers: any[];
}

export default ContainersList;
