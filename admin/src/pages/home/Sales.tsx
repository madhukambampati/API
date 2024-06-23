import Grid from '@mui/material/Unstable_Grid2';
import { Stack } from '@mui/material';
import { ReactElement } from 'react';

// import TopSellingProduct from 'components/sections/dashboard/Home/Sales/TopSellingProduct/TopSellingProduct';
import WebsiteVisitors from 'components/sections/dashboard/Home/Sales/WebsiteVisitors/WebsiteVisitors';
// import SaleInfoCards from 'components/sections/dashboard/Home/Sales/SaleInfoSection/SaleInfoCards';
// import BuyersProfile from 'components/sections/dashboard/Home/Sales/BuyersProfile/BuyersProfile';
import NewCustomers from 'components/sections/dashboard/Home/Sales/NewCustomers/NewCustomers';
// import Revenue from 'components/sections/dashboard/Home/Sales/Revenue/Revenue';

import { drawerWidth } from 'layouts/main-layout';

const Sales = (): ReactElement => {
  return (
    <Grid
      container
      component="main"
      columns={12}
      spacing={3.75}
      flexGrow={1}
      pt={4.375}
      pr={1.875}
      pb={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        pl: { xs: 3.75, lg: 0 },
      }}
    >
      {/* <Grid xs={12}>
        <SaleInfoCards />
      </Grid> */}
      {/* <Grid xs={12} md={8}>
        <Revenue />
      </Grid> */}
      <Grid xs={12} md={4}>
        <WebsiteVisitors />
      </Grid>
      {/* <Grid xs={12} lg={8}>
        <TopSellingProduct />
      </Grid> */}
      <Grid xs={12} lg={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column' }}
          gap={3.75}
          height={1}
          width={1}
        >
          <NewCustomers />
          {/* <BuyersProfile /> */}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Sales;
