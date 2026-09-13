import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MatchCardList, type Match } from "./MatchCardList";

const match: Match = {
  id: "m-1",
  match_score: 86,
  match_reasoning: "Strong fit because this project is security heavy and grants favor infrastructure teams.",
  funders: {
    name: "Open Source Seed Fund",
    description: "Seed funding for OSS teams.",
    amount_range: "$25k - $100k",
    application_type: "direct_application",
    application_url: "https://example.com/apply",
    focus_tags: ["security", "infrastructure"],
  },
};

describe("MatchCardList", () => {
  it("renders funder details and calls generate pitch callback", () => {
    const onGeneratePitch = vi.fn();

    render(
      <MatchCardList
        matches={[match]}
        selectedMatch={match}
        generatingPitch={false}
        onGeneratePitch={onGeneratePitch}
      />
    );

    expect(screen.getByText("Open Source Seed Fund")).toBeInTheDocument();
    expect(screen.getByText(/strong fit because/i)).toBeInTheDocument();
    expect(screen.getByText("86")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /funder website/i })).toHaveAttribute(
      "href",
      "https://example.com/apply"
    );

    fireEvent.click(screen.getByRole("button", { name: /generate pitch/i }));
    expect(onGeneratePitch).toHaveBeenCalledWith(match);
  });
});
