import { useHistory } from "react-router-dom";
import { MovieMap, MovieState } from "../../types/movie";
import { SharedSnackbarContext } from "../../components/SnackBar/SnackContext";
import { AuthContext } from "../../contexts/AuthContext";
import { Home } from "./Home/Home";
import MovieService from "../../services/movies";
import { useContext, useEffect, useState } from "react";
import { Spinner } from "../../components/Spinner";

export const HomeWrapper: React.FC = () => {
  const [movieState, setMovieState] = useState({} as MovieState);
  const { openSnackbar } = useContext(SharedSnackbarContext);
  const history = useHistory();
  const auth = useContext(AuthContext);

  const getMovieList = async (selectedMovieIndex: number = 0) => {
    const response = await MovieService.get();
    const { movie_ids, movies } = response.data;

    const currentMovieIds =
      selectedMovieIndex === 0
        ? []
        : movieState.movie_ids.splice(0, selectedMovieIndex);

    const currentMovies: MovieMap = {};
    currentMovieIds.forEach((movie_id) => {
      currentMovies[movie_id] = movieState.movies[movie_id];
    });

    const finalMovieIds = [...currentMovieIds, ...movie_ids];
    const finalMovies = { ...currentMovies, ...movies };

    setMovieState({
      movie_ids: finalMovieIds,
      movies: finalMovies,
      selectedMovieIndex,
    });
  };

  useEffect(() => {
    const setMovieList = async () => {
      try {
        await getMovieList();
      } catch (err) {
        const error = err as Error;
        console.log(error.message);
        openSnackbar("Erro ao buscar a lista de filmes recomendados.", "error");
        if (error.message === "User does not exist in database.")
          return await auth.logout();
        history.push("/");
      }
    };

    setMovieList();
  }, []);

  return (
    <>
      {movieState.movies ? (
        <Home state={movieState} updateMovieList={getMovieList} />
      ) : (
        <Spinner />
      )}
    </>
  );
  // TODO: Aqui pode ficar um componente de "Loading" enquanto acessa a API
  // TODO: Pode ficar aqui tambem um componente de "Erro" se falhar o GET
};
