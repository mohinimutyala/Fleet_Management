import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; }
  });
  const [adminInfo, setAdminInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminInfo')); } catch { return null; }
  });
  const [driverInfo, setDriverInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('driverInfo')); } catch { return null; }
  });

  const loginUser = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };
  const logoutUser = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
  };

  const loginAdmin = (data) => {
    localStorage.setItem('adminInfo', JSON.stringify(data));
    setAdminInfo(data);
  };
  const logoutAdmin = () => {
    localStorage.removeItem('adminInfo');
    setAdminInfo(null);
  };

  const loginDriver = (data) => {
    localStorage.setItem('driverInfo', JSON.stringify(data));
    setDriverInfo(data);
  };
  const logoutDriver = () => {
    localStorage.removeItem('driverInfo');
    setDriverInfo(null);
  };

  return (
    <AuthContext.Provider value={{
      userInfo, loginUser, logoutUser,
      adminInfo, loginAdmin, logoutAdmin,
      driverInfo, loginDriver, logoutDriver,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
