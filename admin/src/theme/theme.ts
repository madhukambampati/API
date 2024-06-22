import { createTheme } from '@mui/material';

import TablePagination from './components/TablePagination';
import PaginationItem from './components/PaginationItem';
import InputAdornment from './components/InputAdornment';
import ListItemButton from './components/ListItemButton';
import OutlinedInput from './components/OutlinedInput';
import DataGrid from './components/DataGrid/DataGrid';
import ListItemIcon from './components/ListItemIcon';
import ListItemText from './components/ListItemText';
import CssBaseline from './components/CssBaseline';
import FilledInput from './components/FilledInput';
import IconButton from './components/IconButton';
import InputLabel from './components/InputLabel';
import Pagination from './components/Pagination';
import TextField from './components/TextField';
import InputBase from './components/InputBase';
import Toolbar from './components/Toolbar';
import AppBar from './components/AppBar';
import Avatar from './components/Avatar';
import Button from './components/Button';
import Badge from './components/Badge';
import Grid2 from './components/Grid2';
import Input from './components/Input';
import Paper from './components/Paper';
import Stack from './components/Stack';
import Card from './components/Card';
import Link from './components/Link';
import Menu from './components/Menu';

import typography from './typography';
import palette from './palette';
import shadows from './shadows';
import Collapse from './components/Collapse';
import ListItem from './components/ListItem';
import Tooltip from './components/Tooltip';
import FormControl from './components/FormControl';

export const theme = createTheme({
  typography: typography,
  palette: palette,
  components: {
    MuiTablePagination: TablePagination,
    MuiInputAdornment: InputAdornment,
    MuiListItemButton: ListItemButton,
    MuiPaginationItem: PaginationItem,
    MuiOutlinedInput: OutlinedInput,
    MuiListItemIcon: ListItemIcon,
    MuiListItemText: ListItemText,
    MuiCssBaseline: CssBaseline,
    MuiFilledInput: FilledInput,
    MuiFormControl: FormControl,
    MuiIconButton: IconButton,
    MuiPagination: Pagination,
    MuiInputLabel: InputLabel,
    MuiInputBase: InputBase,
    MuiTextField: TextField,
    MuiCollapse: Collapse,
    MuiDataGrid: DataGrid,
    MuiListItem: ListItem,
    MuiToolbar: Toolbar,
    MuiTooltip: Tooltip,
    MuiAppBar: AppBar,
    MuiAvatar: Avatar,
    MuiButton: Button,
    MuiBadge: Badge,
    MuiGrid2: Grid2,
    MuiInput: Input,
    MuiPaper: Paper,
    MuiStack: Stack,
    MuiCard: Card,
    MuiLink: Link,
    MuiMenu: Menu,
  },
  zIndex: {
    appBar: 1100,
  },
});

shadows.forEach((shadow, index) => {
  theme.shadows[index] = shadow;
});
