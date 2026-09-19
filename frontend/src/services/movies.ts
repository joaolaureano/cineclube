import { AxiosResponse } from "axios";
import api from "../api/api";
import { Movie, MovieDto, MovieMap, MovieState, CastDto } from "../types/movie";

const INTERVAL_BETWEEN_RANDOM = 6;

const movies = {
  get: async (): Promise<AxiosResponse<MovieState>> => {
    const filters = JSON.parse(localStorage.getItem("filters") as string);
    const joined_tags = filters?.tags.join(",");
    const joined_platforms = filters?.platforms.join(",");

    const response = await api.get("/movies", {
      transformResponse: composeMovieState,
      params: {
        tags: joined_tags,
        platforms: joined_platforms,
      },
    });

    return response;
  },
  // put: (payload: PutMoviePayload) => {
  //   return api.put("/movies", payload);
  // },
};

const mapMovieDtoToMovie = (movieDto: MovieDto): Movie => {
  let movie: Movie = {
    id: movieDto.id,
    title: movieDto.title,
    original_title: movieDto.original_title,
    synopsis: movieDto.synopsis,
    critic: movieDto.critic,
    curator: movieDto.curator,
    year: movieDto.year,
    path_banner: movieDto.path_banner,
    platforms: movieDto.platforms,
    movies_tags: movieDto.movies_tags,
    duration: movieDto.duration,
    director: "",
    actors: [],
  };

  movieDto.cast.forEach((cast: CastDto) => {
    if (cast.director) {
      movie.director = cast.actor.name;
    } else {
      movie.actors.push(cast.actor.name);
    }
  });

  return movie;
};

const composeMovieState = (data: string): MovieState => {
  const response = JSON.parse(data);

  if (!response.success) {
    throw new Error(response.errorMessage);
  }

  const movies: MovieMap = {};
  const movie_ids: number[] = [];
  if (response.body) {
    const moviesResponse = response.body.movies;
    moviesResponse.forEach((movieDto: MovieDto) => {
      const movie: Movie = mapMovieDtoToMovie(movieDto);
      movies[movie.id] = movie;
      movie_ids.push(movie.id);
    });
  }
  const selectedMovieIndex = 0;
  return {
    movies,
    movie_ids: reorderWithRandom(movie_ids),
    selectedMovieIndex,
  };
};

const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const reorderWithRandom = (movie_ids: number[]) => {
  let i = 0;

  let newMovieIds = movie_ids.slice(i, i + INTERVAL_BETWEEN_RANDOM - 1);
  let randomMovieIndex = getRndInteger(
    i + INTERVAL_BETWEEN_RANDOM,
    movie_ids.length - 1
  );

  if (randomMovieIndex > movie_ids.length) {
    randomMovieIndex = movie_ids.length - 1;
  }

  let randomMovie = movie_ids[randomMovieIndex];

  newMovieIds.push(randomMovie);
  let oldMovieIds = [...newMovieIds];

  let firstSlice = movie_ids.slice(
    i + INTERVAL_BETWEEN_RANDOM - 1,
    randomMovieIndex
  );

  let secondSlice = movie_ids.slice(randomMovieIndex + 1);

  oldMovieIds = oldMovieIds.concat(firstSlice).concat(secondSlice);

  i += INTERVAL_BETWEEN_RANDOM;

  while (i + INTERVAL_BETWEEN_RANDOM < movie_ids.length) {
    newMovieIds = newMovieIds.concat(
      oldMovieIds.slice(i, i + INTERVAL_BETWEEN_RANDOM - 1)
    );

    randomMovieIndex = getRndInteger(
      i + INTERVAL_BETWEEN_RANDOM,
      movie_ids.length - 1
    );

    if (randomMovieIndex > movie_ids.length) {
      randomMovieIndex = movie_ids.length - 1;
    }

    randomMovie = oldMovieIds[randomMovieIndex];

    newMovieIds.push(randomMovie);
    let auxMovieIds = [...newMovieIds];

    firstSlice = oldMovieIds.slice(
      i + INTERVAL_BETWEEN_RANDOM - 1,
      randomMovieIndex
    );

    secondSlice = oldMovieIds.slice(randomMovieIndex + 1);

    auxMovieIds = newMovieIds.concat(firstSlice).concat(secondSlice);

    i += INTERVAL_BETWEEN_RANDOM;

    oldMovieIds = auxMovieIds;
  }

  if (i < movie_ids.length && newMovieIds.length < oldMovieIds.length) {
    newMovieIds = newMovieIds.concat(oldMovieIds.slice(i));
  }

  if (
    newMovieIds[newMovieIds.length - 1] === undefined ||
    newMovieIds[0] === newMovieIds[1]
  ) {
    return newMovieIds.splice(0, newMovieIds.length - 1);
  }

  return newMovieIds;
};

export default movies;
