import chileFixture from "../../../fixtures/golden-cases/chile-deep.json";
import chileRealFixture from "../../../fixtures/golden-cases/chile-real-award.json";
import euFixture from "../../../fixtures/golden-cases/eu-proof.json";
import ukFixture from "../../../fixtures/golden-cases/uk-proof.json";

import { CaseFixtureSchema, type CaseFixture } from "./schemas";

const fixtures = [chileRealFixture, chileFixture, euFixture, ukFixture].map((fixture) =>
  CaseFixtureSchema.parse(fixture),
);

export function listFixtures(): CaseFixture[] {
  return fixtures;
}

export function getFixture(fixtureId: string): CaseFixture | undefined {
  return fixtures.find((fixture) => fixture.id === fixtureId);
}
