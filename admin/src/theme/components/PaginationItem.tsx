import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const PaginationItem: Components<Omit<Theme, 'components'>>['MuiPaginationItem'] = {
  defaultProps: {
    selected: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.primary.main,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
    }),
    previousNext: () => ({
      borderRadius: 0,
    }),
    page: () => ({
      borderRadius: 999,
    }),
  },
};

export default PaginationItem;
