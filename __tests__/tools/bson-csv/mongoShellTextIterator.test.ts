/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import fs from "node:fs";
import path from "node:path";
import {
  hasMongoShellMarkers,
  parseMongoShellDump,
} from "../../../src/tools/bson-csv/utils/mongoShellText";

describe("iterateMongoShellText", () => {
  it("parses Mongo shell multi-document dumps into objects", async () => {
    const fixturePath = path.join(__dirname, "__fixtures__", "digitalIdDump.txt");
    const text = fs.readFileSync(fixturePath, "utf8");

    expect(hasMongoShellMarkers(text)).toBe(true);

    const warnings: string[] = [];
    const docs = parseMongoShellDump(text, { onWarning: (message) => warnings.push(message) });

    expect(warnings).toEqual([]);
    expect(docs).toHaveLength(50);
    expect(docs[0]).toMatchObject({
      _id: "8c9dd1b0a4875f501650b592c0507bc5",
      lastUpdateTime: "2025-09-21T18:26:34.966Z",
    });
    expect(typeof docs[0].lastUpdateTime).toBe("string");
    expect(docs[49]).toMatchObject({
      _id: "9145c243b8b17f5b85dcac5589345078",
      status: "A",
    });
  });
});
