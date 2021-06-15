import React, { forwardRef, ForwardRefRenderFunction, useCallback, useImperativeHandle, useState } from 'react';
import { Menu, MenuItem } from '@material-ui/core';

const DropdownMenu: ForwardRefRenderFunction<any, Props> = ({ items }, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  useImperativeHandle(ref, () => ({
    openMenu(event: any) {
      setAnchorEl(event.currentTarget);
    },
  }));
  return (
    <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
      {items.map(item => (
        <MenuItem
          onClick={() => {
            item.onClick();
            handleClose();
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default forwardRef(DropdownMenu);

interface Props {
  items: MenuItemProps[];
}

interface MenuItemProps {
  onClick: () => void;
  label: string;
}
