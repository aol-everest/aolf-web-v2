import { createClient } from 'contentful';

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || '',
});

export const fetchContentfulDataDetails = async (entryId) => {
  try {
    const entry = await client.getEntry(entryId);
    return {
      ...entry.fields,
    };
  } catch (error) {
    console.error('Error fetching entry:', error);
    return null;
  }
};

export const fetchContentfulBannerDetails = async (entryId) => {
  try {
    const entries = await client.getEntries({
      content_type: 'banner', // Replace 'banner' with your actual content type ID
      limit: 10, // Adjust the limit based on your needs
    });

    return entries.items.map((entry) => {
      // Directly modify the URL if needed
      const media = entry.fields.media;
      if (media && media.fields && media.fields.file && media.fields.file.url) {
        const url = media.fields.file.url;
        if (url.startsWith('//')) {
          media.fields.file.url = `https:${url}`;
        }
      }

      return {
        ...entry.fields,
      };
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};
