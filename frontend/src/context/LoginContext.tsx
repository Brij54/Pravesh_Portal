
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useState,
  } from "react";
  // import React from "react";
  
  export type User = {
    email_id: string;
    password: string;
  };
  
  export interface LoginContextInterface {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
    isLoggedInSecurity: boolean;
    setIsLoggedInSecurity: Dispatch<SetStateAction<boolean>>;
  }
  
  const initialUserState: User = {
    email_id: "",
    password: "",
  };
  
  const initialLoginState = false;
  
  export const LoginContext = createContext<LoginContextInterface>({
    user: initialUserState,
    setUser: () => {},
    isLoggedIn: initialLoginState,
    setIsLoggedIn: () => {},
    isLoggedInSecurity:initialLoginState,
    setIsLoggedInSecurity:()=> {}
  });
  
  type UserProvideProps = {
    children: ReactNode;
  };
  
  export const LoginContextProvider = ({ children }: UserProvideProps) => {
    const [user, setUser] = useState<User>(initialUserState);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialLoginState);
    const [isLoggedInSecurity, setIsLoggedInSecurity] = useState<boolean>(initialLoginState);
  
    return (
      <LoginContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn ,isLoggedInSecurity, setIsLoggedInSecurity}}>
        {children}
      </LoginContext.Provider>
    );
  };
  