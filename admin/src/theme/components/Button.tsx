import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    size: 'medium',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      textTransform: 'none',
      textAlign: 'center',
      letterSpacing: 0,
    }),
    text: ({ theme }) => ({
      color: theme.palette.primary.main,
      padding: theme.spacing(1.5, 2),
      borderRadius: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    }),
    outlined: ({ theme }) => ({
      border: 1,
      borderStyle: 'solid',
      borderRadius: theme.shape.borderRadius * 7.5,
    }),
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(0.75, 3.375),
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 7.75),
    }),
    outlinedSizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 7.75),
    }),
    contained: ({ theme }) => ({
      backgroundColor: theme.palette.primary.main,
      borderRadius: theme.shape.borderRadius * 7.5,
      boxShadow: theme.shadows[0],
      color: theme.palette.common.white,
      '&:hover': {
        boxShadow: theme.shadows[0],
      },
    }),
    containedSizeLarge: ({ theme }) => ({
      padding: theme.spacing(1.5, 7.75),
    }),
    icon: ({ theme }) => ({
      paddingTop: theme.spacing(0.75),
      paddingBottom: theme.spacing(0.75),
    }),
    fullWidth: ({ theme }) => ({
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    }),
    disabled: () => ({
      cursor: 'not-allowed',
    }),
    containedSecondary: ({ theme }) => ({
      backgroundColor: theme.palette.secondary.main,
    }),
    textSecondary: ({ theme }) => ({
      color: theme.palette.secondary.main,
    }),
    containedInfo: ({ theme }) => ({
      backgroundColor: theme.palette.info.main,
    }),
    textInfo: ({ theme }) => ({
      color: theme.palette.info.main,
    }),
    containedError: ({ theme }) => ({
      backgroundColor: theme.palette.error.main,
    }),
    textError: ({ theme }) => ({
      color: theme.palette.error.main,
    }),
  },
};

export default Button;
