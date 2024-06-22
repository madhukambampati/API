import { PaletteOptions } from '@mui/material';
import { caribbeanGreen, orange, downy, watermelon, black, smoke, white, cream } from './colors';
import { green, yellow } from '@mui/material/colors';

const palette: PaletteOptions = {
  primary: {
    main: orange[500],
  },
  secondary: {
    main: caribbeanGreen[500],
  },
  info: {
    main: downy[500],
  },
  success: {
    main: green[500],
  },
  error: {
    main: watermelon[500],
  },
  text: {
    primary: black[500],
    secondary: smoke[500],
    disabled: smoke[200],
  },
  action: {
    focus: smoke[100],
    disabled: smoke[400],
    active: white[300],
  },
  background: {
    default: cream[500],
    paper: white[50],
  },
  divider: white[500],
  warning: {
    main: yellow[800],
  },
};

export default palette;
