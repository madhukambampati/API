import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Pagination: Components<Omit<Theme, 'components'>>['MuiPagination'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({}) => ({}),
    ul: ({ theme }) => ({
      display: 'flex',
      gap: theme.spacing(1.125),
    }),
  },
};

export default Pagination;
