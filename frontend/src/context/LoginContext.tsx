
// import {
//     createContext,
//     Dispatch,
//     ReactNode,
//     SetStateAction,
//     useState,
//   } from "react";
//   // import React from "react";
  
//   export type User = {
//     email_id: string;
//     password: string;
//   };
  
//   export interface LoginContextInterface {
//     user: User;
//     setUser: Dispatch<SetStateAction<User>>;
//     isLoggedIn: boolean;
//     setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
//     isLoggedInSecurity: boolean;
//     setIsLoggedInSecurity: Dispatch<SetStateAction<boolean>>;
//   }
  
//   const initialUserState: User = {
//     email_id: "",
//     password: "",
//   };
  
//   const initialLoginState = false;
  
//   export const LoginContext = createContext<LoginContextInterface>({
//     user: initialUserState,
//     setUser: () => {},
//     isLoggedIn: initialLoginState,
//     setIsLoggedIn: () => {},
//     isLoggedInSecurity:initialLoginState,
//     setIsLoggedInSecurity:()=> {}
//   });
  
//   type UserProvideProps = {
//     children: ReactNode;
//   };
  
//   export const LoginContextProvider = ({ children }: UserProvideProps) => {
//     const [user, setUser] = useState<User>(initialUserState);
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialLoginState);
//     const [isLoggedInSecurity, setIsLoggedInSecurity] = useState<boolean>(initialLoginState);
  
//     return (
//       <LoginContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn ,isLoggedInSecurity, setIsLoggedInSecurity}}>
//         {children}
//       </LoginContext.Provider>
//     );
//   };
  

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export type User = {
  email_id: string;
  password: string;
  role?: "admin" | "student";
};

export interface LoginContextInterface {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const initialUserState: User = {
  email_id: "",
  password: "",
  role: undefined,
};

export const LoginContext = createContext<LoginContextInterface>({
  user: initialUserState,
  setUser: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  loading: true,
  setLoading: () => {},
});

export const LoginContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUserState);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // restore from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (storedUser && loggedIn) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  return (
    <LoginContext.Provider
      value={{ user, setUser, isLoggedIn, setIsLoggedIn, loading, setLoading }}
    >
      {children}
    </LoginContext.Provider>
  );
};