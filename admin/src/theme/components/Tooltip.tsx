import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Tooltip: Components<Omit<Theme, 'components'>>['MuiTooltip'] = {
  defaultProps: {},
  styleOverrides: {
    arrow: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
    tooltip: ({ theme }) => ({
      backgroundColor: theme.palette.common.black,
    }),
  },
};

export default Tooltip;
