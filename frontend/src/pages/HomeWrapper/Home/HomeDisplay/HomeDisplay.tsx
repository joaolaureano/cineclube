import React, { useEffect } from "react";
import { AppBar, Divider, Container, IconButton } from "@material-ui/core";

import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import useStyles from "./styles";
import { Movie, RecommendedMovieMessage } from "../../../../types/movie";
import { MovieStateLogic } from "../Home";
import { LikeModal } from "../../../../components/LikeModal";
import { MessageModal } from "../../../../components/MessageModal";
import { PlatformIcon } from "../../../../components/PlatformIcon";
import TemporaryDrawer from "../../../../components/Menu";
import logoImg from "../../../../assets/images/logos/home-logo.png";
import { CustomIcon } from "../../../../components/CustomIcon";
import { Achievement } from "../../../../types/achievement";
import { AchievementDetails } from "../../../AchievementList/AchievementDetails";
import { Tutorial } from "../../Tutorial/Tutorial";

interface HomeDisplayProps {
  movie: Movie;
  logic: MovieStateLogic;
  modalLiked: boolean;
  modalRecommendedMovie: boolean;
  recommendedMovie?: RecommendedMovieMessage;
  achievements: Achievement[];
  closeAchievement: () => void;
}

export const HomeDisplay: React.FC<HomeDisplayProps> = (props) => {
  const classes = useStyles();
  const { movie, logic, modalLiked, achievements, closeAchievement } = props;
  useEffect(() => {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }, [movie]);
  const renderMovie = () => {
    return (
      <Container className={classes.content}>
        <img
          src={movie.path_banner}
          alt="movie cover"
          className={classes.cover}
        />
        <div className={classes.movieInfo}>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            className={classes.movieTitle}
          >
            {movie.title}
          </Typography>
          <Typography
            className={classes.original_title}
            gutterBottom
            variant="body1"
            component="p"
          >
            {`(${movie.original_title})`}
          </Typography>
          <Typography
            className={classes.year}
            gutterBottom
            variant="body1"
            component="p"
          >
            {movie.year}
          </Typography>
          <Typography
            className={classes.duration}
            variant="caption"
            display="block"
            gutterBottom
          >
            {`${movie.duration} MIN`}
          </Typography>
          <Typography
            className={classes.synopsis}
            variant="body1"
            color="textPrimary"
            component="p"
          >
            {movie.critic}
          </Typography>
          <AvatarGroup className={classes.platforms}>
            {movie.platforms.map(({ name }) => {
              return (
                <PlatformIcon
                  key={name}
                  className={classes.platform}
                  variant="rounded"
                  platform={name}
                />
              );
            })}
          </AvatarGroup>

          <div>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.cast}
            >
              Direção:&nbsp;
            </Typography>
            <Typography className={[classes.cast, classes.castNames].join(" ")}>
              {movie.director}
            </Typography>
          </div>

          <div>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.cast}
            >
              Elenco principal:&nbsp;
            </Typography>
            <Typography className={[classes.cast, classes.castNames].join(" ")}>
              {movie.actors.join(", ")}
            </Typography>
          </div>

          <div className={classes.synopsisContainer}>
            <Typography
              variant="body1"
              color="textPrimary"
              className={classes.synopsis}
            >
              Sinopse:
            </Typography>
            <Typography
              className={classes.synopsis}
              variant="body1"
              color="textPrimary"
            >
              {movie.synopsis}
            </Typography>
          </div>

          <div className={classes.tags}>
            {movie.movies_tags.map(({ tag }) => {
              return (
                <Chip
                  variant="outlined"
                  size="small"
                  label={tag.name}
                  key={tag.name}
                  className={classes.tag}
                  icon={<FiberManualRecordIcon />}
                />
              );
            })}
          </div>
        </div>
      </Container>
    );
  };

  return (
    <div className={classes.root}>
      <AchievementDetails
        visible={achievements.length > 0}
        achievement={achievements[0]}
        onClose={closeAchievement}
      />
      <Tutorial />
      <Container className={classes.container}>
        {/* Botão Menu */}
        <div className={classes.topMenu}>
          <img src={logoImg} alt="Cinehal logo" className={classes.logo} />
          <div className={classes.sideIcon}>
            <span onClick={logic.functions.handleClickGoToFilterPage}>
              <CustomIcon type="menuFilters" />
            </span>
            <TemporaryDrawer />
          </div>
        </div>

        {/* Conteudo do Filme */}
        {movie ? (
          renderMovie()
        ) : (
          <div className={classes.listEndContainer}>
            <Typography variant="h5" className={classes.listEndMessage}>
              Você chegou ao fim da lista de filmes.
            </Typography>
          </div>
        )}

        {/* Botoes do Tinder */}
        <AppBar position="fixed" color="transparent" className={classes.appBar}>
          <div className={classes.bottomMenu}>
            <IconButton
              onClick={logic.functions.handleClickUndoLastAction}
              aria-label="undo"
              color="primary"
            >
              <CustomIcon type="undo" />
            </IconButton>
            <Divider
              className={classes.menuDivider}
              orientation="vertical"
              flexItem
            />
            <IconButton
              onClick={
                movie ? logic.functions.handleClickDontWantToWatch : () => {}
              }
              aria-label="dislike"
              color="primary"
            >
              <CustomIcon type="dontWantToWatch" />
            </IconButton>
            <Divider
              className={classes.menuDivider}
              orientation="vertical"
              flexItem
            />
            <IconButton
              onClick={movie ? logic.functions.handleClickWantoWatch : () => {}}
              aria-label="like"
              color="primary"
            >
              <CustomIcon type="wantToWatch" />
            </IconButton>
            <Divider
              className={classes.menuDivider}
              orientation="vertical"
              flexItem
            />
            <IconButton
              onClick={movie ? logic.functions.handleClickWatched : () => {}}
              aria-label="star"
              color="primary"
            >
              <CustomIcon type="watched" />
            </IconButton>
            <LikeModal
              open={modalLiked}
              like={logic.functions.handleClickLikedMovie}
              dislike={logic.functions.handleClickDislikedMovie}
              onClose={logic.functions.handleCloseModal}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
            />
            {props.modalRecommendedMovie && (
              <MessageModal
                movie={{
                  platform: props.recommendedMovie!.platform,
                  size_list: props.recommendedMovie!.size_list,
                  title: props.recommendedMovie!.title,
                }}
                open={props.modalRecommendedMovie}
                onClose={logic.functions.handleCloseModalRecommend}
              />
            )}
          </div>
        </AppBar>
      </Container>
    </div>
  );
};
