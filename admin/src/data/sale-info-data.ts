import avgRevenue from 'assets/sale-info/avg-revenue.png';
import customers from 'assets/sale-info/customers.png';
import sales from 'assets/sale-info/sales.png';

interface SaleInfoData {
  id: number;
  image: string;
  title: string;
  sales: number;
  increment: number;
  date: string;
}

export const saleInfoData: SaleInfoData[] = [
  {
    id: 1,
    image: sales,
    title: 'Sales',
    sales: 230220,
    increment: 55,
    date: 'May 2022',
  },
  {
    id: 2,
    image: customers,
    title: 'Customers',
    sales: 3200,
    increment: 12,
    date: 'May 2022',
  },
  {
    id: 3,
    image: avgRevenue,
    title: 'Avg Revenue',
    sales: 2300,
    increment: 210,
    date: 'May 2022',
  },
];
