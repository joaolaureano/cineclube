import "reflect-metadata";
import fs from "fs";

import connectDatabase from ".";

import * as Models from "../models";
import * as Repositories from "../repositories";
import { getCustomRepository } from "typeorm";

const movieData = JSON.parse(
  fs.readFileSync("src/data/cine_filmes.json", "utf-8")
);

const connect = async () => {
  try {
    const connection = await connectDatabase();
    console.log("Connected successfully to database.");

    // Read JSON
    const movie_ids = Object.keys(movieData);
    const tags = readmovie_tags(movie_ids);
    const platforms = readMoviePlatforms(movie_ids);
    const movies = readMovies(movie_ids);
    const actors = readMovieActors(movie_ids);
    const directors = readMovieDirectors(movie_ids);

    // Get repositories
    const tagRepository = getCustomRepository(Repositories.TagRepository);
    const platformRepository = getCustomRepository(
      Repositories.PlatformRepository
    );
    const movieRepository = getCustomRepository(Repositories.MovieRepository);
    const movieTagRepository = getCustomRepository(Repositories.MovieTagRepository    );

    const actorRepository = getCustomRepository(Repositories.ActorRepository);
    const castRepository = getCustomRepository(Repositories.CastRepository);
    const achievementRepository = getCustomRepository(
      Repositories.AchievementRepository
    );

    // Insert data
    console.log("Inserting tags...");
    const insertedTags = await tagRepository.save(Object.values(tags));
    console.log("DONE");
    console.log("Inserting Platforms...");
    const insertedPlatforms = await platformRepository.save(
      Object.values(platforms)
    );
    console.log("DONE");
    console.log("Inserting Movies...");
    const insertedMovies = await movieRepository.save(Object.values(movies));
    console.log("DONE");
    console.log("Inserting actors...");
    const insertedActors = await actorRepository.save(Object.values(actors));
    const insertedDirectors = await actorRepository.save(
      Object.values(directors)
    );
    console.log("DONE");

    // Link tags and platforms to movies
    const tagMap = toObject("name", insertedTags);
    const platformMap = toObject("name", insertedPlatforms);
    const movieMap = toObject("title", insertedMovies);

    const movie_tags: Models.MovieTag[] = [];

    movie_ids.forEach((id: string) => {
      const movie = movieData[id];
      const movieModel = movieMap[movie.brazilian_title];

      const supertags: string[] = movie.supertags;

      const superTagMap: { [tagName: string]: string } = {};
      supertags.forEach((tagName) => {
        superTagMap[tagName] = tagName;
      });

      const tagList: string[] = movie.tags;
      tagList.forEach(([tagName, weight]) => {
        const tagModel = tagMap[tagName];

        const movie_tagModel = new Models.MovieTag();
        movie_tagModel.tag = tagModel;
        movie_tagModel.movie = movieModel;
        movie_tagModel.super = !!superTagMap[tagName];
        movie_tagModel.weight = parseInt(weight);
        movie_tags.push(movie_tagModel);
      });

      const platformNames: string[] = movie.platforms;
      platformNames.forEach((platformName) => {
        const platformModel = platformMap[platformName];
        movieModel.platforms.push(platformModel);
      });
    });

    // Save changes
    console.log("Linking Platforms to Movies...");
    await movieRepository.save(Object.values(movieMap));
    console.log("DONE");
    console.log("Linking Tags to Movies...");
    const insertedMovieTags = await movieTagRepository.save(movie_tags);
    console.log("DONE");

    // Link actors to movies
    const actorMap = toObject("name", insertedActors);
    const directorsMap = toObject("name", insertedDirectors);

    const cast: Models.Cast[] = [];

    movie_ids.forEach((id: string) => {
      const movie = movieData[id];
      const movieModel = movieMap[movie.brazilian_title];

      const actors: string[] = movie.cast;
      actors.forEach((actorName) => {
        const actorModel = actorMap[actorName];

        const castModel = new Models.Cast();
        castModel.actor = actorModel;
        castModel.movie = movieModel;
        castModel.director = false;
        cast.push(castModel);
      });

      const directors: string[] = movie.directors;
      directors.forEach((actorName) => {
        const actorModel = directorsMap[actorName];

        const castModel = new Models.Cast();
        castModel.actor = actorModel;
        castModel.movie = movieModel;
        castModel.director = true;
        cast.push(castModel);
      });
    });

    console.log("Linking Actors to Movies...");
    await castRepository.save(Object.values(cast));
    console.log("DONE");

    //Create achievements
    const achievements: AchievementData[] = [];
    const achievementImage = "https://i.imgur.com/kuZNoUt.png";
    achievements.push({
      tagName: "Drama",
      target_score: 5,
      path_image: achievementImage,
      title: "Que drama!",
      description: "Parabéns! Você assistiu 5 filmes de drama.",
    });
    achievements.push({
      tagName: "Drama",
      target_score: 10,
      path_image: achievementImage,
      title: "A vida é um drama!!!!",
      description: "Incrível! Você assitiu 10 filmes de drama.",
    });
    achievements.push({
      tagName: "Mystery",
      target_score: 3,
      path_image: achievementImage,
      title: "Cuidado, algo está acontecendo!",
      description: "Secretamente você assistiu 3 filmes de mistério.",
    });
    achievements.push({
      tagName: "Thriller",
      target_score: 3,
      path_image: achievementImage,
      title: "Plot Twist!",
      description: "Do nada você assistiu 3 filmes tríler.",
    });
    achievements.push({
      tagName: "Comedy",
      target_score: 3,
      path_image: achievementImage,
      title: "Respira que tem mais piada!",
      description:
        "Acalma que tem muita risada, mas parabéns pelos 3 filmes de comédia assistidos.",
    });
    achievements.push({
      tagName: "Horror",
      target_score: 3,
      path_image: achievementImage,
      title: "Não tenha medo!",
      description:
        "O filme já acabou e acho que nada daquilo é real. Enfim, parabéns pela conquista de 3 filmes de terror assistidos.",
    });
    achievements.push({
      tagName: "Romance",
      target_score: 3,
      path_image: achievementImage,
      title: "Awnn que amor!",
      description: "Com muito amor você assistiu 3 filmes de romance.",
    });

    //Link tags to achievements
    const achievementModels: Models.Achievement[] = [];

    achievements.forEach((achievement) => {
      const achievementModel = new Models.Achievement();
      achievementModel.path_image = achievement.path_image;
      achievementModel.title = achievement.title;
      achievementModel.description = achievement.description;
      achievementModel.target_score = achievement.target_score;

      const tagModel = tagMap[achievement.tagName];
      achievementModel.tag = tagModel;

      achievementModels.push(achievementModel);
    });

    await achievementRepository.save(achievementModels);
    console.log("Finished inserting data, exiting...");
    connection.close();
    process.exit();
  } catch (err) {
    const error = err as Error;
    console.log(`Error connecting to database!\n${error.message}`);
    process.exit();
  }
};

const readmovie_tags = (movie_ids: string[]) => {
  const tags: { [tagName: string]: Models.Tag } = {};

  movie_ids.forEach((id: string) => {
    const movie = movieData[id];

    const supertags: string[] = movie.supertags;
    supertags.forEach((superTagName) => {
      if (!tags[superTagName]) {
        const tagModel = new Models.Tag();
        tagModel.name = superTagName;
        tags[superTagName] = tagModel;
      }
    });

    const tagList: string[] = movie.tags;
    tagList.forEach(([tagName]) => {
      if (!tags[tagName]) {
        const tagModel = new Models.Tag();
        tagModel.name = tagName;
        tags[tagName] = tagModel;
      }
    });
  });

  return tags;
};

const readMoviePlatforms = (movie_ids: string[]) => {
  const platforms: { [platformName: string]: Models.Platform } = {};

  movie_ids.forEach((id: string) => {
    const movie = movieData[id];

    const platformNames: string[] = movie.platforms;
    platformNames.forEach((platformName) => {
      if (!platforms[platformName]) {
        const platformModel = new Models.Platform();
        platformModel.name = platformName;
        platforms[platformName] = platformModel;
      }
    });
  });
  return platforms;
};

const readMovieActors = (movie_ids: string[]) => {
  const actors: { [actorName: string]: Models.Actor } = {};

  movie_ids.forEach((id: string) => {
    const movie = movieData[id];

    const actorNames: string[] = movie.cast;
    actorNames.forEach((actorName) => {
      if (!actors[actorName]) {
        const actorModel = new Models.Actor();
        actorModel.name = actorName;
        actors[actorName] = actorModel;
      }
    });
  });
  return actors;
};

const readMovieDirectors = (movie_ids: string[]) => {
  const director: { [directorName: string]: Models.Actor } = {};

  movie_ids.forEach((id: string) => {
    const movie = movieData[id];

    const directorNames: string[] = movie.directors;
    directorNames.forEach((directorName) => {
      if (!director[directorName]) {
        const directorModel = new Models.Actor();
        directorModel.name = directorName;
        director[directorName] = directorModel;
      }
    });
  });
  return director;
};

const readMovies = (movie_ids: string[]) => {
  const movies: { [movie_id: string]: Models.Movie } = {};

  movie_ids.forEach((id: string) => {
    const movie = movieData[id];

    const movieModel = new Models.Movie();
    movieModel.title = movie.brazilian_title;
    movieModel.original_title = movie.original_title;
    movieModel.synopsis = movie.synopsis;
    movieModel.year = movie.year;
    movieModel.curator = movie.curator;
    movieModel.critic = movie.custom_description;
    movieModel.path_banner = movie.cover_url;
    movieModel.duration = movie.runtime;
    movieModel.platforms = [];
    movies[id] = movieModel;
  });
  return movies;
};

interface AchievementData {
  title: string;
  description: string;
  path_image: string;
  target_score: number;
  tagName: string;
}

const toObject = (keyField: string, arr: Array<any>) => {
  const obj: { [key: string]: any } = {};
  arr.forEach((item) => {
    obj[item[keyField]] = item;
  });
  return obj;
};

connect();
