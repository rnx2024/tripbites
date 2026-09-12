import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JourneyContextPanel from "./JourneyContextPanel";

describe("JourneyContextPanel", () => {
  it("renders origin and destination", () => {
    render(
      <JourneyContextPanel
        context={{ origin: "Paris", destination: "Barcelona" }}
      />
    );
    const panel = screen.getByLabelText("Journey context");
    expect(panel).toHaveTextContent("Paris");
    expect(panel).toHaveTextContent("Barcelona");
  });

  it("renders nothing without context", () => {
    const { container } = render(<JourneyContextPanel />);
    expect(container).toBeEmptyDOMElement();
  });
});
