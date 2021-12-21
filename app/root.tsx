import type {
  LinksFunction,
  MetaFunction,
  LoaderFunction,
  ShouldReloadFunction,
} from 'remix';
import {
  Meta,
  Link,
  Links,
  Scripts,
  useLoaderData,
  useLocation,
  LiveReload,
  useCatch,
  Outlet,
  ScrollRestoration,
  json,
} from 'remix';
import { useMemo } from 'react';
import SidebarNavigation from '~/components/SidebarNavigation';
import { categories, platforms, integrations } from '~/meta';
import type { Context } from '~/types';
import stylesUrl from '~/styles/tailwind.css';

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export let meta: MetaFunction = () => {
  return {
    title: 'Remix Guide',
    description: 'An interactive list of awesome stuffs about Remix',
    viewport: 'width=device-width, initial-scale=1',
  };
};

export let loader: LoaderFunction = async ({ context }) => {
  const { session } = context as Context;
  const profile = await session.isAuthenticated();

  return json({
    profile,
  });
};

/**
 * Not sure if this is a bad idea or not to minimise requests
 * But the only time this data change is when user login / logout
 * Which trigger a full page reload at the moment
 */
export const unstable_shouldReload: ShouldReloadFunction = () => {
  return false;
};

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="relative w-full h-full min-h-screen flex bg-black text-gray-200">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  const { profile } = useLoaderData();
  const location = useLocation();
  const [isMenuEnabled, closeMenuLink] = useMemo(() => {
    const searchPararms = new URLSearchParams(location.search);
    const isMenuShown = searchPararms.has('menu');

    if (isMenuShown) {
      searchPararms.delete('menu');
    }

    return [isMenuShown, searchPararms.toString()];
  }, [location.search]);

  return (
    <Document>
      <nav
        className={`${
          isMenuEnabled ? 'absolute xl:relative bg-black' : 'hidden'
        } z-40 xl:block w-72 h-full border-r`}
      >
        <SidebarNavigation
          categories={categories}
          platforms={platforms}
          integrations={integrations}
          profile={profile}
        />
      </nav>
      {!isMenuEnabled ? null : (
        <Link
          className={`xl:hidden backdrop-filter z-30 absolute top-0 left-0 right-0 bottom-0 backdrop-blur-sm`}
          to={`?${closeMenuLink}`}
          replace
        />
      )}
      <main className="flex-1">
        <Outlet />
      </main>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  switch (caught.status) {
    case 401:
    case 404:
      return (
        <Document title={`${caught.status} ${caught.statusText}`}>
          <div className="min-h-screen py-4 flex flex-1 flex-col justify-center items-center">
            <h1>
              {caught.status} {caught.statusText}
            </h1>
          </div>
        </Document>
      );

    default:
      throw new Error(
        `Unexpected caught response with status: ${caught.status}`
      );
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div className="min-h-screen py-4 flex flex-1 flex-col justify-center items-center">
        <h1>Sorry, something went wrong...</h1>
      </div>
    </Document>
  );
}
