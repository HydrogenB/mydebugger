/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useMemo } from "react";
import { ToolLayout } from "@design-system";
import { getToolByRoute } from "../index";
import BsonCsvTool from "./components/BsonCsvTool";

const BsonCsvPage: React.FC = () => {
  const tool = useMemo(() => getToolByRoute("/bson-csv"), []);

  if (!tool) {
    return null;
  }

  return (
    <ToolLayout
      tool={tool}
      title="BSON/JSON to CSV Converter"
      description="Convert MongoDB BSON or JSON dumps into RFC4180-compliant CSV entirely in your browser."
      showRelatedTools
    >
      <BsonCsvTool />
    </ToolLayout>
  );
};

export default BsonCsvPage;
