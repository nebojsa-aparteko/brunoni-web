// @ts-nocheck - Temporary solution for React Router + Material-UI integration
import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { Button, IconButton, MenuItem } from '@material-ui/core';

// Create a forwardRef wrapper around RouterLink that works with Material-UI
const RouterLinkBehavior = React.forwardRef<HTMLAnchorElement, any>((props, ref) => {
  return <RouterLink ref={ref} {...props} />;
});

RouterLinkBehavior.displayName = 'RouterLinkBehavior';

// Export both as a component and for use in Material-UI components
export const Link = RouterLinkBehavior;

// Create Material-UI components with RouterLink integration
export const ButtonLink = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
  const { to, children, ...other } = props;
  return (
    <Button component={RouterLinkBehavior} to={to} ref={ref} {...other}>
      {children}
    </Button>
  );
});

export const IconButtonLink = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
  const { to, children, ...other } = props;
  return (
    <IconButton component={RouterLinkBehavior} to={to} ref={ref} {...other}>
      {children}
    </IconButton>
  );
});

export const MenuItemLink = React.forwardRef<HTMLLIElement, any>((props, ref) => {
  const { to, children, ...other } = props;
  return (
    <MenuItem component={RouterLinkBehavior} to={to} ref={ref} {...other}>
      {children}
    </MenuItem>
  );
});

ButtonLink.displayName = 'ButtonLink';
IconButtonLink.displayName = 'IconButtonLink';
MenuItemLink.displayName = 'MenuItemLink';

export const RouterLinkComponent = RouterLinkBehavior;
export default Link;
