/* eslint-disable react-refresh/only-export-components */
// chia sẻ dữ liệu giữa nhiều component mà không cần truyền props
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios'

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BE_URL;

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

    // Fetch seller status
    const fetchSeller = async () => {
        try {
            const {data} = await axios.get("/api/seller/is-auth");
            if(data.success) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } catch {
            setIsSeller(false);
        }
    }

    // Fetch user auth status, user data and cart items
    const fetchUser = async () => {
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if (data.success) {
                setUser(data.user);
                setCartItems(data.user.cartItems);
            }
        } catch {
            setUser(null);
        }
    }


    // Fetch all products
    const fetchProducts = async () => {
        try {
            const {data} = await axios.get("/api/product/list");
            if(data.success) {
                setProducts(data.products);
            }else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
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
        toast.success("Add to cart");
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
            if(itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSeller();
        fetchProducts();
        fetchUser();
    }, []);

    // useEffect(() => {
    //     const updateCart = async () => {
    //         try {
    //             const data = await axios.post('/api/cart/update', cartItems);
    //             if(data.success) {
    //                 toast.success(data.message);
    //             } else {
    //                 toast.error(data.message);
    //             }
    //         } catch (error) {
    //             toast.error(error.message);
    //         }
    //     }

    //     if(user) {
    //         updateCart();
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [cartItems]);

    const value = { navigate, user, setUser, isSeller, setIsSeller,
        showUserLogin, setShowUserLogin, products, currency, cartItems,
        addToCart, updateCartQuantity, removeFromCart, searchQuery, setSearchQuery,
        getCartAmount, getCartCount, axios, fetchProducts, setCartItems
    };
    return <AppContext.Provider value={value}>
        {children}
        </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
}