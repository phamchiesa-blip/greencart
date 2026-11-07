import {useAppContext} from '../context/AppContext';
import {useState, useEffect} from 'react';
import ProductCard from '../components/ProductCard'

const AllProducts = () => {
    const {products, searchQuery} = useAppContext();
    const [filterProducts, setFilterProducts] = useState([]);

    useEffect(() => {
        if(searchQuery.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFilterProducts(products.filter(
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } else {
            setFilterProducts(products)
        }
    }, [searchQuery, products]);

  return (
    <div className="mt-16 flex flex-col">
        <div className="flex flex-col items-end w-max">
            <h1 className="text-2xl font-medium uppercase">All Products</h1>
            <div className="w-16 h-0.5 bg-primary rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
            {filterProducts.filter((product) => product.inStock).map((product, index) => (
                <ProductCard key={index} product={product} />
            ))}
        </div>

    </div>
  )
}

export default AllProducts