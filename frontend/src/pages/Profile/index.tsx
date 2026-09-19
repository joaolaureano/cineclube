import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { Container, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { useState } from "react";
import { Divider } from "@material-ui/core";
import { LogoutButton } from "../../components/LogoutButton";
import { SharedSnackbarContext } from "../../components/SnackBar/SnackContext";
import { AuthContext } from "../../contexts/AuthContext";

import useStyles from "./styles";

const Profile = (): JSX.Element => {
  const history = useHistory();
  const styles = useStyles();
  const auth = useContext(AuthContext);

  const { openSnackbar } = useContext(SharedSnackbarContext);

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const backToMenu = () => {
    history.push("/home");
  };

  const logout = async () => {
    if (await auth.logout()) {
      openSnackbar("Logout bem-sucedido", "success");
      history.push("/");
    } else {
      openSnackbar("Logout não foi realizado", "failure");
    }
  };

  useEffect(() => {
    const user = auth.authUser;
    if (user) {
      if (user.photoURL) setPhotoUrl(user.photoURL);
      if (user.displayName) setUserName(user.displayName);
      if (user.email) setUserEmail(user.email);
    }
  }, []);

  return (
    <div className={styles.root}>
      <Container className={styles.header}>
        <div className={styles.backIconContainer} onClick={backToMenu}>
          <ArrowBack fontSize="large" />
        </div>
        <div className={styles.textContainer}>
          <Typography variant="h5" component="h1" className={styles.title}>
            Perfil
          </Typography>
        </div>
      </Container>
      <Container className={styles.photoWrapper}>
        <img src={photoUrl} />
      </Container>
      <Container className={styles.contentWrapper}>
        <Typography
          className={styles.profileInfo}
          variant="body1"
          color="textPrimary"
          component="p"
        >
          {userName}
        </Typography>
        <Divider variant="middle" className={styles.divider} />
        <Typography
          className={styles.profileInfo}
          variant="body1"
          color="textPrimary"
          component="p"
        >
          {userEmail}
        </Typography>
        <Divider variant="middle" className={styles.divider} />
        <Container className={styles.logoutButton}>
          <LogoutButton onClick={logout}>{"Logout"}</LogoutButton>
        </Container>
      </Container>
    </div>
  );
};

export default Profile;
