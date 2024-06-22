import { SxProps, useTheme } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries.js';
import { useMemo } from 'react';
import { EChartsOption } from 'echarts-for-react';

type WebsiteVisitorsChartProps = {
  chartRef: React.MutableRefObject<EChartsReactCore | null>;
  seriesData?: PieDataItemOption[];
  legendData?: any;
  colors?: string[];
  sx?: SxProps;
};

const WebsiteVisitorsChart = ({
  chartRef,
  seriesData,
  legendData,
  colors,
  ...rest
}: WebsiteVisitorsChartProps) => {
  const theme = useTheme();
  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: false,
        data: legendData,
      },
      series: [
        {
          name: 'Website Visitors',
          type: 'pie',
          radius: ['65%', '80%'],
          avoidLabelOverlap: true,
          startAngle: 0,
          itemStyle: {
            borderRadius: 10,
            borderColor: theme.palette.common.white,
            borderWidth: 2,
          },
          color: colors,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 30,
              fontWeight: 'bold',
              formatter: `{b}`,
            },
          },
          labelLine: {
            show: false,
          },
          data: seriesData,
        },
      ],
    }),
    [theme],
  );

  return <ReactEchart ref={chartRef} option={option} echarts={echarts} {...rest} />;
};

export default WebsiteVisitorsChart;
