import { ReactElement, useMemo, useRef, useState } from 'react';
import { Box, Button, Divider, Stack, Typography, useTheme } from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries.js';
import WebsiteVisitorsChart from './WebsiteVisitorsChart';

const WebsiteVisitors = (): ReactElement => {
  const theme = useTheme();

  const seriesData: PieDataItemOption[] = [
    { value: 6840, name: 'Sports' },
    { value: 3960, name: 'News' },
    { value: 2160, name: 'Location' },
    { value: 5040, name: 'Social' },
  ];

  const legendData = [
    { name: 'Sports', icon: 'circle' },
    { name: 'News', icon: 'circle' },
    { name: 'Location', icon: 'circle' },
    { name: 'Social', icon: 'circle' },
  ];

  const pieChartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const chartRef = useRef<EChartsReactCore | null>(null);
  const onChartLegendSelectChanged = (name: string) => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance.dispatchAction({
        type: 'legendToggleSelect',
        name: name,
      });
    }
  };
  const [visitorType, setVisitorType] = useState<any>({
    Direct: false,
    Organic: false,
    Paid: false,
    Social: false,
  });

  const toggleClicked = (name: string) => {
    setVisitorType((prevState: any) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };
  const totalVisitors = useMemo(
    () => seriesData.reduce((acc: number, next: any) => acc + next.value, 0),
    [],
  );

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 'min-content',
        boxShadow: theme.shadows[4],
      }}
    >
      <Typography variant="subtitle1" color="text.primary" p={2.5}>
        Website Visitors
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }}>
        <Stack direction="row" justifyContent="center" flex={'1 1 0%'}>
          <WebsiteVisitorsChart
            chartRef={chartRef}
            seriesData={seriesData}
            colors={pieChartColors}
            legendData={legendData}
            sx={{
              width: 222,
              maxHeight: 222,
              mx: 'auto',
            }}
          />
        </Stack>
        <Stack
          spacing={1}
          divider={<Divider />}
          sx={{ px: 2.5, py: 2.5 }}
          justifyContent="center"
          alignItems="stretch"
          flex={'1 1 0%'}
        >
          {Array.isArray(seriesData) &&
            seriesData.map((dataItem, index) => (
              <Button
                key={dataItem.name}
                variant="text"
                fullWidth
                onClick={() => {
                  toggleClicked(dataItem.name as string);
                  onChartLegendSelectChanged(dataItem.name as string);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  p: 0,
                  borderRadius: 1,
                  opacity: visitorType[`${dataItem.name}`] ? 0.5 : 1,
                }}
                disableRipple
              >
                <Stack direction="row" alignItems="center" gap={1} width={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: visitorType[`${dataItem.name}`]
                        ? 'action.disabled'
                        : pieChartColors[index],
                      borderRadius: 400,
                    }}
                  ></Box>
                  <Typography variant="body1" color="text.secondary" flex={1} textAlign={'left'}>
                    {dataItem.name}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {((parseInt(`${dataItem.value}`) / totalVisitors) * 100).toFixed(0)}%
                  </Typography>
                </Stack>
              </Button>
            ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default WebsiteVisitors;
