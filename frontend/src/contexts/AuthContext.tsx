import React, { createContext, useCallback, useEffect, useState } from "react";

import UserService from "../services/user";

/**
 * A sessao vive num cookie httpOnly emitido pelo backend: o JavaScript da
 * pagina nao a le nem a escreve, que e justamente a protecao contra XSS que o
 * localStorage nao dava. Aqui so guardamos o perfil exibido na interface.
 *
 * A forma do AuthUser imita a do firebase.User nos campos que as telas usam
 * (displayName, email, photoURL) para que nenhuma pagina precise mudar.
 */
export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const PROFILE_KEY = "authUser";

const readStoredProfile = (): AuthUser | null => {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

interface AuthContextData {
  //devolve firstLogin em vez de so um booleano de sucesso: quem chama precisa
  //rotear na hora, e ler isFirstLogin do estado logo apos o setState traria o
  //valor antigo
  loginWithGoogle: (
    credential: string
  ) => Promise<{ ok: boolean; firstLogin: boolean }>;
  logout: () => Promise<boolean>;
  setIsLoggingIn: (value: boolean) => void;
  setIsFirstLogin: (value: boolean) => void;
  authUser: AuthUser | null;
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
  const [authUser, setAuthUser] = useState<AuthUser | null>(readStoredProfile);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  //o perfil em cache diz que houve login, mas so o backend sabe se o cookie
  //ainda vale; hasSession e otimista e o 401 do interceptor corrige
  const hasSession = authUser !== null;

  useEffect(() => {
    if (authUser) localStorage.setItem(PROFILE_KEY, JSON.stringify(authUser));
    else localStorage.removeItem(PROFILE_KEY);
  }, [authUser]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoadingUser(true);
    try {
      const response = await UserService.auth(credential);
      const body = response.data;
      const user = body?.body?.user;
      if (!user) return { ok: false, firstLogin: false };

      const firstLogin = !!body.firstLogin;
      setIsFirstLogin(firstLogin);
      setAuthUser({
        uid: user.id,
        displayName: user.name ?? null,
        email: null,
        photoURL: user.photo_path || null,
      });
      return { ok: true, firstLogin };
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      //o cookie e httpOnly: so o servidor consegue expira-lo
      await UserService.logout();
    } catch {
      //mesmo que a chamada falhe, o estado local tem que sair
    }
    localStorage.removeItem(PROFILE_KEY);
    setAuthUser(null);
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loginWithGoogle,
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
