import React from 'react'

const Payment = () => {

    const handleCheckout = async()=>{
        console.log("handleCheckout is called...")
        const res = await fetch('http://localhost:8002/api/create-checkout-session', 
            { method: 'POST' }); 
        console.log("res from payment", res)
        const {url} = await res.json()
        window.location.href = url  // redirect to Stripe-hosted page
    }
    
  return (
    <>
    <button onClick={handleCheckout}>Pay Now</button>
    </>    
)
}

export default Payment


// function Payment() {
//   const handlePayNow = async () => {
//     const res = await fetch('http://localhost:5000/api/create-checkout-session', {
//       method: 'POST',
//     });
//     const data = await res.json();
//     window.location.href = data.url;
//   };
 
//   return <button onClick={handlePayNow}>Pay Now</button>;
// }
 
// export default Payment;