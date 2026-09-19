import React from "react";
import { useHistory } from "react-router-dom";
import useStyles from "./styles";
import { Container, Typography } from "@material-ui/core";
import { Divider } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const Credits = (): JSX.Element => {
  const history = useHistory();
  const styles = useStyles();

  const backToMenu = () => {
    history.push("/home");
  };

  return (
    <div className={styles.root}>
      <Container className={styles.header}>
        <div className={styles.backIconContainer} onClick={backToMenu}>
          <ArrowBack fontSize="large" />
        </div>
        <div className={styles.textContainer}>
          <Typography variant="h5" component="h1" className={styles.title}>
            CRÉDITOS
          </Typography>
        </div>
        {/* <Divider variant="middle" className={styles.divider} /> */}
      </Container>

      <Container className={styles.contentWrapper}>
        <Container>
          <Typography
            variant="h6"
            component="h2"
            className={styles.coontentHeader}
          >
            O grupo Cinehal agradece a equipe de desenvolvimento
          </Typography>
        </Container>

        <Container>
          <Container>
            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.listHeader}
              >
                Ages 1
              </Typography>
            </Container>

            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Alexya Silva Rocha de Oliveira
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Bruno Breyer Garcia
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Henrique Derlam Zwetsche
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Leonardo José Machado Canto
              </Typography>
            </Container>
          </Container>
          <Divider variant="middle" className={styles.divider} />
          <Container>
            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.listHeader}
              >
                Ages 2
              </Typography>
            </Container>

            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Augusto César Bottega Agostini
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Lucas Dimer Justo
              </Typography>
            </Container>
          </Container>
          <Divider variant="middle" className={styles.divider} />
          <Container>
            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.listHeader}
              >
                Ages 3
              </Typography>
            </Container>

            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                João Pedro Laureano
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Pâmela Mendonça Barreto
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Patrick Mazzuco Flores
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Eduardo Schweitzer Nunes da Silva
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Gabriel Ferreira Kurtz
              </Typography>
            </Container>
          </Container>
          <Divider variant="middle" className={styles.divider} />
          <Container>
            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.listHeader}
              >
                Ages 4
              </Typography>
            </Container>

            <Container>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Chiara Girardi Paskulin
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Alexandre Scheer Bing
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                className={styles.paragraph}
              >
                Matheus Lima Ferreira
              </Typography>
            </Container>
          </Container>
        </Container>
      </Container>
    </div>
  );
};

export default Credits;
