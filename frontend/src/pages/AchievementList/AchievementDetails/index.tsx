import React, { useEffect } from "react";
import { Container, IconButton, Typography } from "@material-ui/core";

import useStyles from "./styles";
import { ArrowBack } from "@material-ui/icons";
import { Achievement } from "../../../types/achievement";

interface AchievementDetailsProps {
  achievement?: Achievement;
  visible?: boolean;
  onClose: () => void;
}

export const AchievementDetails = (
  props: AchievementDetailsProps
): JSX.Element => {
  const styles = useStyles();

  useEffect(() => {
    document.body.style.overflow = props.visible ? "hidden" : "";
  });

  const handleClose = () => {
    props.onClose();
  };

  return (
    <>
      {props.visible && (
        <div className={styles.root}>
          <Container className={styles.container}>
            <header className={styles.header}>
              <IconButton className={styles.backIcon} onClick={handleClose}>
                <ArrowBack fontSize="large" />
              </IconButton>
            </header>
            <div className={styles.content}>
              <Typography
                className={styles.achievementTitle}
                variant="h3"
                component="h2"
              >
                {props.achievement?.title}
              </Typography>

              <Typography
                className={styles.achievementDescription}
                variant="h3"
                component="h2"
              >
                {props.achievement?.description}
              </Typography>
              <div className={styles.imageWrapper}>
                <img
                  className={styles.image}
                  src={props.achievement?.path_image}
                  alt={props.achievement?.description}
                />
              </div>
              <div className={styles.achievementList}></div>
            </div>
          </Container>
        </div>
      )}
    </>
  );
};
