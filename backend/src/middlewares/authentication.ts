import express from "express";
import { UserService } from "../services";

import AuthService, {
  SESSION_COOKIE,
  UnauthorizedError,
} from "../services/AuthService";

/**
 * A sessao chega por cookie httpOnly, nao por header: assim nenhum script da
 * pagina consegue le-la, que e o furo do localStorage. SPA e API sao servidas
 * pelo mesmo dominio no CloudFront, entao o cookie viaja sozinho, sem CORS.
 */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName !== "bearer") {
    //resolver undefined aqui faria o tsoa tratar a requisição como autenticada
    return Promise.reject(
      new Error(`Unknown security definition: ${securityName}`)
    );
  }

  const token = readSessionToken(request);
  if (!token) return Promise.reject(new UnauthorizedError("No session"));

  let user;
  try {
    user = await AuthService.verifySession(token);
  } catch {
    //assinatura invalida ou sessao expirada sao a mesma coisa para quem chama:
    //a sessao nao vale, e detalhar qual dos dois so ajudaria quem esta testando
    return Promise.reject(new UnauthorizedError("Invalid session"));
  }

  const existingUser = await UserService.findUserById(user.id);
  if (!existingUser) {
    return Promise.reject(
      new UnauthorizedError("User does not exist in database.")
    );
  }

  return user;
}

const readSessionToken = (request: express.Request): string | undefined => {
  const fromCookie = (request.cookies as Record<string, string> | undefined)?.[
    SESSION_COOKIE
  ];
  if (fromCookie) return fromCookie;

  //o Authorization continua aceito para uso programatico (testes, curl); o que
  //mudou e que agora ele precisa carregar uma sessao assinada por nos
  const header = request.headers["authorization"];
  if (!header) return undefined;

  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : header;
};
