// BuyButton.jsx
import React from 'react';
import { Button } from "@/components/ui/button"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {useState,useEffect} from 'react';
import { Gift } from 'lucide-react';


const auth = getAuth();
const db = getFirestore();
const BuyButton = ({listing,payloadRent}) => {
  //const [user, setUser] = useState(null);
  console.log(payloadRent);
  const [userId, setUserId] = useState(null);
  const [buyerData, setBuyerData] = useState(null);
  const [sellerData, setSellerData] = useState(null);

  
  const payload = {
    user_email: (buyerData !== null)?buyerData.email : "", 
    user_phoneNo: (buyerData !==  null)?buyerData.phone:"",
    user_Name: (buyerData !==  null)?buyerData.fullName:"",
    user_Id: (userId!=null)?userId:"",
    product_owner_email: "anmolgupta.bt22cse@pec.edu.in",  
    product_name: listing.title,
    product_price : listing.price,
    product_link: window.location.href,// Replace dynamically

    payloadRent: payloadRent,
    isSell : listing.listingType === "sell"
  };
 console.log(payload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentUserId = user.uid;
        setUserId(currentUserId);
      //  console.log("Logged-in user ID:", currentUserId);

        // Fetch Buyer (Logged-in user) data
        try {
          const buyerDoc = await getDoc(doc(db, "users", currentUserId));
          if (buyerDoc.exists()) {
            const buyerInfo = buyerDoc.data();
            setBuyerData(buyerInfo);
            console.log("Buyer Data:", buyerInfo);
          } else {
            console.error("No user data found in Firestore for buyer");
          }
        } catch (error) {
          console.error("Error fetching buyer data:", error);
        }
      } else {
        setBuyerData(null);
        setUserId(null);
      }
    });

    // Fetch Seller data using listing.userId
    const fetchSellerData = async () => {
      const sellerId = listing?.userId;
      if (!sellerId) return;

      try {
        const sellerDoc = await getDoc(doc(db, "users", sellerId));
        if (sellerDoc.exists()) {
          const sellerInfo = sellerDoc.data();
          setSellerData(sellerInfo);
          console.log("Seller Data:", sellerInfo);
        } else {
          console.error("No user data found in Firestore for seller");
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
      }
    };

    fetchSellerData();

    return () => unsubscribe();
  }, []);

      
 // console.log(listing);
 // console.log(window.location.href);

 

// get seller data;
// console.log(listing.userId);
//console.log(user);
  const handleBuy = async () => {
  

    try {
      const response = await fetch("https://college-fair.onrender.com/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Error sending email");
      console.error(error);
    }
  };

  return (
  <Button
  size="lg"
  onClick={handleBuy}
  className={`w-full text-white ${
    true
      ? "bg-green-600 hover:bg-green-700"
      : true
        ? "bg-purple-600 hover:bg-purple-700"
        : "bg-indigo-600 hover:bg-indigo-700"
  }`}
>
  {listing.listingType === "donate" ? (
    <>
      <Gift className="h-4 w-4 mr-2" />
      Request Item
    </>
  ) : listing.listingType === "rent" ? (
    "Rent Now"
  ) : (
    "Click to Show Interest"
  )}
</Button>)
};

export default BuyButton;
