import { Theme } from '@mui/material';

const scrollbar = (theme: Theme) => ({
  '@supports (-moz-appearance:none)': {
    scrollbarColor: `${theme.palette.grey[300]} transparent`,
  },
  '*::-webkit-scrollbar': {
    position: 'absolute',
    visibility: 'hidden',
    WebkitAppearance: 'none',
    width: 5,
    height: 5,
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-track': {
    margin: 9,
  },
  '*::-webkit-scrollbar-thumb': {
    visibility: 'hidden',
    borderRadius: 3,
    backgroundColor: theme.palette.grey[300],
  },
  '&:hover, &:focus': {
    '*::-webkit-scrollbar, *::-webkit-scrollbar-thumb': {
      visibility: 'visible',
    },
  },
});

export default scrollbar;
