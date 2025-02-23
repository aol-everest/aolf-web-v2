import React, { useMemo, useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { Loader } from '@components/loader';

const ExploreCourses = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [selectedVideo, setSelectedVideo] = useState({});
  const [activeSession, setActiveSession] = useQueryState('session', {
    defaultValue: null,
  });
  const [playing, setPlaying] = useState(false);

  const { data: introData = [], isLoading } = useQuery({
    queryKey: ['get-started-intro-series-details', slug],
    queryFn: async () => {
      const response = await api.get({
        path: 'get-started-intro-series',
        param: {
          slug: slug,
        },
      });

      if (activeSession === null) {
        setActiveSession(response?.data?.videos?.[0].id);
      }
      return response.data;
    },
  });

  useEffect(() => {
    if (activeSession !== null && introData?.videos?.length > 0) {
      setSelectedVideo({
        ...(introData?.videos?.find((video) => video.id === activeSession) ||
          []),
        videoIndex: introData?.videos?.findIndex(
          (video) => video.id === activeSession,
        ),
      });
    }
  }, [activeSession, introData]);

  const handlePlayVideo = (video, videoIndex) => {
    setActiveSession(video.id);
    setPlaying(true);
  };

  const handleNextVideo = () => {
    const nextVideo = introData?.videos?.[selectedVideo.videoIndex + 1];
    handlePlayVideo(nextVideo, selectedVideo.videoIndex + 1);
  };

  const handlePreviousVideo = () => {
    const previousVideo = introData?.videos?.[selectedVideo.videoIndex - 1];
    handlePlayVideo(previousVideo, selectedVideo.videoIndex - 1);
  };

  const stepperPercentage = useMemo(() => {
    const totalVideos = introData?.videos?.length;
    const currentIndex = selectedVideo?.videoIndex + 1;

    return (currentIndex / totalVideos) * 100;
  }, [selectedVideo, introData]);

  return (
    <main class="explore-anxiety">
      <section class="section-videos-series">
        <div class="container">
          {isLoading && <Loader />}
          <div class="explore-video-wrap">
            <div class="video-col-left">
              <div class="page-title">{introData.title}</div>
              <div class="video-stepper">
                <div class="stepper-info">
                  Video series
                  <span class="count">
                    {selectedVideo.videoIndex + 1}/{introData?.videos?.length}
                  </span>
                </div>
                <div class="stepper-bar">
                  <span
                    class="filler"
                    style={{ width: `${stepperPercentage}%` }}
                  ></span>
                </div>
              </div>
              <div class="video-player-wrap">
                <ReactPlayer
                  url={selectedVideo.media}
                  controls
                  width="560"
                  height="315"
                  playing={playing}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  light={playing ? false : selectedVideo?.thumbnail}
                  className="main-video"
                  onClick={() =>
                    handlePlayVideo(selectedVideo, selectedVideo.videoIndex)
                  }
                />
              </div>
              <div class="video-title">{selectedVideo.title}</div>
              <div class="video-description">{selectedVideo.description}</div>
              <button
                class="showMoreToggleBtn"
                onClick="this.classList.toggle('show')"
              ></button>
              <div class="bottom-actions">
                <a
                  onClick={handlePreviousVideo}
                  class={`btn prev ${selectedVideo.videoIndex === 0 ? 'disabled' : ''}`}
                >
                  Previous
                </a>
                {/* <a class="btn primary">Mark as complete</a> */}
                <a
                  onClick={handleNextVideo}
                  class={`btn next ${selectedVideo.videoIndex === introData?.videos?.length - 1 ? 'disabled' : ''}`}
                >
                  Next
                </a>
              </div>
            </div>
            <div class="video-col-right">
              <div class="video-stepper">
                <div class="stepper-info">
                  Video series{' '}
                  <span class="count">
                    {selectedVideo.videoIndex + 1}/{introData?.videos?.length}
                  </span>
                </div>
                <div class="stepper-bar">
                  <span
                    class="filler"
                    style={{ width: `${stepperPercentage}%` }}
                  ></span>
                </div>
              </div>
              <div class="video-playlist">
                {introData.videos?.map((item, index) => {
                  return (
                    <div
                      class={`playlist-item ${selectedVideo?.videoIndex === index ? 'playing' : ''}`}
                      onClick={() => handlePlayVideo(item, index)}
                      key={index}
                    >
                      <div class="item-number">{index + 1}</div>
                      <div class="item-thumb">
                        <img src={item?.thumbnail} alt="Reduce Anxiety" />
                      </div>
                      <div class="item-details">
                        <div class="day-number">
                          {item?.title?.split('-')?.[1] || `Day ${index + 1}`}
                        </div>
                        <div class="video-title">{item.title}</div>
                        {item.duration && (
                          <div class="video-duration">{item.duration} Min</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ExploreCourses;
