import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as MaterialLink } from '@material-ui/core';
import { TypographyProps } from '@material-ui/core/Typography';

interface Props extends RouterLinkProps {
  TypographyClasses?: TypographyProps['classes'];
  underline?: 'none' | 'hover' | 'always';
}

const Link: React.FC<Props> = props => (
  <MaterialLink component={ReactRouterLink as React.ElementType} {...(props as any)} />
);

const ReactRouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => (
  <RouterLink innerRef={ref as any} {...props} />
));

export default Link;
