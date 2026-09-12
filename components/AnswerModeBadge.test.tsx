import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AnswerModeBadge from "./AnswerModeBadge";

describe("AnswerModeBadge", () => {
  it("renders the journey planning label", () => {
    render(<AnswerModeBadge answerMode="journey_planning" />);
    expect(
      screen.getByLabelText("Answer mode: Journey Assessment")
    ).toBeInTheDocument();
  });

  it("renders nothing without a mode", () => {
    const { container } = render(<AnswerModeBadge />);
    expect(container).toBeEmptyDOMElement();
  });
});
