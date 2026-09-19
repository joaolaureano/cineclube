/**
 * Automatic mock for the `typeorm` package: because it lives in node_modules, Jest
 * picks this file up for every test without an explicit `jest.mock("typeorm")`.
 *
 * Only the data-access entry points are replaced. The decorators (`Entity`, `Column`,
 * `EntityRepository`, ...) are re-exported untouched — models and repositories evaluate
 * them at import time and break if they are stubbed out.
 */
import { getMockRepository } from "../tests/helpers/typeormMock";

const actual = jest.requireActual("typeorm");

module.exports = {
  ...actual,
  getCustomRepository: jest.fn((target: { name: string }) =>
    getMockRepository(target.name)
  ),
  getRepository: jest.fn((target: { name: string }) =>
    getMockRepository(target.name)
  ),
  createConnection: jest.fn(async () => ({})),
};
