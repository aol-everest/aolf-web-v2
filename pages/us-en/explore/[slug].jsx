import React, { useMemo, useState } from 'react';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { Loader } from '@components/loader';

const ExploreCourses = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [selectedVideo, setSelectedVideo] = useState({});
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
      setSelectedVideo({
        ...(response?.data?.videos?.[0] || []),
        videoIndex: 0,
      });
      return response.data;
    },
  });

  const handlePlayVideo = (video, videoIndex) => {
    setSelectedVideo({
      ...video,
      videoIndex,
    });
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
              <div class="top-actions">
                <a onClick={router.back} class="back-btn">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.57 5.93018L3.5 12.0002L9.57 18.0702"
                      stroke="#31364E"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.4999 12H3.66992"
                      stroke="#31364E"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </a>
              </div>
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
              <div class="video-description">
                {selectedVideo.description ||
                  `In this video, celebrated happiness expert Rajshree Patel
                enlightens you about what stress is and how it negatively
                affects your body. You’ll learn the causes of stress and how it
                affects your body chemistry. Stress causes changes in our
                bodies, and it can have a cumulative effect in our lives. Find
                out now.`}
              </div>
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
                        <div class="video-duration">
                          {item.duration || '7 Min'}
                        </div>
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
