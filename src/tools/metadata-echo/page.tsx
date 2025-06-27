/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import { getToolByRoute } from "../index";
import { ToolLayout } from "../../design-system/components/layout";
import MetadataEchoView from "../../../view/MetadataEchoView";
import useMetadataEcho from "../../../viewmodel/useMetadataEcho";

const MetadataEchoPage: React.FC = () => {
  const vm = useMetadataEcho();
  const tool = getToolByRoute("/metadata-echo");
  return (
    <ToolLayout
      tool={tool!}
      title="Metadata Echo"
      description="Display browser metadata for debugging."
    >
      <MetadataEchoView {...vm} />
    </ToolLayout>
  );
};

export default MetadataEchoPage;
