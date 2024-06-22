import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Collapse: Components<Omit<Theme, 'components'>>['MuiCollapse'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      width: '100%',
      borderRadius: theme.shape.borderRadius * 2,
    }),
  },
};

export default Collapse;
