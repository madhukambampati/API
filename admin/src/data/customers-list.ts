import leatrice from 'assets/new-customers/leatrice.png';
import roselle from 'assets/new-customers/roselle.jpg';
import darron from 'assets/new-customers/darron.png';
import jone from 'assets/new-customers/jone.png';

interface CustomerData {
  id: number;
  name: string;
  country: string;
  avatar: string;
}

export const customerList: CustomerData[] = [
  {
    id: 1,
    name: 'Roselle Ehrman',
    country: 'Brazil',
    avatar: roselle,
  },
  {
    id: 2,
    name: 'Jone Smith',
    country: 'Australia',
    avatar: jone,
  },
  {
    id: 3,
    name: 'Darron Handler',
    country: 'Pakistan',
    avatar: darron,
  },
  {
    id: 4,
    name: 'Leatrice Kulik',
    country: 'Mascow',
    avatar: leatrice,
  },
];
