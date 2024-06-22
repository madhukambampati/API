import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const ListItem: Components<Omit<Theme, 'components'>>['MuiListItem'] = {
  defaultProps: {
    disablePadding: true,
  },
  styleOverrides: {
    root: ({}) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'start',
    }),
  },
};

export default ListItem;
