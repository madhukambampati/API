import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const ListItemButton: Components<Omit<Theme, 'components'>>['MuiListItemButton'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 2,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.25),
      paddingLeft: theme.spacing(1.25),
      paddingRight: theme.spacing(1.25),
      width: '100%',
    }),
  },
};

export default ListItemButton;
