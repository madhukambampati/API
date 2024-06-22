import { TypographyOptions } from '@mui/material/styles/createTypography';
import pxToRem from './functions/px-to-rem';

const typography: TypographyOptions = {
  fontFamily: ['IBM Plex Sans', 'Poppins', 'sans-serif'].join(','),
  h1: {
    fontSize: pxToRem(40),
    fontWeight: 700,
    fontFamily: 'IBM Plex Sans',
  },
  h2: {
    fontSize: pxToRem(28),
    fontWeight: 700,
    fontFamily: 'IBM Plex Sans',
  },
  h3: {
    fontSize: pxToRem(25),
    fontWeight: 700,
    fontFamily: 'IBM Plex Sans',
  },
  h4: {
    fontSize: pxToRem(22),
    fontWeight: 700,
    fontFamily: 'IBM Plex Sans',
  },
  h5: {
    fontSize: pxToRem(20),
    fontWeight: 500,
    fontFamily: 'IBM Plex Sans',
  },
  h6: {
    fontSize: pxToRem(18),
    fontWeight: 500,
    fontFamily: 'IBM Plex Sans',
  },
  subtitle1: {
    fontSize: pxToRem(16),
    fontWeight: 500,
    fontFamily: 'IBM Plex Sans',
  },
  subtitle2: {
    fontSize: pxToRem(16),
    fontWeight: 400,
    fontFamily: 'IBM Plex Sans',
  },
  body1: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    fontFamily: 'Poppins',
  },
  body2: {
    fontSize: pxToRem(12),
    fontWeight: 400,
    fontFamily: 'Poppins',
  },
  caption: {
    fontFamily: 'Poppins',
  },
  button: {
    fontFamily: 'Poppins',
  },
};

export default typography;
