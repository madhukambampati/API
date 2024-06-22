import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const InputBase: Components<Omit<Theme, 'components'>>['MuiInputBase'] = {
  defaultProps: {
    autoComplete: 'off',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.primary,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      maxWidth: 330,
    }),
    input: ({ theme }) => ({
      '&::placeholder': {
        opacity: 1,
        fontFamily: theme.typography.body1.fontFamily,
        color: theme.palette.text.secondary,
      },
      ':-webkit-autofill': {
        borderTopLeftRadius: 'inherit',
        borderBottomLeftRadius: 'inherit',
        borderTopRightRadius: 'initial',
        borderBottomRightRadius: 'initial',
      },
    }),
  },
};

export default InputBase;
