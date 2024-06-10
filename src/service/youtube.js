const apiKey = `${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;

async function getPlaylistDetails(playlistId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const items = data.items || [];

    const videoIds = items.map(({ snippet }) => snippet.resourceId.videoId);

    const videoDetails = await getVideoDetails(videoIds);

    let result = items.map((item) => {
      const videoDetail = videoDetails.find(
        (v) => v.id === item.snippet.resourceId.videoId,
      );
      return { ...item, videoDetail };
    });

    result.sort((a, b) => {
      const dateA = new Date(a.videoDetail.snippet.publishedAt);
      const dateB = new Date(b.videoDetail.snippet.publishedAt);
      return dateB - dateA;
    });

    const mostPopular = getMostViewedVideo(result);
    if (mostPopular) {
      result = result.filter((video) => {
        return video.videoDetail.id !== mostPopular.videoDetail.id;
      });
    }

    return { mostPopular, all: result };
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    throw error;
  }
}

function getMostViewedVideo(playlistDetails) {
  if (!playlistDetails || playlistDetails.length === 0) {
    throw new Error('Playlist details are empty or undefined.');
  }

  const mostViewedVideo = playlistDetails.reduce((prev, current) => {
    const prevViewCount = prev.videoDetail.statistics.viewCount || 0;
    const currentViewCount = current.videoDetail.statistics.viewCount || 0;

    return currentViewCount > prevViewCount ? current : prev;
  });

  return mostViewedVideo;
}

async function searchVideos(query, maxResults = 10) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    return data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
    }));
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

async function getVideoDetails(videoIds) {
  const videoQueryParams = videoIds.map((id) => `id=${id}`);

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&${videoQueryParams.join(
    '&',
  )}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items.length === 0) {
      throw new Error('Video not found.');
    }

    const result = data.items.map((item) => {
      const duration = convertDurationToHHMMSS(item.contentDetails.duration);
      return { ...item, duration };
    });

    return result;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

function convertDurationToHHMMSS(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  const formattedDuration = [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, '0'))
    .join(':');

  return formattedDuration;
}

export { getPlaylistDetails, searchVideos, getVideoDetails };
