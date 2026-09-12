import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FollowUpSuggestions from "./FollowUpSuggestions";

describe("FollowUpSuggestions", () => {
  it("calls the selection handler", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <FollowUpSuggestions
        questions={["Ask about weather"]}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("button", { name: "Ask about weather" }));
    expect(onSelect).toHaveBeenCalledWith("Ask about weather");
  });

  it("renders nothing for empty questions", () => {
    const { container } = render(
      <FollowUpSuggestions questions={[]} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
