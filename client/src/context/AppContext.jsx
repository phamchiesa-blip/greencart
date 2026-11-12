/* eslint-disable react-refresh/only-export-components */
// chia sẻ dữ liệu giữa nhiều component mà không cần truyền props
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
   
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    // Fetch all products
    const fetchProducts = async () => {
        setProducts(dummyProducts);
    }

    // Add products to cart
    const addToCart = (itemId, count = 1) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]) {
            cartData[itemId] += count;
        } else {
            cartData[itemId] = count;
        }
        setCartItems(cartData);
        toast.success("Add to cart")
    }

    // Update cart items quantity
    const updateCartQuantity = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
       cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("Cart updated");
    };

    // Remove product from cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        toast.success("Removed from cart");
    }

    // Get cart item count
    const getCartCount = () => {
        let totalCount = 0;
        for(const item in cartItems) {
            totalCount += cartItems[item]; 
        }
        return totalCount;
    }

    // Get cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find(product => product._id === items);
            if(cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts();
    }, []);

    const value = { navigate, user, setUser, isSeller, setIsSeller,
        showUserLogin, setShowUserLogin, products, currency, cartItems,
        addToCart, updateCartQuantity, removeFromCart, searchQuery, setSearchQuery,
        getCartAmount, getCartCount
    };
    return <AppContext.Provider value={value}>
        {children}
        </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
}