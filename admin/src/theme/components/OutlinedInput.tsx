import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import pxToRem from 'theme/functions/px-to-rem';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  defaultProps: {
    autoComplete: 'off',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 999,
      borderWidth: pxToRem(1),
      borderStyle: 'solid',
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.paper,
      '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: '1px solid black',
      },
      '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline > legend': {
        width: 0,
      },
    }),
    input: ({ theme }) => ({
      paddingLeft: pxToRem(20),
      paddingTop: pxToRem(12),
      paddingBottom: pxToRem(12),
      '&::placeholder': {
        opacity: 1,
        color: theme.palette.text.secondary,
      },
    }),
    notchedOutline: ({ theme }) => ({
      borderColor: theme.palette.divider,
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      '&:focus': {
        borderColor: theme.palette.secondary.main,
      },
    }),
    adornedEnd: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
    inputAdornedEnd: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
  },
};

export default OutlinedInput;
