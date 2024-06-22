import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Menu: Components<Omit<Theme, 'components'>>['MuiMenu'] = {
  defaultProps: {},
  styleOverrides: {
    paper: ({ theme }) => ({
      minWidth: theme.spacing(22.625),
      borderRadius: theme.shape.borderRadius * 2,
    }),
  },
};

export default Menu;
