import chileFixture from "../../../fixtures/golden-cases/chile-deep.json";
import chileCorrectionFixture from "../../../fixtures/golden-cases/chile-correction.json";
import chileRealFixture from "../../../fixtures/golden-cases/chile-real-award.json";
import euFixture from "../../../fixtures/golden-cases/eu-proof.json";
import ukFixture from "../../../fixtures/golden-cases/uk-proof.json";
import chileRealDelta from "../../../fixtures/evidence-events/cl-5802381-7547UCUK-public-selection.json";
import chileCorrectionDelta from "../../../fixtures/evidence-events/cl-correction-resolution.json";

import { evaluateEvidenceDelta } from "./evidence-delta";
import {
  CaseFixtureSchema,
  EvidenceDeltaEventSchema,
  type CaseFixture,
} from "./schemas";

const fixtures = [chileRealFixture, chileCorrectionFixture, chileFixture, euFixture, ukFixture].map((fixture) =>
  CaseFixtureSchema.parse(fixture),
);

export function listFixtures(): CaseFixture[] {
  return fixtures;
}

export function getFixture(fixtureId: string): CaseFixture | undefined {
  return fixtures.find((fixture) => fixture.id === fixtureId);
}

export function getDefaultEvidenceDelta() {
  const fixture = getFixture("cl-real-5802381-7547UCUK");
  if (!fixture) throw new Error("Real Chile fixture missing");
  return evaluateEvidenceDelta(
    fixture,
    EvidenceDeltaEventSchema.parse(chileRealDelta),
  );
}

export function listEvidenceDeltas() {
  return [chileRealDelta, chileCorrectionDelta].map((eventValue) => {
    const event = EvidenceDeltaEventSchema.parse(eventValue);
    const fixture = fixtures.find(
      (item) => item.scope.procedureId === event.procedureId,
    );
    if (!fixture) throw new Error(`Evidence delta fixture missing: ${event.procedureId}`);
    return evaluateEvidenceDelta(fixture, event);
  });
}
