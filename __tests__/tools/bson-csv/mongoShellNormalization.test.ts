/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { normalizeMongoShellExtendedTypes } from "../../../src/tools/bson-csv/utils/mongoShell";

describe("normalizeMongoShellExtendedTypes", () => {
  it("replaces ISODate wrappers with ISO strings", () => {
    const raw = '{ "createTime": ISODate("2025-09-21T18:26:34.966Z") }';
    const sanitized = normalizeMongoShellExtendedTypes(raw);
    const parsed = JSON.parse(sanitized);
    expect(parsed.createTime).toBe("2025-09-21T18:26:34.966Z");
  });

  it("unwraps ObjectId and UUID tokens", () => {
    const raw = '{ "_id": ObjectId("507f1f77bcf86cd799439011"), "uuid": UUID("0791e16e-fb8d-4a11-bad2-3d4c8bde3945") }';
    const parsed = JSON.parse(normalizeMongoShellExtendedTypes(raw));
    expect(parsed._id).toBe("507f1f77bcf86cd799439011");
    expect(parsed.uuid).toBe("0791e16e-fb8d-4a11-bad2-3d4c8bde3945");
  });

  it("coerces Mongo numeric helpers into string safe values", () => {
    const raw = '{ "count": NumberLong("9223372036854775807"), "small": NumberInt(5), "decimal": NumberDecimal("19.42") }';
    const parsed = JSON.parse(normalizeMongoShellExtendedTypes(raw));
    expect(parsed.count).toBe("9223372036854775807");
    expect(parsed.small).toBe("5");
    expect(parsed.decimal).toBe("19.42");
  });

  it("captures BinData payloads as base64 strings", () => {
    const raw = '{ "blob": BinData(0, "QUJDRA==") }';
    const parsed = JSON.parse(normalizeMongoShellExtendedTypes(raw));
    expect(parsed.blob).toBe("base64:QUJDRA==");
  });

  it("keeps literal strings containing token names untouched", () => {
    const raw = '{ "note": "This mentions ISODate(\\"2020\\") but should stay literal" }';
    const sanitized = normalizeMongoShellExtendedTypes(raw);
    expect(sanitized).toBe(raw);
    expect(JSON.parse(sanitized).note).toBe('This mentions ISODate("2020") but should stay literal');
  });
});
