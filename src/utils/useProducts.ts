import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useProducts() {
  const [products, setProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}