import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Grid2: Components<Omit<Theme, 'components'>>['MuiGrid2'] = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      marginRight: 0,
    }),
  },
};

export default Grid2;
