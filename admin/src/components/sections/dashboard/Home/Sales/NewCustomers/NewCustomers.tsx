import { ReactElement, useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';

import IconifyIcon from 'components/base/IconifyIcon';
import { customerList } from 'data/customers-list';
import CustomerItem from './CustomerItem';

const NewCustomers = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.target);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        flex: '1 1 auto',
        width: { xs: 'auto', sm: 0.5, lg: 'auto' },
        boxShadow: (theme) => theme.shadows[4],
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2.5}>
        <Typography variant="subtitle1" color="text.primary">
          New Customers
        </Typography>
        <IconButton
          id="new-customers-button"
          aria-controls={open ? 'new-customers-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            bgcolor: open ? 'action.active' : 'transparent',
            padding: 1,
            width: 36,
            height: 36,
            '&:hover': {
              bgcolor: 'action.active',
            },
          }}
        >
          <IconifyIcon icon="ph:dots-three-outline-fill" color="text.secondary" />
        </IconButton>
        <Menu
          id="new-customers-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'new-customers-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Week
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Month
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Typography variant="body1" component="p">
              Last Year
            </Typography>
          </MenuItem>
        </Menu>
      </Stack>
      <Stack pb={1.25}>
        {customerList.map((customer) => (
          <CustomerItem
            key={customer.id}
            name={customer.name}
            country={customer.country}
            avatar={customer.avatar}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default NewCustomers;
