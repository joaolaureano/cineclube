import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

  const handleCredential = useCallback(
    async (credential: string) => {
      auth.setIsLoggingIn(true);
      try {
        const { ok, firstLogin } = await auth.loginWithGoogle(credential);
        if (!ok) throw new Error("Falha no login");

        openSnackbar("Login bem-sucedido", "success");
        auth.setIsLoggingIn(false);
        //firstLogin vem do retorno, e nao do estado: setState nao teria
        //aplicado ainda neste ponto
        return history.push(firstLogin ? "/signupPreferences" : "/home");
      } catch (err) {
        auth.setIsLoggingIn(false);
        openSnackbar("Login não foi realizado com sucesso", "error");
      }
    },
    [auth, history, openSnackbar]
  );

  useEffect(() => {
    if (!buttonRef.current) return;

    //o botao e renderizado pelo proprio Google: é ele quem abre o seletor de
    //conta e devolve o id_token, entao nao ha como imitá-lo com um div nosso
    renderGoogleButton(buttonRef.current, handleCredential).catch((err) => {
      setUnavailable((err as Error).message);
    });
  }, [handleCredential]);

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
