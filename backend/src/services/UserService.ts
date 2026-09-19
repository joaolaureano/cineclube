import { getCustomRepository, getRepository } from "typeorm";
import { MovieUserStatus } from "../enum/MovieUserStatus";
import { Achievement, UserAchievement, UserMovie, UserTag } from "../models";
import { User } from "../models/User";
import {
  UserRepository,
  UserMovieRepository,
  MovieTagRepository,
  UserAchievementRepository,
  AchievementRepository,
  UserTagRepository,
} from "../repositories";

export interface userDetails {
  id: string;
  name: string;
  email?: string;
  photo_path?: string;
}

const createUser = async (userDetails: userDetails): Promise<User> => {
  const userRepository = getCustomRepository(UserRepository);

  const newUser = new User();
  Object.assign(newUser, userDetails);

  newUser.randomness = 0;

  const result = await userRepository.save(newUser);

  return result;
};

const findUserById = async (id: string): Promise<User | undefined> => {
  const userRepository = getCustomRepository(UserRepository);

  const user = await userRepository.findOne(id);

  return user;
};

const getUserMoviesByStatus = async (
  status: string,
  user_id: string
): Promise<UserMovie[]> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const movies = await userMovieRepository.find({
    where: { user_id, status },
    relations: ["movie", "movie.platforms"],
  });

  const moviesWithoutId = movies.map((movie) => {
    movie.user_id = "";
    return movie;
  });

  return moviesWithoutId;
};

const setuser_tags = async (idMovie: string, idUser: string): Promise<void> => {
  const user_tagRepository = getCustomRepository(UserTagRepository);
  const movie_tagRepository = getCustomRepository(MovieTagRepository);

  const movie_tagList = await movie_tagRepository
    .createQueryBuilder("movie_tag")
    .where(`"movie_tag"."movie_id" = :movie_id`, { movie_id: idMovie })
    .getMany();

  const movie_tagSql = movie_tagRepository
    .createQueryBuilder("movie_tag")
    .select("movie_tag.tag_id", "tag_id")
    //getQuery preserva o placeholder :movie_id; getSql o trocaria por $1 e
    //descartaria o valor, quebrando a query externa que embute este SQL
    .where(`"movie_tag"."movie_id" = :movie_id`, { movie_id: idMovie })
    .getQuery();

  const existinguser_tags = await user_tagRepository
    .createQueryBuilder("user_tag")
    .where(`"user_tag"."tag_id" IN (${movie_tagSql})`, { movie_id: idMovie })
    .andWhere(`"user_tag"."user_id" = :user_id`, { user_id: idUser })
    .getMany();

  const leftTags = movie_tagList.filter((tag) => {
    return existinguser_tags.find((user_tag) => user_tag.tag_id == tag.tag_id)
      ? false
      : true;
  });

  existinguser_tags.forEach((tag) => {
    const actualmovie_tag = movie_tagList.find(
      (movie_tag) => movie_tag.tag_id == tag.tag_id
    );
    if (actualmovie_tag) {
      tag.total_point += actualmovie_tag.weight;
    }
  });

  leftTags.forEach((movie_tag) => {
    const newuser_tag = new UserTag();
    newuser_tag.tag_id = movie_tag.tag_id;
    newuser_tag.user_id = idUser;
    newuser_tag.total_point = movie_tag.weight;
    existinguser_tags.push(newuser_tag);
  });

  await user_tagRepository.save(existinguser_tags);
};

const setMovieStatusWatchedLiked = async (
  idMovie: string,
  idUser: string,
  status: string
): Promise<Achievement[] | undefined> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const exists = await userMovieRepository.findOne({
    where: { movie_id: idMovie, user_id: idUser },
  });
  if (!exists) {
    const newUserMovieStatus = new UserMovie();
    newUserMovieStatus.movie_id = parseInt(idMovie);
    newUserMovieStatus.user_id = idUser;
    newUserMovieStatus.status = status;

    await userMovieRepository.save(newUserMovieStatus);

    await setuser_tags(idMovie, idUser);

    const result = await setAchievementProgress(idMovie, idUser);

    return result;
  } else {
    exists.status = status;

    await userMovieRepository.save(exists);

    await setuser_tags(idMovie, idUser);

    const result = await setAchievementProgress(idMovie, idUser);

    return result;
  }
};

const setMovieStatusWatchedDisliked = async (
  idMovie: string,
  idUser: string,
  status: string
): Promise<Achievement[] | undefined> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const exists = await userMovieRepository.findOne({
    where: { movie_id: idMovie, user_id: idUser },
  });
  if (!exists) {
    const newUserMovieStatus = new UserMovie();
    newUserMovieStatus.movie_id = parseInt(idMovie);
    newUserMovieStatus.user_id = idUser;
    newUserMovieStatus.status = status;

    await userMovieRepository.save(newUserMovieStatus);

    const result = await setAchievementProgress(idMovie, idUser);

    return result;
  } else {
    if (exists.status == MovieUserStatus.WATCHED_AND_LIKED)
      await decreaseuser_tagPoints(exists);

    exists.status = status;

    await userMovieRepository.save(exists);

    const result = await setAchievementProgress(idMovie, idUser);

    return result;
  }
};

const setMovieStatusDontWantWatch = async (
  idMovie: string,
  idUser: string,
  status: string
): Promise<UserMovie> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const exists = await userMovieRepository.findOne({
    where: { movie_id: idMovie, user_id: idUser },
  });
  if (!exists) {
    const newUserMovieStatus = new UserMovie();
    newUserMovieStatus.movie_id = parseInt(idMovie);
    newUserMovieStatus.user_id = idUser;
    newUserMovieStatus.status = status;

    const result = await userMovieRepository.save(newUserMovieStatus);

    return result;
  } else {
    exists.status = status;

    const result = await userMovieRepository.save(exists);

    return result;
  }
};

const decreaseuser_tagPoints = async (userMovie: UserMovie): Promise<void> => {
  const user_tagRepository = getCustomRepository(UserTagRepository);
  const movie_tagRepository = getCustomRepository(MovieTagRepository);

  const movie_tagList = await movie_tagRepository
    .createQueryBuilder("movie_tag")
    .where(`"movie_tag"."movie_id" = :movie_id`, {
      movie_id: userMovie.movie_id,
    })
    .getMany();

  const movie_tagSql = movie_tagRepository
    .createQueryBuilder("movie_tag")
    .select("movie_tag.tag_id", "tag_id")
    .where(`"movie_tag"."movie_id" = :movie_id`, {
      movie_id: userMovie.movie_id,
    })
    .getQuery();

  const existinguser_tags = await user_tagRepository
    .createQueryBuilder("user_tag")
    .where(`"user_tag"."tag_id" IN (${movie_tagSql})`, {
      movie_id: userMovie.movie_id,
    })
    .andWhere(`"user_tag"."user_id" = :user_id`, { user_id: userMovie.user_id })
    .getMany();

  const removeList: UserTag[] = [];
  const updateList: UserTag[] = [];

  existinguser_tags.forEach((user_tag: UserTag) => {
    const actualmovie_tag = movie_tagList.find(
      (movie_tag) => movie_tag.tag_id == user_tag.tag_id
    );
    if (actualmovie_tag) {
      user_tag.total_point -= actualmovie_tag.weight;
      if (user_tag.total_point <= 0) {
        removeList.push(user_tag);
      } else {
        updateList.push(user_tag);
      }
    }
  });

  await user_tagRepository.save(updateList);

  await user_tagRepository.remove(removeList);
};
const decreaseUserAchievementsPoint = async (
  user_id: string,
  movie_id: string
) => {
  const movie_tagRepository = getCustomRepository(MovieTagRepository);
  const user_achievementRepo = getCustomRepository(UserAchievementRepository);
  const achievementRepository = getCustomRepository(AchievementRepository);
  // Faz uma query para pegar as tags do filme
  const movie_tagSql = movie_tagRepository
    .createQueryBuilder("movie_tag")
    .select("movie_tag.tag_id", "tag_id")
    .where(`"movie_tag"."movie_id" = :movie_id`, { movie_id })
    .getQuery();

  // Faz uma busca para pegar os achievements relacionados com as tags
  const achievementsByMovie = await achievementRepository
    .createQueryBuilder("user_achievement")
    .where(`"user_achievement"."tag_id" IN (${movie_tagSql})`, { movie_id })
    .getMany();

  const achievementsByMovieMap = Object.assign(
    {},
    ...achievementsByMovie.map((x) => ({ [x.id]: x }))
  );

  // Faz uma busca dos achievements que o usuário já conquistou
  const existingUserAchivements = await user_achievementRepo
    .createQueryBuilder("user_achievement")
    .where(
      `"user_achievement"."achievement_id" IN (${
        Object.keys(achievementsByMovieMap).length
          ? Object.keys(achievementsByMovieMap)
          : -1
      })`
    )
    .andWhere(`"user_achievement"."user_id" = :user_id`, { user_id })
    .getMany();

  const toRemoveAchievement: UserAchievement[] = [];
  const toReduceAchievement: UserAchievement[] = [];

  existingUserAchivements.forEach((user_achievement) => {
    user_achievement.current_score -= 1;
    if (user_achievement.current_score === 0)
      toRemoveAchievement.push(user_achievement);
    else toReduceAchievement.push(user_achievement);
  });

  await user_achievementRepo.save(toReduceAchievement);
  await user_achievementRepo.remove(toRemoveAchievement);
};

const deleteUserMovie = async (
  idMovie: string,
  idUser: string
): Promise<UserMovie | undefined> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const exists = await userMovieRepository.findOne({
    where: { movie_id: idMovie, user_id: idUser },
  });
  if (exists) {
    if (
      exists.status == MovieUserStatus.WATCHED_AND_LIKED ||
      exists.status == MovieUserStatus.WATCHED_AND_DISLIKED
    ) {
      if (exists.status == MovieUserStatus.WATCHED_AND_LIKED)
        await decreaseuser_tagPoints(exists);
      await decreaseUserAchievementsPoint(idUser, idMovie);
    }

    const removed = await userMovieRepository.remove(exists);

    return removed;
  }
};
const setMovieStatusWantToWatch = async (
  idMovie: string,
  idUser: string,
  status: string
): Promise<UserMovie> => {
  const userMovieRepository = getCustomRepository(UserMovieRepository);

  const exists = await userMovieRepository.findOne({
    where: { movie_id: idMovie, user_id: idUser },
  });
  if (!exists) {
    const newUserMovieStatus = new UserMovie();
    newUserMovieStatus.movie_id = parseInt(idMovie);
    newUserMovieStatus.user_id = idUser;
    newUserMovieStatus.status = status;

    const result = await userMovieRepository.save(newUserMovieStatus);

    return result;
  } else {
    exists.status = status;

    const result = await userMovieRepository.save(exists);

    return result;
  }
};

const setSignUpPreferences = async (
  user_id: string,
  tag_ids: number[]
): Promise<UserTag[]> => {
  const user_tagRespoitory = getRepository(UserTag);
  const user_tags = tag_ids.map((id) => {
    const user_tag = new UserTag();
    user_tag.tag_id = id;
    user_tag.user_id = user_id;
    user_tag.total_point = 50;
    return user_tag;
  });
  const inserteduser_tags = await user_tagRespoitory.save(user_tags);
  return inserteduser_tags;
};

const setAchievementProgress = async (
  movie_id: string,
  user_id: string
): Promise<Achievement[] | undefined> => {
  const movie_tagRepository = getCustomRepository(MovieTagRepository);
  const user_achievementRepo = getCustomRepository(UserAchievementRepository);
  const achievementRepository = getCustomRepository(AchievementRepository);
  // Faz uma query para pegar as tags do filme
  const movie_tagSql = movie_tagRepository
    .createQueryBuilder("movie_tag")
    .select("movie_tag.tag_id", "tag_id")
    .where(`"movie_tag"."movie_id" = :movie_id`, { movie_id })
    .getQuery();

  // Faz uma busca para pegar os achievements relacionados com as tags
  const achievementsByMovie = await achievementRepository
    .createQueryBuilder("user_achievement")
    .where(`"user_achievement"."tag_id" IN (${movie_tagSql})`, { movie_id })
    .getMany();
  if (achievementsByMovie.length === 0) return;
  const achievementsByMovieMap = Object.assign(
    {},
    ...achievementsByMovie.map((x) => ({ [x.id]: x }))
  );
  // Faz uma busca dos achievements que o usuário já conquistou

  const existingUserAchivements = await user_achievementRepo
    .createQueryBuilder("user_achievement")
    .where(
      `"user_achievement"."achievement_id" IN (${Object.keys(
        achievementsByMovieMap
      )})`
    )
    .andWhere(`"user_achievement"."user_id" = :user_id`, { user_id })
    .getMany();

  const user_achievementMap: {
    [achievement_id: string]: UserAchievement;
  } = Object.assign(
    {},
    ...existingUserAchivements.map((x) => ({ [x.achievement_id]: x }))
  );

  const allAchievementsIds = new Set([
    ...Object.keys(achievementsByMovieMap),
    ...Object.keys(user_achievementMap),
  ]);

  const retAchievement_ids: string[] = [];

  allAchievementsIds.forEach((id) => {
    if (user_achievementMap[id]) {
      let changed = false;
      if (
        achievementsByMovieMap[id].target_score >
        user_achievementMap[id].current_score
      ) {
        changed = true;
      }
      user_achievementMap[id].current_score += 1;
      //com as pontuações iguais e ocorrendo uma mudança, quer dizer que este deve ser retornado para ser exibido na tela
      if (
        changed &&
        achievementsByMovieMap[id].target_score ===
          user_achievementMap[id].current_score
      )
        retAchievement_ids.push(id);
    } else {
      const user_achievementObj = new UserAchievement();
      user_achievementObj.achievement_id = Number(id);
      user_achievementObj.current_score = 1;
      user_achievementObj.user_id = user_id;
      user_achievementMap[id] = user_achievementObj;
      //um achievement de alvo 1 já nasce completo e também deve ser exibido
      if (achievementsByMovieMap[id].target_score === 1)
        retAchievement_ids.push(id);
    }
  });

  await user_achievementRepo.save(Object.values(user_achievementMap));

  //se existir algum achievement para retornar
  if (retAchievement_ids.length !== 0) {
    const achievementsById = await achievementRepository
      .createQueryBuilder("achievements")
      .where(`"achievements"."id" IN (${retAchievement_ids})`)
      .getMany();

    return achievementsById;
  }

  return undefined;
};

export default {
  createUser,
  findUserById,
  setMovieStatusWatchedLiked,
  setMovieStatusWatchedDisliked,
  getUserMoviesByStatus,
  setMovieStatusDontWantWatch,
  setMovieStatusWantToWatch,
  deleteUserMovie,
  setSignUpPreferences,
  setAchievementProgress,
};
