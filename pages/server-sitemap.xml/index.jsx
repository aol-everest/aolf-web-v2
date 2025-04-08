import { getServerSideSitemap } from 'next-sitemap';
import { api } from '@utils';

export const getServerSideProps = async (ctx) => {
  try {
    // Fetch courses and events
    const [courses, events] = await Promise.all([
      api.get({ path: 'courses' }),
      api.get({ path: 'events' }),
    ]);

    // Generate fields for courses
    const courseFields = (courses || []).map((course) => ({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/us-en/courses/${course.slug || course.id}`,
      lastmod: course.updatedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    }));

    // Generate fields for events
    const eventFields = (events || []).map((event) => ({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/us-en/events/${event.slug || event.id}`,
      lastmod: event.updatedAt || new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    }));

    // Combine all fields
    const fields = [...courseFields, ...eventFields];

    // Return the sitemap
    return getServerSideSitemap(ctx, fields);
  } catch (error) {
    console.error('Error generating server sitemap:', error);
    return {
      notFound: true,
    };
  }
};

// Default export to prevent next.js errors
export default function Sitemap() {}
