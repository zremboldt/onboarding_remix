import "~/styles/theme-config.css";
import "~/styles/global.css";
import { Theme } from "@radix-ui/themes";
import radixThemeStyles from "@radix-ui/themes/styles.css";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
  useOutlet,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";

import { RootLogo } from "~/components/root-logo";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: radixThemeStyles },
  // { rel: "stylesheet", href: globalStyles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => {
  return [
    { title: "Root Insurance" },
    { name: "description", content: "Here is a page description" },
  ];
};

export default function App() {
  const outlet = useOutlet();
  const location = useLocation();
  const key =
    location.pathname !== "/which-vehicles/add-vehicle-dialog"
      ? location.pathname
      : "/which-vehicles";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        <Theme
          accentColor="tomato"
          radius="small"
          scaling="100%"
          appearance={"dark"}
        >
          {/* <ThemePanel /> */}

          <header>
            <Link to="/name" className="logo-link">
              <RootLogo />
            </Link>
          </header>

          <main>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="main-content-wrap"
                key={key}
                initial={{ x: "0%", opacity: 0 }}
                animate={{ x: "0", opacity: 1 }}
                exit={{ x: "-0%", opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* <ScrollRestoration /> */}
          <Scripts />
          <LiveReload />
        </Theme>
      </body>
    </html>
  );
}
