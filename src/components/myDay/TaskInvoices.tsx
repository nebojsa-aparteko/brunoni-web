import React from 'react';
import { Box, Button, IconButton, Popover, Typography } from '@material-ui/core';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { useSnackbar } from 'notistack';

const TaskInvoices: React.FC<{ invoices: string[] }> = ({ invoices }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'simple-popover' : undefined;
  const { enqueueSnackbar } = useSnackbar();

  const getFirstElements = (invoices: string[]) => {
    const firstFive = invoices.slice(0, 9);
    return <Typography>{firstFive.join(', ')}</Typography>;
  };

  const handlePopoverClose = (event: any) => {
    setAnchorEl(null);
    event.stopPropagation();
  };

  const copyInvoicesToClipboard = (event: any) => {
    let dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = invoices.join(',\n');
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    enqueueSnackbar(<Typography color="inherit">Copied invoices to clipboard!</Typography>, {
      variant: 'default',
      autoHideDuration: 1000,
    });
    event.stopPropagation();
  };

  const handleShowPopover = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClick = (event: any) => {
    event.stopPropagation();
  };

  return (
    <React.Fragment>
      <Box display="flex" padding={1} justifyContent="center" alignItems="center">
        {getFirstElements(invoices)}
      </Box>
      {invoices.length > 9 && (
        <Button size="small" onClick={event => handleShowPopover(event)}>
          Show all
        </Button>
      )}

      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClick={handlePopoverClick}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box
          display="flex"
          maxWidth="400px"
          padding={2}
          justifyContent="center"
          alignItems="center"
          textAlign={'center'}
        >
          <Typography>{invoices.join(', ')}</Typography>
          <IconButton size="small" aria-label="Copy all" onClick={copyInvoicesToClipboard}>
            <AssignmentIcon />
          </IconButton>
        </Box>
      </Popover>
    </React.Fragment>
  );
};

export default TaskInvoices;
