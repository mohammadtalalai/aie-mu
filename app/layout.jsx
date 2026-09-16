import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./theme-provider";

export const metadata = {
  title: "Artificial Intelligence Engineering | Mansoura University",
  description:
    "Artificial Intelligence Engineering Department at the Faculty of Engineering, Mansoura University.",
};

// Applies the saved theme BEFORE the page paints, so there's no
// flash of the wrong theme when the page loads.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>

      <body className="bg-[var(--bg)] text-[var(--fg-secondary)] antialiased">
        <ThemeProvider>
          <Navbar />

          <main>{children}</main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
