import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import pxToRem from 'theme/functions/px-to-rem';

const FilledInput: Components<Omit<Theme, 'components'>>['MuiFilledInput'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 999,
      borderWidth: pxToRem(1),
      borderStyle: 'solid',
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.action.focus,
      '&:hover': {
        backgroundColor: theme.palette.action.focus,
      },
      '&:focus': {
        backgroundColor: theme.palette.action.focus,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.action.focus,
      },
      '&::before': {
        border: 'none',
      },
      '&::after': {
        border: 'none',
      },
      '&:hover:not(.Mui-disabled,.Mui-error):before': {
        border: 'none',
      },
    }),
    focused: ({ theme }) => ({
      backgroundColor: theme.palette.action.focus,
    }),
    input: () => ({
      paddingLeft: pxToRem(20),
      paddingTop: pxToRem(12),
      paddingBottom: pxToRem(12),
      '&::placeholder': {
        opacity: 1,
      },
      '&:-webkit-autofill': {
        borderTopLeftRadius: 'inherit',
        borderBottomLeftRadius: 'inherit',
        borderTopRightRadius: 'initial',
        borderBottomRightRadius: 'initial',
      },
    }),
    error: ({ theme }) => ({
      borderColor: theme.palette.error.main,
    }),
    adornedEnd: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
    inputAdornedEnd: ({ theme }) => ({
      color: theme.palette.common.black,
    }),
    multiline: () => ({
      alignItems: 'start',
      minHeight: pxToRem(90),
      paddingTop: 0,
      paddingBottom: pxToRem(0),
      paddingLeft: 0,
      borderRadius: pxToRem(30),
    }),
  },
};

export default FilledInput;
