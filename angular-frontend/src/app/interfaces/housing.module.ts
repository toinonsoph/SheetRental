export interface Housing {
  id: string;
  name: string;
  totalpersons: number;
  totalrooms: number;
  price: number | null;
  typebase?: { name: string };
  address: {
    street: string;
    number: string;
    postbox?: string | null;
    zipcode: string;
    city: string;
  };
  url: string | null;
}  