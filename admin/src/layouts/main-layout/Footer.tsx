import { Link, Stack, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Stack
      direction="row"
      justifyContent={{ xs: 'center', md: 'flex-end' }}
      ml={{ xs: 3.75, lg: 34.75 }}
      mr={3.75}
      my={3.75}
    >
      <Typography variant="subtitle2" fontFamily={'Poppins'} color="text.primary">
        Made with <span style={{ color: 'red' }}>&#10084;</span> by{' '}
        <Link
          // href="https://themewagon.com"
          target="_blank"
          rel="noopener"
          sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}
        >
          APIHUB
        </Link>
      </Typography>
    </Stack>
  );
};

export default Footer;
