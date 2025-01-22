// components/Notifications.tsx

'use client'; // Mark as client-side component

import React, { useState } from 'react';
import { IoNotifications } from 'react-icons/io5';

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
}

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false); // To toggle the notifications dropdown
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order has been shipped and is on the way!',
      timestamp: '2025-01-22 10:30 AM',
    },
    {
      id: 2,
      title: 'Order Delivered',
      message: 'Your order has been delivered successfully.',
      timestamp: '2025-01-20 3:00 PM',
    },
    {
      id: 3,
      title: 'Payment Failed',
      message: 'There was an issue processing your payment. Please try again.',
      timestamp: '2025-01-18 11:45 AM',
    },
  ]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Notification Icon */}
      <button
        onClick={toggleNotifications}
        className="relative text-gray-700 p-2 rounded-md hover:bg-gray-200 text-2xl"
      >
        <span className="material-icons">  <IoNotifications/></span> {/* You can use an icon library like Material Icons or FontAwesome */}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
          <div className="p-4 font-semibold text-gray-800">Notifications</div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-100 cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
