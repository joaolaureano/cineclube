/**
 * Carrega o Google Identity Services e pede um id_token ao usuario.
 *
 * O GIS entrega o id_token direto ao navegador, entao nao ha client secret nem
 * callback no servidor para manter. O token nao vale nada por si: quem decide
 * se ele presta e o backend, conferindo a assinatura do Google.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";

interface CredentialResponse {
  credential?: string;
}

interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        challenge?: string;
      }) => void;
      prompt: (
        listener?: (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
        }) => void
      ) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, unknown>
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

let loader: Promise<GoogleAccounts> | null = null;

const loadGis = (): Promise<GoogleAccounts> => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${GIS_SRC}"]`
      );
      const script = existing ?? document.createElement("script");

      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) resolve(window.google);
        else reject(new Error("Google Identity Services nao inicializou"));
      };
      script.onerror = () => {
        //sem isso uma falha de rede deixaria a promise em cache para sempre e
        //nenhuma tentativa seguinte de login voltaria a carregar o script
        loader = null;
        reject(
          new Error("Nao foi possivel carregar o Google Identity Services")
        );
      };

      if (!existing) document.head.appendChild(script);
    });
  }

  return loader;
};

export const getClientId = (): string =>
  process.env.REACT_APP_GOOGLE_CLIENT_ID ?? "";

/**
 * Abre o seletor de conta do Google e resolve com o id_token.
 *
 * O botao renderizado pelo proprio GIS e o caminho suportado: o One Tap sozinho
 * pode ser suprimido pelo navegador sem aviso, e ai o login travaria em
 * silencio.
 */
export const renderGoogleButton = async (
  parent: HTMLElement,
  onCredential: (credential: string) => void
): Promise<void> => {
  const clientId = getClientId();
  if (!clientId) throw new Error("REACT_APP_GOOGLE_CLIENT_ID nao configurado");

  const google = await loadGis();

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) onCredential(response.credential);
    },
  });

  google.accounts.id.renderButton(parent, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    locale: "pt-BR",
    //400 e o maximo que o GIS aceita; o GoogleButton anterior ocupava a
    //largura do wrapper, entao quanto mais largo, mais perto do que era
    width: 400,
  });
};
