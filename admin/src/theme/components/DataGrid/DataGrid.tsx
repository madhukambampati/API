import { Theme } from '@mui/material';

import type { DataGridComponents } from '@mui/x-data-grid/themeAugmentation';
import pxToRem from 'theme/functions/px-to-rem';

const DataGrid: DataGridComponents<Omit<Theme, 'components'>>['MuiDataGrid'] = {
  defaultProps: {
    disableRowSelectionOnClick: true,
    disableColumnMenu: true,
    pagination: true,
    density: 'comfortable',
    scrollbarSize: 1,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      border: 'none',
      borderColor: theme.palette.divider,
      '--DataGrid-rowBorderColor': theme.palette.background.paper,
      '--DataGrid-containerBackground': theme.palette.background.paper,
      borderBottomLeftRadius: theme.spacing(2.5),
      borderBottomRightRadius: theme.spacing(2.5),
      '& .MuiDataGrid-filler': {
        flex: 0,
      },
      '& .MuiDataGrid-scrollbar--vertical': {
        display: 'none',
      },
    }),
    main: ({ theme }) => ({
      marginLeft: theme.spacing(2.5),
      marginRight: theme.spacing(2.5),
    }),
    'container--top': ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      '::after': {
        content: 'none',
      },
    }),
    columnHeaders: ({ theme }) => ({
      borderBottom: 'none',
      backgroundColor: theme.palette.background.paper,
    }),
    columnHeader: () => ({
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    }),
    columnHeaderTitle: ({ theme }) => ({
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
    }),
    columnHeaderTitleContainer: () => ({
      gap: 8,
    }),
    columnSeparator: () => ({
      display: 'none',
    }),
    cell: ({ theme }) => ({
      color: theme.palette.text.secondary,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      fontFamily: theme.typography.body1.fontFamily,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      '&:focus': {
        outline: 'none',
      },
      '&:focus-within': {
        outline: 'none',
      },
    }),
    row: ({ theme }) => ({
      border: 'none',
      width: '100%',
      '&:hover': {
        backgroundColor: theme.palette.background.default,
      },
    }),
    virtualScroller: () => ({
      overflowX: 'scroll !important' as 'scroll',
      display: 'flex',
      flexDirection: 'column',
      height: pxToRem(432),
    }),
    virtualScrollerContent: () => ({
      width: 'auto',
    }),
    virtualScrollerRenderZone: () => ({
      width: 'auto',
      position: 'static',
      height: '100%',
    }),
    filler: () => ({
      display: 'none',
      height: '0 !important',
      flex: 0,
      flexGrow: 0,
    }),
    withBorderColor: ({ theme }) => ({
      borderColor: theme.palette.divider,
    }),
    footerContainer: ({ theme }) => ({
      borderBottomLeftRadius: theme.spacing(2.5),
      borderBottomRightRadius: theme.spacing(2.5),
    }),
    cellEmpty: ({ theme }) => ({
      width: theme.spacing(0),
      maxWidth: theme.spacing(0),
    }),
    sortIcon: () => ({
      color: 'initial',
      width: 20,
    }),
    overlay: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
      fontFamily: theme.typography.body1.fontFamily,
    }),
    overlayWrapperInner: () => ({
      height: '100%',
    }),
  },
};

export default DataGrid;
