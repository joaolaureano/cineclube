export interface AuthenticatedUser {
  id: string;
  name: string;
  email?: string;
  photo_path?: string;
}

/**
 * AUTENTICAÇÃO PROVISÓRIA.
 *
 * O Firebase foi removido e ainda não há provedor de identidade no lugar. Este
 * verificador NÃO confere assinatura nenhuma: quem manda o header escolhe quem
 * quer ser. Não exponha esta API à internet enquanto ele estiver aqui.
 *
 * O formato é o payload de um JWT — JSON em base64url — de propósito: quando um
 * provedor de verdade entrar, só a verificação muda, o contrato com o
 * middleware e com os controllers continua o mesmo.
 */
const authenticateUser = async (
  authToken: string
): Promise<AuthenticatedUser> => {
  let payload: Partial<AuthenticatedUser>;

  try {
    payload = JSON.parse(Buffer.from(authToken, "base64url").toString("utf8"));
  } catch {
    //um token que não é payload codificado vale como o próprio id do usuário
    payload = { id: authToken };
  }

  if (!payload || !payload.id) {
    throw new Error("Token does not identify a user");
  }

  return {
    id: payload.id,
    name: payload.name ?? payload.id,
    email: payload.email,
    //app_user.photo_path é NOT NULL: um provedor que não devolva foto
    //quebraria o INSERT, como aconteceu na validação do primeiro deploy
    photo_path: payload.photo_path ?? "",
  };
};

export default { authenticateUser };
