import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const Avatar: Components<Omit<Theme, 'components'>>['MuiAvatar'] = {
  defaultProps: {},
  styleOverrides: {
    img: () => ({
      objectFit: 'cover',
      overflow: 'auto',
    }),
  },
};

export default Avatar;
