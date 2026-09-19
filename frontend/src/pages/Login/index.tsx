import React, { useContext } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { Typography, Container } from "@material-ui/core";
import { GoogleButton } from "../../components/GoogleButton";
import { SharedSnackbarContext } from "../../components/SnackBar/SnackContext";
import { AuthContext } from "../../contexts/AuthContext";
import UserService from "../../services/user";
import logoImg from "../../assets/images/logos/login-logo.png";
import useStyles from "./styles";

const Login = (): JSX.Element => {
  const history = useHistory();
  const styles = useStyles();
  const auth = useContext(AuthContext);
  const { openSnackbar } = useContext(SharedSnackbarContext);

  const handleLogin = async () => {
    auth.setIsLoggingIn(true);
    console.log("here");
    const token = await auth.login();

    try {
      if (token) {
        const loginResponse = await UserService.auth();
        const user = loginResponse.data;
        if (user) {
          auth.setIsFirstLogin(!!user.first_login);
          openSnackbar("Login bem-sucedido", "success");
          if (user.first_login) {
            auth.setIsLoggingIn(false);
            return history.push("/signupPreferences");
          } else {
            auth.setIsLoggingIn(false);
            return history.push("/home");
          }
        }

        throw new Error("Falha no login");
      }
    } catch (err) {
      openSnackbar("Login não foi realizado com sucesso", "error");
    }
  };

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
              <GoogleButton onClick={handleLogin}>
                Continuar com Google
              </GoogleButton>
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default Login;
