/**
 * @vitest-environment jsdom
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SwipeDeck } from "../SwipeDeck";
import type { Place } from "@/lib/mockPlaces";

const createPlaces = (): Place[] => [
  {
    id: "1",
    name: "First Place",
    photoUrl: "https://example.com/first.jpg",
    category: "Restaurant",
    description: "First description",
  },
  {
    id: "2",
    name: "Second Place",
    photoUrl: "https://example.com/second.jpg",
    category: "Cafe",
    description: "Second description",
  },
];

describe("SwipeDeck", () => {
  it("renders the first place and advances after saving with the button", async () => {
    const places = createPlaces();
    const onSave = vi.fn();
    const onDiscard = vi.fn();

    render(<SwipeDeck places={places} onSave={onSave} onDiscard={onDiscard} />);

    expect(screen.getAllByText(places[0].name)[0]).toBeDefined();
    const saveButtton = screen.getAllByLabelText("Save");
    expect(saveButtton[0]).toBeDefined()
    fireEvent.click(saveButtton[0]);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(places[0]);
    await screen.findAllByText(places[1].name);
    expect(onDiscard).not.toHaveBeenCalled();
  });


  it("renders completion message immediately when places is empty", () => {
    const onSave = vi.fn();
    const onDiscard = vi.fn();

    render(<SwipeDeck places={[]} onSave={onSave} onDiscard={onDiscard} />);

    expect(screen.getAllByText("You're all caught up")[0]).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
  });
});


