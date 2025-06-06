import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ToolsCard from "@/view/ui/ToolsCard";
import Button from "@/view/ui/Button";

describe("ToolsCard", () => {
  it("renders title and description", () => {
    render(<ToolsCard title="Card" description="Details" icon="🔧" />);
    expect(screen.getByText("Card")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });


  it("renders actions and tags", () => {
    render(
      <ToolsCard
        title="title"
        description="desc"
        tags={["new"]}
        actions={<Button>Go</Button>}
      />,
    );
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go/i })).toBeInTheDocument();
  });
});
