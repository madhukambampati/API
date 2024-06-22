import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const TablePagination: Components<Omit<Theme, 'components'>>['MuiTablePagination'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      width: '100%',
      ':last-child': {
        borderRadius: theme.shape.borderRadius * 5,
      },
      borderRadius: theme.shape.borderRadius * 5,
    }),
    toolbar: ({ theme }) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      padding: theme.spacing(2.5, 3.75),
      paddingRight: `${theme.spacing(3.75)} !important`,
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: 15,
      },
    }),
    spacer: {
      flex: 'none',
    },
    select: {
      display: 'none !important',
    },
    selectLabel: {
      display: 'none',
    },
    input: {
      display: 'none',
    },
    displayedRows: () => ({
      display: 'none',
    }),
    actions: {
      marginLeft: 'auto',
    },
  },
};

export default TablePagination;
