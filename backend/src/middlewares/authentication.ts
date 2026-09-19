import express from "express";
import { UserService } from "../services";

import AuthService from "../services/AuthService";

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName == "bearer") {
    const token = request.headers["authorization"];
    if (token) {
      const user = await getUserDataFromToken(token);
      const existingUser = await UserService.findUserById(user.id);
      if (!existingUser)
        return Promise.reject(new Error("User does not exist in database."));

      return Promise.resolve(user);
    }
    return Promise.reject(new Error("No token provided"));
  }

  if (securityName == "bearerLogin") {
    const token = request.headers["authorization"];
    if (token) {
      const user = await getUserDataFromToken(token);
      return Promise.resolve(user);
    }
    return Promise.reject(new Error("No token provided"));
  }

  //resolver undefined aqui faria o tsoa tratar a requisição como autenticada
  return Promise.reject(
    new Error(`Unknown security definition: ${securityName}`)
  );
}

async function getUserDataFromToken(token: string) {
  const parsedToken = token.startsWith("Bearer ")
    ? token.split("Bearer ")[1]
    : token;
  const user = await AuthService.authenticateUser(parsedToken);
  return user;
}
