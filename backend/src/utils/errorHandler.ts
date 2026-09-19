import { Response, Request, NextFunction } from "express";
import { ValidateError } from "tsoa";

import { UnauthorizedError } from "../services/AuthService";

//o quarto parâmetro é o que faz o express reconhecer isto como error handler,
//mesmo sem ser usado
export function errorhandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    return res.status(err.status).json({ ...err, success: false });
  }

  //sessao ausente, invalida ou expirada e 401: o cliente precisa distinguir
  //isso de indisponibilidade para saber que deve mandar o usuario logar
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      message: "Unauthorized",
      errorMessage: err.message,
      success: false,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
      errorMessage: err.message,
      success: false,
    });
  }

  //um valor lançado que não é Error ainda precisa virar resposta, senão a
  //requisição fica pendurada
  return res.status(500).json({
    message: "Internal Server Error",
    success: false,
  });
}
