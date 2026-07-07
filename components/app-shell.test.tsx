import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the CargoGrid scaffold message and Finance Lite preview", () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: /logistics erp foundation/i })).toBeInTheDocument();
    expect(screen.getByText(/server-side module gates/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /finance lite \/ dso \/ ar rebuild/i })).toBeInTheDocument();
    expect(screen.getAllByText(/outstanding invoices/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /communication & notification rebuild/i })).toBeInTheDocument();
    expect(screen.getByText(/event-triggered communication/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /attendance \/ workforce \/ location rebuild/i })).toBeInTheDocument();
    expect(screen.getByText(/check-in\/check-out events/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /issue report \/ internal ticket \/ exception rebuild/i })).toBeInTheDocument();
    expect(screen.getByText(/exception management links/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /menu \/ module \/ ui configuration rebuild/i })).toBeInTheDocument();
    expect(screen.getByText(/without hardcoded tenant behavior/i)).toBeInTheDocument();
  });
});
