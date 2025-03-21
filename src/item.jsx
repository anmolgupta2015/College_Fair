import React from "react";
import { ShoppingCart } from "lucide-react";

const ProductCard = ({ image, name, price, originalPrice, onSale }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-80 transition-transform transform hover:scale-105">
            {/* Product Image */}
            <div className="relative">
                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-80 object-cover"
                />
                {true && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-md">
                        SALE
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                <div className="flex items-center mt-1 space-x-2">
                    <p className="text-xl font-bold text-black">${price}</p>
                    {originalPrice && (
                        <p className="text-gray-500 line-through text-lg">${originalPrice}</p>
                    )}
                </div>

                {/* Cart Button */}
                <div className="flex justify-end mt-4">
                    <button 
                        className="bg-gray-900 text-white p-3 rounded-full transition hover:bg-gray-700"
                    >
                        <ShoppingCart size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
