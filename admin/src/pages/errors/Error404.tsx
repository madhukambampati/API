import { ReactElement } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as Nav } from 'react-router-dom';
import logo from 'assets/logo/elegant-logo.png';
import error404 from 'assets/404/404.jpg';
import Image from 'components/base/Image';

const Error404 = (): ReactElement => {
  const renderHeader: ReactElement = (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 20,
        left: 20,
        width: 1,
        lineHeight: 0,
      }}
    >
      <Image src={logo} width={82.6} />
    </Box>
  );
  return (
    <>
      {renderHeader}
      <Container>
        <Stack
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          mx="auto"
          maxWidth={480}
          py={12}
        >
          <Typography variant="h2" sx={{ mb: 3 }}>
            Sorry, page not found!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be
            sure to check your spelling.
          </Typography>
          <Image
            src={error404}
            sx={{
              mx: 'auto',
              width: 1,
              height: 'auto',
              my: { xs: 5, sm: 10 },
            }}
          />
          <Button component={Nav} to="/" size="large" variant="contained">
            Back to Home
          </Button>
        </Stack>
      </Container>
    </>
  );
};

export default Error404;
