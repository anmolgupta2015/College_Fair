import React from 'react';

const NotifyButton = () => {
  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notify-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: 'Anmol Gupta',
          userEmail: 'anmolgupta9872148833@gmail.com',
          productId: '12345'
        })
      });

      const data = await response.json();
      console.log(data);

      if (data.status === 200) {
        alert('Email sent successfully!');
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    }
  };

  return (
    <button onClick={handleClick}>
      Notify Owner
    </button>
  );
};

export default NotifyButton;
