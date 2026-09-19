import React, { useContext, useEffect, useRef, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { Typography, Container } from "@material-ui/core";
import { SharedSnackbarContext } from "../../components/SnackBar/SnackContext";
import { AuthContext } from "../../contexts/AuthContext";
import { renderGoogleButton } from "../../services/googleIdentity";
import logoImg from "../../assets/images/logos/login-logo.png";
import useStyles from "./styles";

const Login = (): JSX.Element => {
  const history = useHistory();
  const styles = useStyles();
  const auth = useContext(AuthContext);
  const { openSnackbar } = useContext(SharedSnackbarContext);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  //o credential chega do Google, nao de um clique nosso: e por isso que o
  //handler virou callback do botao em vez de onClick
  const handleLogin = async (credential: string) => {
    auth.setIsLoggingIn(true);

    try {
      const result = await auth.login(credential);

      if (result?.ok) {
        openSnackbar("Login bem-sucedido", "success");
        auth.setIsLoggingIn(false);
        //firstLogin vem do retorno: o estado so aplica no proximo render
        if (result.firstLogin) {
          return history.push("/signupPreferences");
        }
        return history.push("/home");
      }

      throw new Error("Falha no login");
    } catch (err) {
      auth.setIsLoggingIn(false);
      openSnackbar("Login não foi realizado com sucesso", "error");
    }
  };

  useEffect(() => {
    if (!buttonRef.current) return;

    //quem desenha o botao e o Google: e ele que abre o seletor de conta e
    //devolve o id_token assinado, entao nao da para imitá-lo com um div nosso
    renderGoogleButton(buttonRef.current, handleLogin).catch((err) => {
      setUnavailable((err as Error).message);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {auth.hasSession && !auth.isLoggingIn ? (
        <Redirect to="/home" />
      ) : (
        <div className={styles.container}>
          <header className={styles.header}>
            <img src={logoImg} alt="Cinehal logo" className={styles.logo} />
          </header>

          <Container className={styles.root}>
            <div className={styles.loginWrapper}>
              <Typography
                className={styles.subTitle}
                align="center"
                variant="h5"
                color="textPrimary"
              >
                Faça seu login ou crie seu cadastro com sua conta do Google.
              </Typography>

              <div ref={buttonRef} />

              {unavailable && (
                <Typography align="center" variant="body2" color="error">
                  Login indisponível no momento: {unavailable}
                </Typography>
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default Login;
