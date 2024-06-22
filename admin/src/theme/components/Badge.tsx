import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Badge: Components<Omit<Theme, 'components'>>['MuiBadge'] = {
  defaultProps: {},
  styleOverrides: {
    badge: ({ theme }) => ({
      color: theme.palette.common.white,
      padding: 0,
    }),
  },
};

export default Badge;
