import type { LoaderFunction } from 'remix';
import { useLoaderData } from 'remix';
import Card from '~/components/Card';
import type { Entry } from '~/types';

export let loader: LoaderFunction = async ({ context }) => {
  const entries = await context.search();

  return { entries };
};

export default function Index() {
  let { entries } = useLoaderData<{ entries: Entry[] }>();

  return (
    <div className="grid grid-cols-masonry pl-px pt-px">
      {entries.map((entry) => (
        <Card
          key={entry.slug}
          className="hover:border-black focus:border-black z-0 hover:z-10 focus:z-10 sm:aspect-w-1 sm:aspect-h-1 -ml-px -mt-px"
          slug={entry.slug}
          category={entry.category}
          title={entry.title}
          description={entry.description}
        />
      ))}
    </div>
  );
}
