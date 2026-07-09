import { createContext, useContext, useState } from 'react';

export const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);

  const clearBooking = () => {
    setSelectedCar(null);
    setFareData(null);
    setCurrentBooking(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedCar, setSelectedCar,
      fareData, setFareData,
      currentBooking, setCurrentBooking,
      clearBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
