import { Box, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

interface Props {
  IconComponent?: React.ComponentType<SvgIconProps>;
  title?: String | null;
  label1?: String;
  label1HTML?: any;
  label2?: String;
  gutterBottom?: boolean;
}

const InfoBoxItemHorizontal: React.FC<Props> = ({
  IconComponent,
  title,
  label1,
  label1HTML,
  label2,
  gutterBottom,
}) => {
  const hasLabel1 = label1 || label1HTML;
  return (
    <Fragment>
      <Typography variant="subtitle2" display="inline">
        <Box display="inline" alignItems="center" fontWeight="fontWeightBold">
          {IconComponent && <IconComponent fontSize="small" color="secondary" />}
          <Box display="inline" ml={IconComponent && '.5em'}>
            {title || ''}
          </Box>
        </Box>
      </Typography>
      <Box display="inline" ml=".5em">
        {hasLabel1 && (
          <Typography display="inline" variant="body1">
            {label1HTML ? <span dangerouslySetInnerHTML={label1HTML} /> : <span>{label1}</span>}
          </Typography>
        )}
        {label2 && (
          <Typography display="inline" variant="body2" gutterBottom={gutterBottom}>
            {label2}
          </Typography>
        )}
      </Box>
    </Fragment>
  );
};

export default InfoBoxItemHorizontal;
