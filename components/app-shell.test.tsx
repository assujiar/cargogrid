import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the CargoGrid scaffold message", () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: /logistics erp foundation/i })).toBeInTheDocument();
    expect(screen.getByText(/business erp modules/i)).toBeInTheDocument();
  });
});
