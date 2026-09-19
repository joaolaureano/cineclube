import { getCustomRepository } from "typeorm";
import { Movie } from "../models/Movie";
import { MovieRepository, UserMovieRepository } from "../repositories";
import { UserTagRepository } from "../repositories/UserTagRepository";

export interface userDetails {
  id: string;
  name: string;
  email?: string;
  photo_path?: string;
}

const getMoviesNotInUserLists = async (
  user_id: string,
  superTags?: boolean
): Promise<Movie[] | undefined> => {
  const user_movieList = getCustomRepository(UserMovieRepository)
    .createQueryBuilder("user_movie")
    .select("user_movie.movie_id", "movie_id")
    //getQuery preserva o placeholder :user_id; getSql o trocaria por $1 e
    //descartaria o valor, quebrando a query externa que embute este SQL
    .where(`user_movie.user_id = :user_id`, { user_id })
    .getQuery();

  const moviesNotInUserList = getCustomRepository(MovieRepository)
    .createQueryBuilder("movie")
    .leftJoinAndSelect("movie.platforms", "platforms")
    .leftJoinAndSelect("movie.cast", "cast")
    .leftJoinAndSelect("cast.actor", "actors")
    .leftJoinAndSelect(
      "movie.movies_tags",
      "movie_tag",
      superTags ? "movie_tag.super = true" : ""
    )
    .leftJoinAndSelect("movie_tag.tag", "tag")
    .where(`"movie"."id" NOT IN (${user_movieList})`, { user_id })
    .getMany();
  return moviesNotInUserList;
};

const getMovieListByIds = async (
  movie_ids: number[]
): Promise<Movie[] | undefined> => {
  const movieRepository = getCustomRepository(MovieRepository);

  const movies = await movieRepository
    .createQueryBuilder("movie")
    .leftJoinAndSelect("movie.platforms", "platforms")
    .leftJoinAndSelect("movie.cast", "movie_cast")
    .leftJoinAndSelect("movie_cast.actor", "actors")
    .leftJoinAndSelect("movie.movies_tags", "movie_tag")
    .leftJoinAndSelect("movie_tag.tag", "tag")
    .where(`"movie"."id" IN (${movie_ids})`)
    .getMany();

  return movies;
};

const getRecommendedList = async (
  user_id: string,
  tags?: number[],
  platforms?: number[]
): Promise<Movie[] | undefined> => {
  const movieRepository = getCustomRepository(MovieRepository);
  const user_tagRepository = getCustomRepository(UserTagRepository);

  // Select de todas as tags que o usuário se interessa
  const user_tagList = await user_tagRepository
    .createQueryBuilder("user_tag")
    .where(`"user_tag"."user_id" = :uid`, { uid: user_id })
    .getMany();

  if (user_tagList.length === 0) {
    let movies = await getMoviesNotInUserLists(user_id);

    if (movies) {
      if (platforms) movies = filterMoviesByPlatforms(platforms, movies);
      if (tags) movies = filterMoviesByTags(tags, movies);

      const filteredMovies = movies.map((movie) => {
        movie.movies_tags = movie.movies_tags.filter(
          (movie_tag) => movie_tag.super
        );
        return movie;
      });

      return filteredMovies;
    }
    return getMoviesNotInUserLists(user_id, true);
  }

  // Geração de lista com apenas os valores das ids de tag
  const tag_idList = user_tagRepository
    .createQueryBuilder("user_tag")
    .select("user_tag.tag_id", "tag_id")
    .where(`"user_tag"."user_id" = :user_id`, { user_id })
    .getQuery();

  //Select com os ids de filmes em listas do usuário
  const user_movieList = getCustomRepository(UserMovieRepository)
    .createQueryBuilder("user_movie")
    .select("user_movie.movie_id", "movie_id")
    .where(`"user_movie"."user_id" = :user_id`, { user_id })
    .getQuery();

  //Select de todos os filmes que possuem alguma tag gerada na query acima
  const movies = await movieRepository
    .createQueryBuilder("movie")
    .innerJoinAndSelect("movie.movies_tags", "movie_tag")
    .where(
      `"movie_tag"."tag_id" in (${tag_idList}) AND "movie_tag"."movie_id" NOT IN (${user_movieList})`,
      { user_id }
    )
    .getMany();

  //Mapeamento de pontuação da tag para a id da tag
  const mapuser_tagTotalPoint: { [tag_id: number]: number } = {};
  user_tagList.map((tag_id) => {
    mapuser_tagTotalPoint[tag_id.tag_id] = tag_id.total_point;
  });

  const scoreMovies: { [movie_id: number]: MovieScore } = {};

  // Inicialização de score em 0 e dos filmes e
  // cálculo do score para determinado filme
  movies.forEach((movie) => {
    scoreMovies[movie.id] = {
      score: 0,
      movie,
    };
    movie.movies_tags.forEach((movie_tag) => {
      //uma tag que o usuário ainda não pontuou vale zero, e não NaN
      scoreMovies[movie.id].score +=
        (mapuser_tagTotalPoint[movie_tag.tag_id] ?? 0) * movie_tag.weight;
    });
  });

  // Busca dos filmes com todas informações necessárias junto (movie_cast, platforms, tags, etc)
  const sortedmovie_ids = movies.map((movie) => movie.id);
  if (sortedmovie_ids.length === 0) {
    return [];
  }
  const sortedMovieModels = await getMovieListByIds(sortedmovie_ids);

  // Ordenar os filmes por score
  const sortedMovies = sortedMovieModels?.sort((movie, nextMovie) => {
    const movieScore = scoreMovies[movie.id].score;
    const nextMovieScore = scoreMovies[nextMovie.id].score;

    return nextMovieScore - movieScore;
  });

  if (sortedMovies) {
    let movies = sortedMovies;
    if (platforms) movies = filterMoviesByPlatforms(platforms, movies);
    if (tags) movies = filterMoviesByTags(tags, movies);

    const filteredMovies = movies.map((movie) => {
      movie.movies_tags = movie.movies_tags.filter(
        (movie_tag) => movie_tag.super
      );
      return movie;
    });

    return filteredMovies;
  }
};

const filterMoviesByTags = (tags: number[], movieList: Movie[]) => {
  if (tags.length == 0) {
    return movieList;
  }

  const filteredMovies = movieList?.filter((movie) => {
    const movieFilteredTags = movie.movies_tags.find((movie_tag) => {
      return tags.indexOf(movie_tag.tag_id) >= 0;
    });
    return movieFilteredTags;
  });

  return filteredMovies;
};

const filterMoviesByPlatforms = (platforms: number[], movieList: Movie[]) => {
  if (platforms.length == 0) {
    return movieList;
  }

  const filteredMovies = movieList?.filter((movie) => {
    const movieFilteredByPlatforms = movie.platforms.find((platform) => {
      return platforms.indexOf(platform.id) >= 0;
    });
    return movieFilteredByPlatforms;
  });

  return filteredMovies;
};

const getById = async (id: number) => {
  const movieRepository = getCustomRepository(MovieRepository);

  const movie = await movieRepository.findOne(id);

  return movie;
};

interface MovieScore {
  movie: Movie;
  score: number;
}

export default { getById, getRecommendedList };
