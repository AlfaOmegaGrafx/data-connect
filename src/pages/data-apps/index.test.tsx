import { describe, expect, it, beforeEach, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { open } from "@tauri-apps/plugin-shell"
import { LINKS } from "@/config/links"
import { DataApps } from "./index"

const mockNavigate = vi.fn()

vi.mock("@tauri-apps/plugin-shell", () => ({
  open: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<object>("react-router")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderDataApps = () => {
  const router = createMemoryRouter(
    [{ path: "/apps", element: <DataApps /> }],
    {
      initialEntries: ["/apps"],
    }
  )

  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("DataApps", () => {
  it("renders the page title and description", () => {
    renderDataApps()

    expect(
      screen.getByRole("heading", { level: 1, name: "Data Apps" })
    ).toBeTruthy()
    expect(
      screen.getByText(/Create apps with the Vana Data Protocol/i)
    ).toBeTruthy()
  })

  it("renders app builder placeholder CTA", () => {
    renderDataApps()

    expect(screen.getAllByText("Add your app here").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("View Next.js example app").length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByRole("button", { name: "Open app builder registration" }).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("renders the learn more documentation link", () => {
    renderDataApps()

    const learnMoreLinks = screen.getAllByRole("link", { name: /Learn more/i })
    expect(learnMoreLinks.length).toBeGreaterThan(0)
    learnMoreLinks.forEach(link => {
      expect(link.getAttribute("href")).toBe(LINKS.vanaDocsProtocol)
    })
  })

  it("opens app builder docs when CTA is clicked", async () => {
    renderDataApps()

    fireEvent.click(
      screen.getAllByRole("button", { name: "Open app builder registration" })[0]
    )

    const mockOpen = vi.mocked(open)
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(LINKS.appBuilderExample)
    })
  })
})
