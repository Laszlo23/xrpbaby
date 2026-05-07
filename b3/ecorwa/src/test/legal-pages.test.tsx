import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CookiesPage from "@/pages/legal/CookiesPage";
import DisclaimerPage from "@/pages/legal/DisclaimerPage";
import ImprintPage from "@/pages/legal/ImprintPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import TermsPage from "@/pages/legal/TermsPage";

const routes = [
  { path: "/legal/terms", Page: TermsPage, heading: "Terms of Use" },
  { path: "/legal/privacy", Page: PrivacyPage, heading: "Privacy Notice" },
  { path: "/legal/cookies", Page: CookiesPage, heading: "Cookie Notice" },
  { path: "/legal/imprint", Page: ImprintPage, heading: "Imprint" },
  { path: "/legal/disclaimer", Page: DisclaimerPage, heading: "Risk & information disclaimer" },
] as const;

describe("legal pages", () => {
  it.each(routes)("renders $heading at $path", ({ path, Page, heading }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={<Page />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});
