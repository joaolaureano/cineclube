import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Container, IconButton, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { AchievementCard } from "./AchievementCard";
import { AchievementDetails } from "./AchievementDetails";
import AchievementService from "../../services/achievement";
import { Achievement } from "../../types/achievement";

import useStyles from "./styles";

export const AchievementList = () => {
  const [isAchievementOpen, setIsAchievementOpen] = useState(false);
  const [selectedAchievement, setselectedAchievement] = useState<
    Achievement | undefined
  >();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const history = useHistory();
  const styles = useStyles();

  useEffect(() => {
    const fetchUserAchievements = async () => {
      const response = await AchievementService.getUserAchievements();

      const achievements: Achievement[] = response.data;
      setAchievements(achievements);
    };

    fetchUserAchievements();
  }, []);

  const handleClickBack = () => {
    history.goBack();
  };

  const handleCloseAchievementDetails = () => {
    setselectedAchievement(undefined);
    setIsAchievementOpen(false);
  };

  const handleClickAchievement = (achievement: Achievement) => {
    setselectedAchievement(achievement);
    setIsAchievementOpen(true);
  };

  const renderAchievements = () => {
    return achievements.map((achievement) => {
      return (
        <AchievementCard
          onClick={handleClickAchievement}
          achievement={achievement}
        />
      );
    });
  };

  return (
    <div className={styles.root}>
      <Container className={styles.container}>
        <header className={styles.header}>
          <IconButton className={styles.backIcon} onClick={handleClickBack}>
            <ArrowBack fontSize="large" />
          </IconButton>
          <Typography className={styles.pageTitle} variant="h5">
            Conquistas
          </Typography>
        </header>
        <div className={styles.achievementList}>{renderAchievements()}</div>
      </Container>
      <AchievementDetails
        visible={isAchievementOpen}
        achievement={selectedAchievement}
        onClose={handleCloseAchievementDetails}
      />
    </div>
  );
};
