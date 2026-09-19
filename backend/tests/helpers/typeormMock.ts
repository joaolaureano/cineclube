/**
 * Every service reaches the database through `getCustomRepository(X)` (and, in one
 * place, `getRepository(UserTag)`), always called *inside* the function body. That
 * makes a module-level mock of `typeorm` enough to intercept all data access.
 *
 * The real decorators (`Entity`, `Column`, `EntityRepository`, ...) must survive the
 * mock: models and repositories evaluate them at import time, and replacing them with
 * jest.fn() breaks the class definitions themselves.
 */

export interface MockQueryBuilder {
  select: jest.Mock;
  addSelect: jest.Mock;
  from: jest.Mock;
  innerJoin: jest.Mock;
  innerJoinAndSelect: jest.Mock;
  leftJoin: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  orWhere: jest.Mock;
  groupBy: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  take: jest.Mock;
  skip: jest.Mock;
  setParameter: jest.Mock;
  setParameters: jest.Mock;
  getSql: jest.Mock;
  getQuery: jest.Mock;
  getMany: jest.Mock;
  getOne: jest.Mock;
  getRawMany: jest.Mock;
  getRawOne: jest.Mock;
}

export interface MockRepository {
  find: jest.Mock;
  findOne: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  delete: jest.Mock;
  create: jest.Mock;
  createQueryBuilder: jest.Mock;
  queryBuilder: MockQueryBuilder;
}

export const createMockQueryBuilder = (): MockQueryBuilder => {
  const qb = {} as MockQueryBuilder;
  const chainable = [
    "select",
    "addSelect",
    "from",
    "innerJoin",
    "innerJoinAndSelect",
    "leftJoin",
    "leftJoinAndSelect",
    "where",
    "andWhere",
    "orWhere",
    "groupBy",
    "orderBy",
    "limit",
    "take",
    "skip",
    "setParameter",
    "setParameters",
  ] as const;

  chainable.forEach((name) => {
    (qb as any)[name] = jest.fn(() => qb);
  });

  qb.getSql = jest.fn(() => "SELECT 1");
  qb.getQuery = jest.fn(() => "SELECT 1");
  qb.getMany = jest.fn(async () => []);
  qb.getOne = jest.fn(async () => undefined);
  qb.getRawMany = jest.fn(async () => []);
  qb.getRawOne = jest.fn(async () => undefined);

  return qb;
};

export const createMockRepository = (): MockRepository => {
  const queryBuilder = createMockQueryBuilder();
  return {
    find: jest.fn(async () => []),
    findOne: jest.fn(async () => undefined),
    save: jest.fn(async (entity: unknown) => entity),
    remove: jest.fn(async (entity: unknown) => entity),
    delete: jest.fn(async () => ({ affected: 1 })),
    create: jest.fn((entity: unknown) => entity),
    createQueryBuilder: jest.fn(() => queryBuilder),
    queryBuilder,
  };
};

/**
 * Repositories are keyed by class name, so a test can reach exactly the one it cares
 * about: `repositories.UserMovieRepository.findOne.mockResolvedValue(...)`.
 * `getRepository(UserTag)` is keyed the same way, by the entity class name.
 */
export const repositories: Record<string, MockRepository> = {};

export const getMockRepository = (name: string): MockRepository => {
  if (!repositories[name]) {
    repositories[name] = createMockRepository();
  }
  return repositories[name];
};

export const resetRepositories = (): void => {
  Object.keys(repositories).forEach((key) => delete repositories[key]);
};
