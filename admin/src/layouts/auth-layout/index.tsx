import { PropsWithChildren, ReactElement } from 'react';
import { Stack } from '@mui/material';

const AuthLayout = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      py={10}
    >
      {children}
    </Stack>
  );
};

export default AuthLayout;
