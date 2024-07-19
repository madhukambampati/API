import relaxingChair from 'assets/top-selling-products/relaxingChair.jpg';
import instaxCamera from 'assets/top-selling-products/instaxCamera.jpg';
import nikeV22 from 'assets/top-selling-products/nikeV22.jpg';
import laptop from 'assets/top-selling-products/laptop.jpg';
import watch from 'assets/top-selling-products/watch.jpg';

export interface DataRow {
  id: number;
  product: {
    avatar: string;
    title: string;
    subtitle: string;
  };
  orders: number;
  price: number;
  adsSpent: number;
  refunds: number;
}

export const rows: DataRow[] = [
  {
    id: 1,
    product: {
      avatar: nikeV22,
      title: 'Sports',
      subtitle: 'Running Shoes',
    },
    orders: 8000,
    price: 130,
    adsSpent: 9.5,
    refunds: 13,
  },
  {
    id: 2,
    product: {
      avatar: instaxCamera,
      title: 'Instax Camera',
      subtitle: 'Portable Camera',
    },
    orders: 3000,
    price: 45,
    adsSpent: 4.5,
    refunds: 18,
  },
  {
    id: 3,
    product: {
      avatar: relaxingChair,
      title: 'Chair ',
      subtitle: 'Relaxing chair',
    },
    orders: 6000,
    price: 80,
    adsSpent: 5.8,
    refunds: -11,
  },
  {
    id: 4,
    product: {
      avatar: laptop,
      title: 'Laptop',
      subtitle: 'Macbook pro 13',
    },
    orders: 4000,
    price: 500,
    adsSpent: 4.7,
    refunds: 18,
  },
  {
    id: 5,
    product: {
      avatar: watch,
      title: 'Watch',
      subtitle: 'Digital watch',
    },

  
    orders: 2000,
    price: 15,
    adsSpent: 2.5,
    refunds: -10,
  },
  {
    id: 6,
    product: {
      avatar: relaxingChair,
      title: 'Chair',
      subtitle: 'Relaxing chair',
    },
    orders: 6000,
    price: 80,
    adsSpent: 5.8,
    refunds: -11,
  },
  {
    id: 7,
    product: {
      avatar: instaxCamera,
      title: 'Instax Camera',
      subtitle: 'Portable Camera',
    },
    orders: 3000,
    price: 45,
    adsSpent: 4.5,
    refunds: 18,
  },
  {
    id: 8,
    product: {
      avatar: watch,
      title: 'Watch',
      subtitle: 'Digital watch',
    },
    orders: 2000,
    price: 15,
    adsSpent: 2.5,
    refunds: -10,
  },
  {
    id: 9,
    product: {
      avatar: nikeV22,
      title: 'Nike v22',
      subtitle: 'Running Shoes',
    },
    orders: 8000,
    price: 130,
    adsSpent: 9.5,
    refunds: 13,
  },
  {
    id: 10,
    product: {
      avatar: laptop,
      title: 'Laptop',
      subtitle: 'Macbook pro 13',
    },
    orders: 4000,
    price: 500,
    adsSpent: 4.7,
    refunds: 18,
  },
];
