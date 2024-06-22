import { ReactElement, Suspense, useState } from 'react';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import logo from 'assets/logo/elegant-logo.png';
import resetPassword from 'assets/authentication-banners/reset-password.png';
import passwordUpdated from 'assets/authentication-banners/password-updated.png';
import successTick from 'assets/authentication-banners/successTick.png';
import Image from 'components/base/Image';
import IconifyIcon from 'components/base/IconifyIcon';

const ResetPassword = (): ReactElement => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const [resetSuccessful, setResetSuccessful] = useState(false);

  const handleResetPassword = () => {
    const passwordField: HTMLInputElement = document.getElementById(
      'new-password',
    ) as HTMLInputElement;
    const confirmPasswordField: HTMLInputElement = document.getElementById(
      'confirm-password',
    ) as HTMLInputElement;

    if (passwordField.value !== confirmPasswordField.value) {
      alert("Passwords don't match");
      return;
    }
    setResetSuccessful(true);
  };

  return (
    <Stack
      direction="row"
      bgcolor="background.paper"
      boxShadow={(theme) => theme.shadows[3]}
      height={560}
      width={{ md: 960 }}
    >
      <Stack width={{ md: 0.5 }} m={2.5} gap={10}>
        <Link href="/" width="fit-content">
          <Image src='' width={82.6} />
        </Link>
        {!resetSuccessful ? (
          <Stack alignItems="center" gap={3.75} width={330} mx="auto">
            <Typography variant="h3">Reset Password</Typography>
            <FormControl variant="standard" fullWidth>
              <InputLabel shrink htmlFor="new-password">
                Password
              </InputLabel>
              <TextField
                variant="filled"
                placeholder="Enter new password"
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowNewPassword}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {showNewPassword ? (
                          <IconifyIcon icon="ic:baseline-key-off" />
                        ) : (
                          <IconifyIcon icon="ic:baseline-key" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <FormControl variant="standard" fullWidth>
              <InputLabel shrink htmlFor="confirm-password">
                Password
              </InputLabel>
              <TextField
                variant="filled"
                placeholder="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {showConfirmPassword ? (
                          <IconifyIcon icon="ic:baseline-key-off" />
                        ) : (
                          <IconifyIcon icon="ic:baseline-key" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            <Button variant="contained" fullWidth onClick={handleResetPassword}>
              Reset Password
            </Button>
            <Typography variant="body2" color="text.secondary">
              Back to{' '}
              <Link
                href="/authentication/login"
                underline="hover"
                fontSize={(theme) => theme.typography.body1.fontSize}
              >
                Log in
              </Link>
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" gap={3.75} width={330} mx="auto">
            <Image src={successTick} />
            <Typography variant="h3">Reset Successfully</Typography>
            <Typography variant="body1" textAlign="center" color="text.secndary">
              Your Elegent log in password has been updated successfully
            </Typography>
            <Button variant="contained" fullWidth LinkComponent={Link} href="/authentication/login">
              Continue to Login
            </Button>
          </Stack>
        )}
      </Stack>
      <Suspense
        fallback={
          <Skeleton variant="rectangular" height={1} width={1} sx={{ bgcolor: 'primary.main' }} />
        }
      >
        <Image
          alt={resetSuccessful ? 'Reset done' : 'Login banner'}
          src={resetSuccessful ? passwordUpdated : resetPassword}
          sx={{
            width: 0.5,
            display: { xs: 'none', md: 'block' },
          }}
        />
      </Suspense>
    </Stack>
  );
};

export default ResetPassword;
