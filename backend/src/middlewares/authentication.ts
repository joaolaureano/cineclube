import express from "express";
import { UserService } from "../services";

import AuthService, {
  SESSION_COOKIE,
  UnauthorizedError,
} from "../services/AuthService";

/**
 * A sessao chega por cookie httpOnly, nao mais por um payload que o cliente
 * monta: assim nenhum script da pagina consegue le-la, e o conteudo so vale se
 * a assinatura conferir. bearerLogin saiu porque /user/auth deixou de exigir
 * sessao - e ele que a cria.
 */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName == "bearer") {
    const token = readSessionToken(request);
    if (token) {
      const user = await getUserDataFromToken(token);
      const existingUser = await UserService.findUserById(user.id);
      if (!existingUser)
        return Promise.reject(
          new UnauthorizedError("User does not exist in database.")
        );

      return Promise.resolve(user);
    }
    return Promise.reject(new UnauthorizedError("No session"));
  }

  //resolver undefined aqui faria o tsoa tratar a requisição como autenticada
  return Promise.reject(
    new Error(`Unknown security definition: ${securityName}`)
  );
}

async function getUserDataFromToken(token: string) {
  try {
    return await AuthService.verifySession(token);
  } catch {
    //assinatura invalida e sessao expirada sao a mesma coisa para quem chama;
    //distinguir so ajudaria quem esta sondando
    throw new UnauthorizedError("Invalid session");
  }
}

function readSessionToken(request: express.Request): string | undefined {
  const fromCookie = (request.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  if (fromCookie) return fromCookie;

  //o Authorization segue aceito para uso programatico (testes, curl); o que
  //mudou e que agora ele precisa carregar uma sessao assinada por nos
  const token = request.headers["authorization"];
  if (!token) return undefined;

  return token.startsWith("Bearer ") ? token.split("Bearer ")[1] : token;
}
