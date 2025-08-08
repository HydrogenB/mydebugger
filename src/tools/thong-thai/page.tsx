/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from "react";
import useThaiFlag from "../../../viewmodel/useThaiFlag";
import ThaiFlagView from "../../../view/ThaiFlagView";
import { ToolLayout } from "../../design-system/components/layout";
import { getToolByRoute } from "../index";

const ThaiFlagPage: React.FC = () => {
  const vm = useThaiFlag();
  const tool = getToolByRoute("/thong-thai");
  return (
    <ToolLayout
      tool={tool!}
      title="Thai Flag Generator"
      description="Generate the Thai national flag"
      showRelatedTools={false}
    >
      <ThaiFlagView {...vm} />
    </ToolLayout>
  );
};

export default ThaiFlagPage;
