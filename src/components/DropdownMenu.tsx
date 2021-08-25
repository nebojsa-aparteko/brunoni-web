import React from 'react';
import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemIcon from '@material-ui/core/ListItemIcon';

export const DropDownMenuWithItems: React.FC<WithItemsProps> = ({
  items,
  toolTip = 'More',
  dropDownIcon = <MoreVertIcon />,
}) => {
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={toolTip} placement={'top'}>
        <IconButton size="small" aria-label="actions" onClick={onMoreButtonClick}>
          {dropDownIcon}
        </IconButton>
      </Tooltip>
      <Menu id="actions" anchorEl={moreAnchorEl} keepMounted open={Boolean(moreAnchorEl)} onClose={handleClose}>
        {items.map((item, i) => {
          return (
            <MenuItem onClick={item.onClick} key={i}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

interface WithItemsProps {
  items: MenuWithItemsProps[];
  dropDownIcon?: React.ReactNode;
  toolTip?: string;
}

interface MenuWithItemsProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}
