/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Popup } from '@components';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@utils';
import { useQueryState, createParser } from 'nuqs';
// Import video-react components
import { Player, ControlBar, BigPlayButton } from 'video-react';
// Import video-react styles
import 'video-react/dist/video-react.css';
import { Loader } from '@components/loader';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalVideoPlayerContext,
} from '@contexts';
import { useRouter } from 'next/router';

const customParseEnum = (enumObj) => {
  return createParser({
    parse(queryValue) {
      console.log(
        'Object.values(enumObj)',
        Object.values(enumObj).find((value) => value.value === queryValue),
      );
      if (
        queryValue &&
        Object.values(enumObj).find((value) => value.value === queryValue)
      ) {
        return Object.values(enumObj).find(
          (value) => value.value === queryValue,
        );
      } else {
        return null;
      }
    },
    serialize(value) {
      if (value) return value.value;
      return null;
    },
  }).withDefault?.(
    Object.values(enumObj).find((value) => value.value === 'all'),
  );
};

const MeditationItem = ({ duration, imageSrc, title, onClick }) => (
  <div
    className="fgm-course-item"
    data-toggle="modal"
    data-target="#meditationModal"
    onClick={onClick}
  >
    <div className="play-time">{duration}</div>
    <div className="fgm-image-wrap">
      <img src={imageSrc} alt={title} />
    </div>
    <div className="fgm-course-title">{title}</div>
  </div>
);

// Inline styles for the meditation modal
const modalStyles = {
  modalAudioWrap: {
    margin: '20px 0',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  meditationTopics: {
    marginTop: '20px',
    padding: '15px 0',
  },
  topicList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '10px',
  },
  topicItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0f4f8',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  topicIcon: {
    width: '20px',
    height: '20px',
  },
  videoPlayerWrap: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
};

const LENGTHS = {
  ALL_LENGTHS: {
    label: 'All lengths',
    value: 'all',
  },
  SHORT: {
    label: 'Short',
    value: 'short',
  },
  MEDIUM: {
    label: 'Medium',
    value: 'medium',
  },
  LONG: {
    label: 'Long',
    value: 'long',
  },
};

const LEVELS = {
  ALL_LEVELS: {
    label: 'All levels',
    value: 'all',
  },
  BEGINNERS: {
    label: 'Beginners',
    value: 'beginners',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    value: 'intermediate',
  },
  EXPERT: {
    label: 'Expert',
    value: 'expert',
  },
};

// MeditationModal component
const MeditationModal = ({ selectedMeditation, isOpen, onClose }) => {
  const playerRef = useRef(null);

  // Handle auto-play when modal opens
  useEffect(() => {
    if (isOpen && playerRef.current) {
      // Small delay to ensure player is loaded
      setTimeout(() => {
        playerRef.current.play();
      }, 300);
    }
  }, [isOpen]);

  // Handle close with video stopping
  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="meditation-video-modal modal fade bd-example-modal-lg show"
      id="meditationModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        // Close modal when clicking on the backdrop (not on modal content)
        if (e.target.id === 'meditationModal') {
          handleClose();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              onClick={handleClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div
              className="modal-video-wrap"
              style={{ position: 'relative', ...modalStyles.videoPlayerWrap }}
            >
              <Player
                ref={playerRef}
                playsInline
                fluid={true}
                poster={
                  selectedMeditation?.coverImage?.file?.url
                    ? `https:${selectedMeditation.coverImage.file.url}`
                    : '/img/ds-course-preview-1.webp'
                }
                src={selectedMeditation?.videoUrl}
              >
                <ControlBar autoHide={true} className="my-custom-class" />
                <BigPlayButton position="center" />
              </Player>
            </div>

            <div className="video-title">
              {selectedMeditation?.title || 'Sri Sri Yoga Foundation Program'}
            </div>
            <div className="video-desc">
              {selectedMeditation?.description ||
                'In this video, meet happiness expert and celebrated author Rajshree Patel and discover a new approach to sleep. Through this course, you will find a set of effective and simple techniques to enhance the quality of your rest. Welcome and enjoy!'}
            </div>
            <div className="video-other-info">
              <div className="other-info-item">
                <label>Activity</label>
                <div className="text">Meditation</div>
              </div>
              <div className="other-info-item">
                <label>Type</label>
                <div className="text">
                  {selectedMeditation?.category &&
                  selectedMeditation.category.length > 0
                    ? selectedMeditation.category.join(', ')
                    : 'Guided'}
                </div>
              </div>
              <div className="other-info-item">
                <label>Duration</label>
                <div className="text">
                  {selectedMeditation?.duration
                    ? `${Math.floor(selectedMeditation.duration / 60)} min ${selectedMeditation.duration % 60} sec`
                    : '20 min'}
                </div>
              </div>
              <div className="other-info-item">
                <label>Teacher</label>
                <div className="text">
                  {selectedMeditation?.teacher?.name || 'Gurudev'}
                </div>
              </div>
            </div>

            {selectedMeditation?.topic &&
              selectedMeditation.topic.length > 0 && (
                <div
                  className="meditation-topics"
                  style={modalStyles.meditationTopics}
                >
                  <h4>Topics</h4>
                  <div className="topic-list" style={modalStyles.topicList}>
                    {selectedMeditation.topic.map((topic, index) => (
                      <div
                        key={`topic-${topic.id || ''}-${index}`}
                        className="topic-item"
                        style={modalStyles.topicItem}
                      >
                        {topic.icon?.file?.url && (
                          <img
                            src={`https:${topic.icon.file.url}`}
                            alt={topic.name}
                            className="topic-icon"
                            style={modalStyles.topicIcon}
                          />
                        )}
                        <span>{topic.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuidedMeditation = () => {
  const [lengthFilter, setLengthFilter] = useQueryState(
    'length',
    customParseEnum(LENGTHS),
  );
  const [levelFilter, setLevelFilter] = useQueryState(
    'level',
    customParseEnum(LEVELS),
  );
  const [selectedMeditationId, setSelectedMeditationId] =
    useQueryState('meditation');
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manuallySelectedId, setManuallySelectedId] = useState(null);
  const router = useRouter();
  const { id: rootFolderID } = router.query;
  const { isAuthenticated } = useAuth();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();

  const { data: guidedMeditations = [], isLoading: loading } = useQuery({
    queryKey: ['getContentsByFolder', lengthFilter, levelFilter],
    queryFn: async () => {
      const response = await api.get({
        path: 'getContentsByFolder',
        params: {
          folderId: rootFolderID,
          ...(lengthFilter &&
            lengthFilter.value !== 'all' && { length: lengthFilter.value }),
          ...(levelFilter &&
            levelFilter.value !== 'all' && { level: levelFilter.value }),
        },
      });
      return response.data;
    },
  });

  const meditateClickHandle = async (meditate) => {
    // Set manually selected ID to prevent infinite loop with useEffect
    setManuallySelectedId(meditate.id);

    // Get the correct video URL based on the available data
    let videoUrl = null;
    if (meditate.videoUrl) {
      videoUrl = meditate.videoUrl;
    } else if (meditate.contentType === 'Video' && meditate.track?.file?.url) {
      // Format: //videos.ctfassets.net/path/to/video.mp4
      videoUrl = `https:${meditate.track.file.url}`;
    }

    // Store the selected meditation for context with the correct video URL
    setSelectedMeditationId(meditate.id);
    setSelectedMeditation({
      ...meditate,
      videoUrl,
    });

    if (
      meditate.contentType === 'Audio' ||
      meditate.contentType === 'audio/x-m4a'
    ) {
      // For audio, use the global audio player without showing the modal
      const audioSrc = meditate.track?.file?.url
        ? `https:${meditate.track.file.url}`
        : null;

      showPlayer({
        track: {
          title: meditate.title,
          artist: meditate.teacher?.name,
          image: meditate.coverImage?.file?.url
            ? `https:${meditate.coverImage.file.url}`
            : null,
          audioSrc,
        },
        autoPlay: true, // The AudioPlayer component now handles autoPlay automatically
      });
    } else if (meditate.contentType === 'Video') {
      // For video, open the modal and use the video player
      setIsModalOpen(true);
      hidePlayer();
    }
  };

  const onFilterChange = (field) => async (selectedValue) => {
    switch (field) {
      case 'lengthFilter':
        setLengthFilter(selectedValue);
        break;
      case 'levelFilter':
        setLevelFilter(selectedValue);
        break;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  // Play meditation on page load if selectedMeditationId is present in query params
  useEffect(() => {
    if (
      selectedMeditationId &&
      guidedMeditations.length > 0 &&
      selectedMeditationId !== manuallySelectedId
    ) {
      const meditation = guidedMeditations.find(
        (m) => m.id === selectedMeditationId,
      );
      if (meditation) {
        meditateClickHandle(meditation);
      }
    }
  }, [
    selectedMeditationId,
    guidedMeditations,
    meditateClickHandle,
    manuallySelectedId,
  ]);

  return (
    <main className="free-guided-meditations">
      {loading && <Loader />}
      <section className="title-header">
        <div className="container">
          <h1 className="page-title">Free guided meditations by Gurudev</h1>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="filter-wrapper">
            <div className="filters">
              <Popup
                value={lengthFilter}
                buttonText={lengthFilter?.label}
                closeEvent={onFilterChange('lengthFilter')}
                label=""
                parentClassName="dde"
              >
                {({ closeHandler }) => (
                  <ul className="courses-filter__list">
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.ALL_LENGTHS)}
                    >
                      {LENGTHS.ALL_LENGTHS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.SHORT)}
                    >
                      {LENGTHS.SHORT.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.MEDIUM)}
                    >
                      {LENGTHS.MEDIUM.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.LONG)}
                    >
                      {LENGTHS.LONG.label}
                    </li>
                  </ul>
                )}
              </Popup>
              <Popup
                value={levelFilter}
                buttonText={levelFilter?.label}
                closeEvent={onFilterChange('levelFilter')}
                label=""
                parentClassName="dde"
              >
                {({ closeHandler }) => (
                  <ul className="courses-filter__list">
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.ALL_LEVELS)}
                    >
                      {LEVELS.ALL_LEVELS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.BEGINNERS)}
                    >
                      {LEVELS.BEGINNERS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.INTERMEDIATE)}
                    >
                      {LEVELS.INTERMEDIATE.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.EXPERT)}
                    >
                      {LEVELS.EXPERT.label}
                    </li>
                  </ul>
                )}
              </Popup>
            </div>
            <div className="total-count">
              Displaying {guidedMeditations?.length || 0} free meditations
            </div>
          </div>
        </div>
      </section>
      <section className="section-courses">
        <div className="container">
          <div className="fgm-courses-listing">
            {guidedMeditations?.map((item, index) => (
              <MeditationItem
                key={`meditation-${item.id || ''}-${item.folder}-${index}`}
                duration={
                  item.duration
                    ? `${Math.floor(item.duration / 60)} min`
                    : '5 min'
                }
                imageSrc={
                  item.coverImage?.file?.url
                    ? `https:${item.coverImage.file.url}`
                    : `/img/ds-course-preview-${(index % 7) + 1}.webp`
                }
                title={item.title || 'Guided Meditation'}
                onClick={() => meditateClickHandle(item)}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="QR-wrapper">
        <img src="/img/QR-Code-Guided-Meditation-app.png" alt="QR Code" />
      </div>
      <div className="app-download">
        <img src="/img/mobile-app-store-ios.webp" alt="iOS" />
        <img src="/img/mobile-app-store-android.webp" alt="Android" />
      </div>

      <MeditationModal
        selectedMeditation={selectedMeditation}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  );
};

GuidedMeditation.hideFooter = true;

export default GuidedMeditation;
