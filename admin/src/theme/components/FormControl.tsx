import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';
import pxToRem from 'theme/functions/px-to-rem';

const FormControl: Components<Omit<Theme, 'components'>>['MuiFormControl'] = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      gap: pxToRem(10),
    }),
  },
};

export default FormControl;
