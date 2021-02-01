import React from 'react';
import { Tooltip, TooltipProps } from '@material-ui/core';

const ConditionalTooltip: React.FC<Props> = ({ hide = false, children, ...other }) =>
  hide ? (
    <>{children}</>
  ) : (
    <Tooltip {...other}>
      <span>{children}</span>
    </Tooltip>
  );

interface Props extends TooltipProps {
  hide?: boolean;
}

export default ConditionalTooltip;
