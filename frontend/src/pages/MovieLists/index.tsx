import React, { useContext, useEffect, useState } from "react";
import { useHistory, RouteComponentProps } from "react-router-dom";

import {
  Container,
  IconButton,
  Paper,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core";

import { ArrowBack } from "@material-ui/icons";
import { MovieCard } from "./MovieCard";
import { MovieUserStatus } from "../../types/userMovieStatus";
import { UserMovie } from "../../types/UserMovie";
import UserService from "../../services/user";
import { SharedSnackbarContext } from "../../components/SnackBar/SnackContext";

import useStyles from "./styles";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { LikeModal } from "../../components/LikeModal";
import { Achievement } from "../../types/achievement";
import { AchievementDetails } from "../AchievementList/AchievementDetails";

interface Params {
  list: "watched" | "wantToWatch";
}

export const MovieLists = ({ match }: RouteComponentProps<Params>) => {
  const { openSnackbar, closeSnackbar } = useContext(SharedSnackbarContext);
  const history = useHistory();
  const styles = useStyles();

  const { list } = match.params;
  const defaultList = list === "watched" ? 1 : 0;
  const [currentTab, setCurrentTab] = useState(defaultList);
  const [watchedMovies, setWatchedMovies] = useState<UserMovie[]>([]);

  const [wantToWatchMovies, setWantToWatchMovies] = useState<UserMovie[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | undefined>();
  const [achievements, setAchievements] = useState({} as Achievement[]);
  useEffect(() => {
    async function getMovies() {
      try {
        const listDislikedResponse = await UserService.getMovieByStatus(
          MovieUserStatus.WATCHED_AND_DISLIKED
        );
        const listDisliked = listDislikedResponse.data;

        const listLikedResponse = await UserService.getMovieByStatus(
          MovieUserStatus.WATCHED_AND_LIKED
        );
        const listLiked = listLikedResponse.data;

        const listWantToWatchResponse = await UserService.getMovieByStatus(
          MovieUserStatus.WANT_TO_WATCH
        );
        const listWantToWatch = listWantToWatchResponse.data;

        const listWatched: UserMovie[] = [...listLiked, ...listDisliked];
        const listWantToWatchAux: UserMovie[] = [...listWantToWatch];

        setWantToWatchMovies(listWantToWatchAux);
        setWatchedMovies(listWatched);
      } catch (err) {
        openSnackbar("Ocorreu um erro!", "error");
      }
    }

    getMovies();
  }, []);

  const handleClickBack = () => {
    history.goBack();
  };

  const handleListChange = (event: React.ChangeEvent<{}>, tab: number) => {
    setCurrentTab(tab);
  };

  const handleLikeFromModal = async () => {
    const id = selectedMovieId;
    if (id) await handleLike(id);
    closeModal();
  };

  const handleLike = async (id: number) => {
    openSnackbar("Atualizando a lista...", "info");
    const response = await UserService.setMovieStatus({
      id: String(id),
      status: MovieUserStatus.WATCHED_AND_LIKED,
    });
    if (response.data.body) {
      setAchievements(response.data.body.achievements);
    }
    closeSnackbar();
    if (response.data.success) {
      if (currentTab === 0) {
        const movie = wantToWatchMovies.find((movie) => movie.movie_id === id);
        movie!.status = MovieUserStatus.WATCHED_AND_LIKED;
        setWatchedMovies([movie!, ...watchedMovies]);
        setWantToWatchMovies(
          wantToWatchMovies.filter((movie) => movie.movie_id !== id)
        );
      } else if (currentTab === 1) {
        const movie = watchedMovies.find((movie) => movie.movie_id === id);
        movie!.status = MovieUserStatus.WATCHED_AND_LIKED;
        setWatchedMovies([...watchedMovies]);
      }
    }
  };

  const handleDislikeFromModal = async () => {
    const id = selectedMovieId;
    if (id) await handleDislike(id);
    closeModal();
  };

  const handleDislike = async (id: number) => {
    openSnackbar("Atualizando a lista...", "info");
    const response = await UserService.setMovieStatus({
      id: String(id),
      status: MovieUserStatus.WATCHED_AND_DISLIKED,
    });
    if (response.data.body) {
      setAchievements(response.data.body.achievements);
    }
    closeSnackbar();
    if (response.data.success) {
      if (currentTab === 0) {
        const movie = wantToWatchMovies.find((movie) => movie.movie_id === id);
        movie!.status = MovieUserStatus.WATCHED_AND_DISLIKED;
        setWatchedMovies([movie!, ...watchedMovies]);
        setWantToWatchMovies(
          wantToWatchMovies.filter((movie) => movie.movie_id !== id)
        );
      } else if (currentTab === 1) {
        const movie = watchedMovies.find((movie) => movie.movie_id === id);
        movie!.status = MovieUserStatus.WATCHED_AND_DISLIKED;
        setWatchedMovies([...watchedMovies]);
      }
    }
  };

  const handleDelete = async () => {
    const id = selectedMovieId;
    const response = await UserService.setMovieStatus({
      id: String(id),
      status: MovieUserStatus.NONE,
    });
    if (response.data.success) {
      if (currentTab === 0) {
        setWantToWatchMovies(
          wantToWatchMovies.filter((movie) => movie.movie_id !== id)
        );
      } else if (currentTab === 1) {
        setWatchedMovies(
          watchedMovies.filter((movie) => movie.movie_id !== id)
        );
      }
      closeModal();
    }
  };

  const handleOpenDeleteModal = (movie_id: number) => {
    setSelectedMovieId(movie_id);
    setIsDeleteModalOpen(true);
  };

  const handleOpenLikeModal = (movie_id: number) => {
    setSelectedMovieId(movie_id);
    setIsLikeModalOpen(true);
  };

  const closeModal = () => {
    setIsDeleteModalOpen(false);
    setIsLikeModalOpen(false);
    setSelectedMovieId(undefined);
  };

  const renderWatchedMovies = () => {
    return watchedMovies.length > 0
      ? watchedMovies.map((movie: any) => {
          return (
            <MovieCard
              key={`watched-${movie.movie.id}`}
              type="watched"
              liked={movie.status === MovieUserStatus.WATCHED_AND_LIKED}
              onDelete={handleOpenDeleteModal}
              onLike={
                movie.status === MovieUserStatus.WATCHED_AND_LIKED
                  ? () => {}
                  : handleLike
              }
              onDislike={
                movie.status === MovieUserStatus.WATCHED_AND_LIKED
                  ? handleDislike
                  : () => {}
              }
              movie={{
                id: movie.movie.id,
                title: movie.movie.title,
                path_banner: movie.movie.path_banner,
                platforms: movie.movie.platforms,
              }}
            />
          );
        })
      : null;
  };

  const renderWantToWatchMovies = () => {
    return wantToWatchMovies.length > 0
      ? wantToWatchMovies.map((movie: any) => {
          return (
            <MovieCard
              key={`wanted-${movie.movie.id}`}
              type="wantsToWatch"
              onDelete={handleOpenDeleteModal}
              onWatch={handleOpenLikeModal}
              movie={{
                id: movie.movie.id,
                title: movie.movie.title,
                path_banner: movie.movie.path_banner,
                platforms: movie.movie.platforms,
              }}
            />
          );
        })
      : null;
  };
  const handleCloseAchievementDetails = () => {
    setAchievements(achievements.slice(1, achievements.length));
  };
  return (
    <div className={styles.root}>
      <AchievementDetails
        visible={achievements.length > 0}
        achievement={achievements[0]}
        onClose={handleCloseAchievementDetails}
      />
      <Container className={styles.container}>
        <header className={styles.header}>
          <IconButton className={styles.backIcon} onClick={handleClickBack}>
            <ArrowBack fontSize="large" />
          </IconButton>
          <Typography className={styles.pageTitle} variant="h5">
            Minhas Listas
          </Typography>
        </header>

        <Paper elevation={0} className={styles.tabsContainer}>
          <Tabs
            className={styles.tabs}
            value={currentTab}
            onChange={handleListChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab className={styles.tab} tabIndex={0} label="Quero Assistir" />
            <Tab className={styles.tab} tabIndex={1} label="Já vi" />
          </Tabs>
        </Paper>

        <div className={styles.movieList}>
          {currentTab === 0 ? renderWantToWatchMovies() : renderWatchedMovies()}
        </div>
      </Container>
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        confirm={handleDelete}
        deny={() => {
          closeModal();
        }}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      />
      <LikeModal
        open={isLikeModalOpen}
        like={handleLikeFromModal}
        dislike={handleDislikeFromModal}
        onClose={() => {
          closeModal();
        }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      />
    </div>
  );
};
