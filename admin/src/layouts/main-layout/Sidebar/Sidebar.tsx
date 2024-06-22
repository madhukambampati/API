import { ReactElement } from 'react';
import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';

import IconifyIcon from 'components/base/IconifyIcon';
// import logo from 'assets/logo/apihub-icon.png';
import Image from 'components/base/Image';
import navItems from 'data/nav-items';
import NavButton from './NavButton';

const Sidebar = (): ReactElement => {
  return (
    <Stack
      justifyContent="space-between"
      bgcolor="background.paper"
      height={1}
      boxShadow={(theme) => theme.shadows[4]}
      sx={{
        overflow: 'hidden',
        margin: { xs: 0, lg: 3.75 },
        borderRadius: { xs: 0, lg: 5 },
        '&:hover': {
          overflowY: 'auto',
        },
        width: 218,
      }}
    >
      <Link
        href="/"
        sx={{
          position: 'fixed',
          zIndex: 5,
          mt: 1.25,
          mx: 4.0625,
          mb: 3.75,
          bgcolor: 'background.paper',
          borderRadius: 5,
        }}
      >
        <Image src='' width={1} />
      </Link>
      <Stack
        justifyContent="space-between"
        mt={16.25}
        height={1}
        sx={{
          overflow: 'hidden',
          '&:hover': {
            overflowY: 'auto',
          },
          width: 218,
        }}
      >
        <List
          sx={{
            mx: 2.5,
            py: 1.25,
            flex: '1 1 auto',
            width: 178,
          }}
        >
          {navItems.map((navItem, index) => (
            <NavButton key={index} navItem={navItem} Link={Link} />
          ))}
        </List>
        <List
          sx={{
            mx: 2.5,
          }}
        >
          <ListItem
            sx={{
              mx: 0,
              my: 2.5,
            }}
          >
            <ListItemButton
              LinkComponent={Link}
              href="/"
              sx={{
                backgroundColor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  opacity: 1.5,
                },
              }}
            >
              <ListItemIcon>
                <IconifyIcon icon="ri:logout-circle-line" />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};

export default Sidebar;
