import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Input: Components<Omit<Theme, 'components'>>['MuiInput'] = {
  defaultProps: {},
  styleOverrides: {
    input: ({ theme }) => ({
      '&::placeholder': {
        fontFamily: theme.typography.body1.fontFamily,
      },
    }),
  },
};

export default Input;
