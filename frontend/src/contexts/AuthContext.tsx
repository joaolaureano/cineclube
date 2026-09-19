import React, { createContext, useEffect, useState } from "react";

/**
 * AUTENTICACAO PROVISORIA.
 *
 * O Firebase foi removido e ainda nao ha provedor de identidade no lugar. O
 * token e apenas um payload JSON em base64url, sem assinatura: o backend le os
 * campos e confia neles. Qualquer um forja qualquer identidade.
 *
 * A forma do StubUser imita a do firebase.User nos campos que as telas usam
 * (displayName, email, photoURL) para que nenhuma pagina precise mudar agora,
 * nem de novo quando um provedor de verdade entrar.
 */
export interface StubUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const STUB_USER_KEY = "stubUser";

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const buildToken = (user: StubUser) =>
  toBase64Url(
    JSON.stringify({
      id: user.uid,
      name: user.displayName ?? user.uid,
      email: user.email ?? undefined,
      photo_path: user.photoURL ?? "",
    })
  );

const readStoredUser = (): StubUser | null => {
  const raw = localStorage.getItem(STUB_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StubUser;
  } catch {
    return null;
  }
};

const createStubUser = (): StubUser => {
  const uid = `convidado-${Math.random().toString(36).slice(2, 10)}`;
  return {
    uid,
    displayName: "Convidado",
    email: `${uid}@example.invalid`,
    photoURL: "",
  };
};

interface AuthContextData {
  login: () => Promise<string | undefined>;
  logout: () => Promise<boolean | undefined>;
  getToken: () => Promise<string | undefined>;
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
  const [hasSession, setHasSession] = useState(!!localStorage.getItem("token"));
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    setIsLoadingUser(hasSession && authUser === null);
  }, [hasSession, authUser]);

  const setToken = (token?: string) => {
    if (token) {
      localStorage.setItem("token", token);
      setHasSession(true);
    }
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    setHasSession(false);
  };

  const login = async () => {
    //a identidade e reaproveitada entre sessoes, senao cada login criaria um
    //usuario novo no banco
    const user = readStoredUser() ?? createStubUser();
    localStorage.setItem(STUB_USER_KEY, JSON.stringify(user));
    setAuthUser(user);

    const token = buildToken(user);
    setToken(token);
    return token;
  };

  const logout = async () => {
    removeToken();
    localStorage.clear();
    setAuthUser(null);
    return true;
  };

  const getToken = async () => {
    if (!authUser) return undefined;
    const token = buildToken(authUser);
    setToken(token);
    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        getToken,
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
