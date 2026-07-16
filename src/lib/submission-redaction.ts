const submissionAliases = [
  ["University of Chile - IDIEM", "Public buyer organization"],
  ["University of Chile", "Public buyer"],
  ["Comercial Hagelin SpA", "Supplier Alpha"],
  ["Comercial Hagelin", "Supplier Alpha"],
  ["Metalurgica Silcosil", "Supplier Beta"],
  ["Muebles Timaukel", "Supplier Delta"],
  ["Melman", "Supplier Gamma"],
  ["Edge", "Supplier Epsilon"],
  ["LEFI", "Supplier Zeta"],
  ["Status", "Supplier Eta"],
  ["Eventail", "Supplier Theta"],
] as const;

export function redactSubmissionText(text: string): string {
  return submissionAliases.reduce(
    (redacted, [source, alias]) => redacted.replaceAll(source, alias),
    text,
  );
}

