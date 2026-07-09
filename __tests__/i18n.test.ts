import en from "@/i18n/locales/en.json";
import vi from "@/i18n/locales/vi.json";

type LocaleValue = string | { [key: string]: LocaleValue };

function collectKeys(node: LocaleValue, prefix = ""): string[] {
  if (typeof node === "string") {
    return [prefix];
  }
  return Object.entries(node).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("locale parity", () => {
  const enKeys = collectKeys(en).sort();
  const viKeys = collectKeys(vi).sort();

  it("vi has every en key", () => {
    const missing = enKeys.filter((key) => !viKeys.includes(key));
    expect(missing).toEqual([]);
  });

  it("vi has no extra keys", () => {
    const extra = viKeys.filter((key) => !enKeys.includes(key));
    expect(extra).toEqual([]);
  });

  it("interpolation placeholders match between locales", () => {
    const placeholders = (value: string): string[] =>
      (value.match(/\{\{\s*\w+\s*\}\}/g) ?? [])
        .map((m) => m.replace(/[{}\s]/g, ""))
        .sort();

    const lookup = (node: LocaleValue, path: string[]): string => {
      const result = path.reduce<LocaleValue>(
        (acc, part) => (typeof acc === "string" ? acc : acc[part]),
        node
      );
      return typeof result === "string" ? result : "";
    };

    for (const key of enKeys) {
      const path = key.split(".");
      expect({ key, placeholders: placeholders(lookup(vi, path)) }).toEqual({
        key,
        placeholders: placeholders(lookup(en, path)),
      });
    }
  });
});
