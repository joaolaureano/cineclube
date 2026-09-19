import React, { createContext, useEffect, useState } from "react";

import UserService from "../services/user";

/**
 * A sessao e um cookie httpOnly emitido pelo backend: o JavaScript da pagina
 * nao a le nem a escreve, que e a protecao contra XSS que o localStorage nao
 * dava. Aqui so fica o perfil que a interface exibe.
 *
 * A forma do StubUser imita a do firebase.User nos campos que as telas usam
 * (displayName, email, photoURL) para que nenhuma pagina precise mudar.
 */
export interface StubUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const STUB_USER_KEY = "stubUser";

const readStoredUser = (): StubUser | null => {
  const raw = localStorage.getItem(STUB_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StubUser;
  } catch {
    return null;
  }
};

interface AuthContextData {
  //devolve o firstLogin junto: ler isFirstLogin do estado logo apos o setState
  //traria o valor anterior, e a tela precisa rotear na hora
  login: (
    credential: string
  ) => Promise<{ ok: boolean; firstLogin: boolean } | undefined>;
  logout: () => Promise<boolean | undefined>;
  setIsLoggingIn: (value: boolean) => void;
  setIsFirstLogin: (value: boolean) => void;
  authUser: StubUser | null;
  hasSession: boolean;
  isLoadingUser: boolean;
  isLoggingIn: boolean;
  isFirstLogin: boolean;
}

export const AuthContext = createContext({} as AuthContextData);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider = ({
  children,
}: AuthContextProviderProps): JSX.Element => {
  const [authUser, setAuthUser] = useState<StubUser | null>(readStoredUser);
  const [hasSession, setHasSession] = useState(!!readStoredUser());
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    setIsLoadingUser(hasSession && authUser === null);
  }, [hasSession, authUser]);

  const storeUser = (user: StubUser) => {
    localStorage.setItem(STUB_USER_KEY, JSON.stringify(user));
    setAuthUser(user);
    setHasSession(true);
  };

  const clearUser = () => {
    localStorage.removeItem(STUB_USER_KEY);
    setAuthUser(null);
    setHasSession(false);
  };

  const login = async (credential: string) => {
    const { data } = await UserService.auth(credential);
    if (!data?.id) return { ok: false, firstLogin: false };

    const firstLogin = !!data.first_login;
    setIsFirstLogin(firstLogin);
    storeUser({
      uid: data.id,
      displayName: data.name ?? null,
      email: data.email ?? null,
      photoURL: data.photo_path || null,
    });

    return { ok: true, firstLogin };
  };

  const logout = async () => {
    try {
      //o cookie e httpOnly: so o servidor consegue expira-lo
      await UserService.logout();
    } catch {
      //mesmo que a chamada falhe, o estado local tem que sair
    }
    clearUser();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        setIsLoggingIn,
        setIsFirstLogin,
        authUser,
        hasSession,
        isLoadingUser,
        isLoggingIn,
        isFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
