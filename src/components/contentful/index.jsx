import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
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
