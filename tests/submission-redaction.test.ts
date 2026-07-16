import { describe, expect, it } from "vitest";

import { redactSubmissionText } from "../src/lib/submission-redaction";

describe("submission display redaction", () => {
  it("replaces public buyer and supplier names with stable aliases", () => {
    const redacted = redactSubmissionText(
      "University of Chile recommended Comercial Hagelin SpA over Metalurgica Silcosil.",
    );

    expect(redacted).toBe(
      "Public buyer recommended Supplier Alpha over Supplier Beta.",
    );
  });

  it("preserves scores and technical evidence language", () => {
    const redacted = redactSubmissionText(
      "Comercial Hagelin obtained 98.33% under the 90% price weighting.",
    );

    expect(redacted).toBe(
      "Supplier Alpha obtained 98.33% under the 90% price weighting.",
    );
  });
});

