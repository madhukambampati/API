import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { MouseEvent, ReactElement, useState } from 'react';

interface Language {
  id: number;
  value: string;
  label: string;
  icon: string;
}

const languages: Language[] = [
  {
    id: 0,
    value: 'eng',
    label: 'English',
    icon: 'twemoji:flag-united-kingdom',
  },
  {
    id: 1,
    value: 'fr',
    label: 'Française',
    icon: 'twemoji:flag-france',
  },
  {
    id: 2,
    value: 'ban',
    label: 'বাংলা',
    icon: 'twemoji:flag-bangladesh',
  },
  {
    id: 3,
    value: 'zho',
    label: '官话',
    icon: 'twemoji:flag-china',
  },
  {
    id: 4,
    value: 'hin',
    label: 'हिन्दी',
    icon: 'twemoji:flag-india',
  },
  {
    id: 5,
    value: 'ara',
    label: 'Arabic',
    icon: 'twemoji:flag-saudi-arabia',
  },
];

const LanguageDropdown = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const open = Boolean(anchorEl);

  const handleClickItem = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (id: number) => {
    setSelectedIndex(id);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        onClick={handleClickItem}
        id="language-menu"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          backgroundColor: 'inherit',
          borderRadius: 999,
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        <IconifyIcon icon={languages[selectedIndex].icon} width={24} height={24} />
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.id}
            selected={language.id === selectedIndex}
            onClick={() => handleMenuItemClick(language.id)}
          >
            <ListItemIcon>
              <IconifyIcon icon={language.icon} />
            </ListItemIcon>
            <ListItemText>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">{language.label}</Typography>
                <Typography variant="subtitle2">{language.value}</Typography>
              </Stack>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageDropdown;
