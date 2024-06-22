import { Box, CircularProgress, Stack, StackOwnProps } from '@mui/material';
import { caribbeanGreen, downy, orange, watermelon } from 'theme/colors';

const PageLoader = (props: StackOwnProps) => {
  return (
    <Stack alignItems="center" width={1} justifyContent="center" height={1} {...props}>
      <Box height={'10vh'} width={'25vw'} textAlign={'center'}>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={orange[500]} />
              <stop offset="33%" stopColor={caribbeanGreen[500]} />
              <stop offset="67%" stopColor={downy[500]} />
              <stop offset="100%" stopColor={watermelon[500]} />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgress
          size={100}
          thickness={3}
          sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
        />
      </Box>
    </Stack>
  );
};

export default PageLoader;
