import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);

  return (
    <UserContext.Provider value={{ selectedMenu, setSelectedMenu }}>
      {children}
    </UserContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
