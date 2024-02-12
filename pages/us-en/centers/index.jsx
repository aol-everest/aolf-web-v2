/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { PageLoading } from '@components';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useEffectOnce } from 'react-use';
import ErrorPage from 'next/error';
import { api, createCompleteAddress, joinPhoneNumbers } from '@utils';
import GoogleMapComponent from '@components/googleMap';
import { useGeolocation } from '@uidotdev/usehooks';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import LinesEllipsis from 'react-lines-ellipsis';
import Highlighter from 'react-highlight-words';

const GOOGLE_URL = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&v=3.exp&libraries=geometry,drawing,places`;

const STORIES = [
  {
    index: 1,
    title: 'Much more confident and happier, depsite the struggles',
    body: `Before the Art of Living Part 1 Course, I was on medication for panic and anxiety attacks.
    After the first day of the Art of Living Part 1 Course, I experienced a full night's sleep,
    which was rare for me. The next morning was one of t the happiest I had ever felt.
    I've been constant with my SKY meditation practice for the last two years - it makes me feel so alive.
     My friends and family tell me that I am much more confident and happier. Despite the struggles last
     year - my grandfather passed away, I lost my job and I went through a divorce - I still did not
     have a panic or anxiety attack. I feel grateful for this inner strength because I don't know where
     I would be without it`,
    authorName: 'Robert Delmont',
    authorTitle: 'Elementary music teacher, Boston, MA',
    authorPic: '/img/Testimony-Robert.webp',
  },
  {
    index: 3,
    title: 'Come to Work in a Better Mindset',
    body: `I was always interested in meditation and I had never meditated before. It was always something
    that was sort of elusive but I thought that I maybe never be capable of it. I thought that maybe my
    mind moved too quickly or I wasn't focus sed enough. Directly after the course and since then...
    just this understanding that this moment in the now is to be appreciated and enjoyed... and that
    released a lot of stress for meWhen I come to work having already centered myself, it's way easier
    to plan... delegate tasks to other people, or work with other people. Now I come to work in a much
    better mindset, and that in turn translates into the quality of work and the way I deal with people at
    work. Just the way I process emotions, thoughts, and feelings is different from before`,
    authorName: 'Dan J.',
    authorTitle: 'Chef Asheville, NC',
    authorPic: '/img/Testimony-Dan.webp',
  },
  {
    index: 1,
    title: 'Great insights and practical tools',
    body: `I joined the Art of Living Part 1 Course after an introductory meet up at the Art of Living
    Center. It felt like it could be a great program for me, and before I could change my mind,
    I signed up for it. If I had waited until later to   join, I would have missed out on a truly life
    transforming experience. The program gave me great insights and practical tools to dealing with life's
     stressful situations. I met some really good friends that I still stay in contact with`,
    authorName: 'Tiffany Guynes',
    authorTitle: 'Chef & private caterer, Austin, TX',
    authorPic: '/img/Testimony-Tiffany.webp',
  },
];

const SEARCH_PARAM = [
  'centerName',
  'streetAddress1',
  'streetAddress2',
  'stateProvince',
];
const SEARCH_PARAM_WITHOUT_ADDRESS = ['centerName', 'stateProvince'];

const CenterListItem = ({ center, search }) => {
  const router = useRouter();
  const goFindCourse = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course`,
      query: {
        city: center.city,
        timeZone: 'NAN',
      },
    });
  };
  const phoneNumber = joinPhoneNumbers(center.phone1, center.phone2);
  return (
    <div className="search-list-item">
      <div className="title">
        {center.isNationalCenter && (
          <img src="/img/center-icon.svg" alt="icon" className="icon" />
        )}
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={[search]}
          autoEscape={true}
          textToHighlight={`${center.centerName},  ${
            center.stateProvince || ''
          }`}
        />
      </div>
      {center.centerMode === 'InPerson' && (
        <div className="info">
          <img
            className="icon"
            src="/img/map-search-location-icon.svg"
            alt="call"
          />
          <Highlighter
            highlightClassName="YourHighlightClass"
            searchWords={[search]}
            autoEscape={true}
            textToHighlight={createCompleteAddress({
              streetAddress1: center.streetAddress1,
              streetAddress2: center.streetAddress2,
              city: center.city,
              zipCode: center.postalOrZipCode,
              state: center.stateProvince,
            })}
          />
        </div>
      )}
      {phoneNumber && (
        <div className="info">
          <img
            className="icon"
            src="/img/map-search-call-icon.svg"
            alt="call"
          />
          {phoneNumber}
        </div>
      )}
      {center.email && (
        <div className="info email">
          <img
            className="icon"
            src="/img/map-search-email-icon.svg"
            alt="email"
          />
          {center.email}
        </div>
      )}
      <div className="action-btn">
        <button className="submit-btn" onClick={goFindCourse}>
          Find Courses
        </button>
      </div>
    </div>
  );
};

const StoryComp = ({ story }) => {
  const [useEllipsis, setUseEllipsis] = useState(true);

  const readMoreClickAction = (e) => {
    if (e) e.preventDefault();
    setUseEllipsis(!useEllipsis);
  };
  return (
    <div className="testimony-item">
      <h3>{story.title}</h3>
      <div className="testimony-comment more">
        {useEllipsis ? (
          <>
            <span className="morecontent">
              <LinesEllipsis
                text={story.body}
                maxLine="5"
                ellipsis="..."
                trimRight
                basedOn="letters"
              />
              <a href="#" className="morelink" onClick={readMoreClickAction}>
                Read more...
              </a>
            </span>
          </>
        ) : (
          <>
            <span className="morecontent">
              {story.body}
              <a href="#" className="morelink" onClick={readMoreClickAction}>
                Read less...
              </a>
            </span>
          </>
        )}
      </div>
      <div className="author">
        <div className="author-pic">
          <img
            src={story.authorPic}
            alt={story.authorName}
            width="60"
            height="60"
          />
        </div>
        <div className="author-info">
          <div className="name">{story.authorName}</div>
          <div className="position">{story.authorTitle}</div>
        </div>
      </div>
    </div>
  );
};

const Centers = () => {
  const {
    loading,
    latitude,
    longitude,
    error: geoLocationError,
  } = useGeolocation();

  //     set search query to empty string
  const [q, setQ] = useState('');
  //     set search parameters
  //     we only what to search centers by centerName and streetAddress1
  //     this list can be longer if you want

  const finalLatitude = latitude ? latitude : 43.4142989;
  const finalLongitude = longitude ? longitude : -124.2301242;

  const {
    data: allCenters,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['allCenters', latitude, longitude],
    async () => {
      const response = await api.get({
        path: 'getAllCenters',
        param: {
          lat: finalLatitude,
          lng: finalLongitude,
        },
      });
      const data = (response.data || []).filter((center) => {
        return center.email || center.phone1 || center.phone2;
      });
      return data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const search = (items) => {
    return items.filter((item) => {
      if (item.centerMode === 'InPerson') {
        return SEARCH_PARAM.some((newItem) => {
          return (
            item[newItem]?.toString().toLowerCase().indexOf(q.toLowerCase()) >
            -1
          );
        });
      }
      return SEARCH_PARAM_WITHOUT_ADDRESS.some((newItem) => {
        return (
          item[newItem]?.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
      });
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 100, left: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setQ('');
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || loading) return <PageLoading />;
  return (
    <main className="local-centers">
      <section className="title-header">
        <h1 className="page-title">
          Connect, Grow, Celebrate. Join The Community
        </h1>
      </section>
      <section className="map-section">
        <GoogleMapComponent
          allCenters={search(allCenters)}
          googleMapURL={GOOGLE_URL}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div id="map" />}
          mapElement={<div style={{ height: `100%` }} />}
        ></GoogleMapComponent>
        <div className="center-search-box" id="mobile-handler">
          <div className="mobile-handler"></div>
          <div className="search-input-wrap">
            <input
              id="search-field"
              type="text"
              placeholder="Search..."
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q !== '' && (
              <button className="search-clear" onClick={clearSearch}>
                <svg
                  fill="#9698a6"
                  height="16px"
                  width="16px"
                  version="1.1"
                  id="Capa_1"
                  viewBox="0 0 490 490"
                >
                  <polygon
                    points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490
              489.292,457.678 277.331,245.004 489.292,32.337 "
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="search-listing">
            {search(allCenters).map((center) => {
              return (
                <CenterListItem key={center.sfid} center={center} search={q} />
              );
            })}
          </div>
        </div>
      </section>
      <section className="nourish">
        <div className="container">
          <h2 className="section-title">
            Nourish Your Spirit At Center Near You
          </h2>
          <div className="nourish-features">
            <div className="nourish-features-item">
              <div className="item-icon">
                <svg
                  width="45"
                  height="44"
                  viewBox="0 0 45 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.4991 21.999H12.1282C6.40053 21.999 1.75732 17.3558 1.75732 11.6281H12.1282C17.8559 11.6281 22.4991 16.2713 22.4991 21.999Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M12.1282 42.7408V32.3699C12.1282 26.6422 16.7714 21.999 22.4991 21.999V32.3699C22.4991 38.0976 17.8559 42.7408 12.1282 42.7408Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M22.4991 21.999V11.6281C22.4991 5.90041 27.1423 1.2572 32.87 1.2572V11.6281C32.87 17.3558 28.2268 21.999 22.4991 21.999Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M43.2409 32.3699H32.87C27.1423 32.3699 22.4991 27.7267 22.4991 21.999H32.87C38.5977 21.999 43.2409 26.6422 43.2409 32.3699Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M22.5 22.0013L15.1667 29.3347C11.1166 33.3848 4.55009 33.3848 0.5 29.3347L7.83333 22.0013C11.8834 17.9513 18.4499 17.9513 22.5 22.0013Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M29.8333 44.0013L22.5 36.668C18.4499 32.6179 18.4499 26.0514 22.5 22.0013L29.8333 29.3347C33.8834 33.3848 33.8834 39.9513 29.8333 44.0013Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M22.5 22.0013L15.1667 14.668C11.1166 10.6179 11.1166 4.05143 15.1667 0.00134277L22.5 7.33468C26.5501 11.3848 26.5501 17.9513 22.5 22.0013Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M44.5 14.668L37.1667 22.0013C33.1166 26.0514 26.5501 26.0514 22.5 22.0013L29.8333 14.668C33.8834 10.6179 40.4499 10.6179 44.5 14.668Z"
                    fill="#ED994E"
                  />
                </svg>
              </div>
              <div className="item-title">
                Connection and Personal Transformation
              </div>
              <div className="item-description">
                Grow in the company of those who understand and support your
                journey
              </div>
            </div>
            <div className="nourish-features-item picture">
              <img
                src="/img/local-center-nourish.webp"
                alt="nourish"
                width="670"
                height="auto"
              />
            </div>
            <div className="nourish-features-item">
              <div className="item-icon">
                <svg
                  width="45"
                  height="44"
                  viewBox="0 0 45 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_4344_74298)">
                    <mask
                      id="mask0_4344_74298"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="45"
                      height="44"
                    >
                      <path d="M44.5 0H0.5V44H44.5V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_4344_74298)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.1208 39.3329L17.1207 39.3331L14.341 36.5534C14.3536 36.7239 14.36 36.8962 14.36 37.07C14.36 40.8973 11.2573 44 7.43 44C3.60266 44 0.5 40.8973 0.5 37.07C0.5 33.2427 3.60266 30.14 7.43 30.14C7.60378 30.14 7.77606 30.1464 7.94663 30.1589L5.08979 27.3022L5.09039 27.3016C2.25086 24.4048 0.5 20.4368 0.5 16.06C0.5 7.1903 7.6903 0 16.56 0C20.9368 0 24.9048 1.75086 27.8016 4.59039L27.802 4.58986L27.888 4.6757C27.9067 4.69445 27.9256 4.71326 27.9443 4.73209L30.6589 7.44678C30.6464 7.27617 30.64 7.10382 30.64 6.93C30.64 3.10266 33.7427 0 37.57 0C41.3973 0 44.5 3.10266 44.5 6.93C44.5 10.7573 41.3973 13.86 37.57 13.86C37.3962 13.86 37.2239 13.8536 37.0532 13.841L39.7682 16.556C39.7869 16.5746 39.8054 16.5931 39.8239 16.6118L39.8329 16.6208C42.7176 19.5241 44.5 23.5239 44.5 27.94C44.5 36.8097 37.3097 44 28.44 44C24.0239 44 20.0241 42.2176 17.1208 39.3329Z"
                        fill="#ED994E"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_4344_74298">
                      <rect
                        width="44"
                        height="44"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="item-title">Collective Celebrations</div>
              <div className="item-description">
                Come together and celebrate with like-minded people from diverse
                backgrounds
              </div>
            </div>
            <div className="nourish-features-item">
              <div className="item-icon">
                <svg
                  width="45"
                  height="44"
                  viewBox="0 0 45 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.3895 22.1119C22.3895 19.2083 22.9614 16.3332 24.0725 13.6506C25.1837 10.968 26.8123 8.53058 28.8655 6.47742C30.9186 4.42427 33.3561 2.79562 36.0387 1.68446C38.7212 0.573301 41.5964 0.00139618 44.5 0.00139618L44.5 22.1119L22.3895 22.1119Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M44.5 21.8881C44.5 24.7917 43.9281 27.6669 42.8169 30.3495C41.7058 33.032 40.0771 35.4695 38.024 37.5226C35.9708 39.5758 33.5334 41.2044 30.8508 42.3156C28.1682 43.4268 25.2931 43.9987 22.3895 43.9987L22.3895 21.8881L44.5 21.8881Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M22.6105 22.1119C22.6105 19.2083 22.0386 16.3332 20.9275 13.6506C19.8163 10.968 18.1877 8.53058 16.1345 6.47742C14.0814 4.42427 11.6439 2.79562 8.96134 1.68446C6.27876 0.573301 3.4036 0.00139618 0.5 0.00139618L0.500001 22.1119H22.6105Z"
                    fill="#ED994E"
                  />
                  <path
                    d="M0.5 21.8881C0.5 24.7917 1.07191 27.6669 2.18307 30.3495C3.29422 33.032 4.92287 35.4695 6.97603 37.5226C9.02918 39.5758 11.4666 41.2044 14.1492 42.3156C16.8318 43.4268 19.7069 43.9987 22.6105 43.9987L22.6105 21.8881H0.5Z"
                    fill="#ED994E"
                  />
                </svg>
              </div>
              <div className="item-title">Immersive In-Person Courses</div>
              <div className="item-description">
                Experience transformation and growth in safe spaces.
              </div>
            </div>
            <div className="nourish-features-item">
              <div className="item-icon">
                <svg
                  width="45"
                  height="44"
                  viewBox="0 0 45 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_4344_74308)">
                    <mask
                      id="mask0_4344_74308"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="45"
                      height="44"
                    >
                      <path d="M44.5 0H0.5V44H44.5V0Z" fill="white" />
                    </mask>
                    <g mask="url(#mask0_4344_74308)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M22.4947 22C10.3469 21.9971 0.500001 12.1485 0.5 3.84661e-06L44.5 0C44.5 12.1485 34.6532 21.9971 22.5053 22C34.6532 22.0029 44.5 31.8516 44.5 44H0.500002C0.500002 31.8516 10.3469 22.0029 22.4947 22Z"
                        fill="#ED994E"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_4344_74308">
                      <rect
                        width="44"
                        height="44"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="item-title">Shared Wisdom</div>
              <div className="item-description">
                Tap into a wealth of practical wisdom during our knowledge
                series.
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="who-we-are">
        <div className="container">
          <h2 className="section-title">Who We Are</h2>
          <div className="section-text">
            The Art of Living is a nonprofit humanitarian organization that
            helps individuals relieve stress, build community, and live happier
            lives through evidence-based techniques and training. Since its
            inception in 1981, the Art of Living has touched the lives of more
            than 500 million people around the world.
          </div>
          <div className="journal-info">
            <div className="feature_box">
              <div className="feature_logo">
                <img src="/img/WP.png" alt="transforming lives" />
              </div>
              <div className="feature-content">
                "Like Fresh air to millions"
              </div>
            </div>
            <div className="feature_box">
              <div className="feature_logo">
                <img src="/img/Harvard.png" alt="transforming lives" />
              </div>
              <div className="feature-content">
                "Show promise in providing relief for depression"
              </div>
            </div>
            <div className="feature_box">
              <div className="feature_logo">
                <img src="/img/CNN.png" alt="transforming lives" />
              </div>
              <div className="feature-content">"Life Changing"</div>
            </div>
            <div className="feature_box">
              <div className="feature_logo">
                <img src="/img/Yoga.png" alt="transforming lives" />
              </div>
              <div className="feature-content">
                "May be the fastest growing spiritual practice on the planet"
              </div>
            </div>
          </div>
          <div className="actions">
            <button className="submit-btn" onClick={scrollToTop}>
              Find Your Community!
            </button>
          </div>
        </div>
      </section>
      <section className="our-community">
        <div className="container">
          <h2 className="section-title">Our Community</h2>
          <div className="section-text">
            At our centers, we believe in the power of togetherness. Experience
            the warmth of a supportive local community that is there every step
            of the way. Our ongoing support includes regular follow-ups, guided
            practice sessions, and a network of individuals on the same path of
            health, happiness, and wellbeing.
          </div>
          <div className="section-main-picture">
            <img
              src="/img/center-community-picture.webp"
              alt="community"
              width="100%"
            />
          </div>
        </div>
      </section>
      <section className="celebrate">
        <div className="container">
          <div className="orange-box">
            <div className="section-icon">
              <svg
                width="107"
                height="52"
                viewBox="0 0 107 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_4344_74349)">
                  <mask
                    id="mask0_4344_74349"
                    style={{ maskType: 'luminance' }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="107"
                    height="107"
                  >
                    <path d="M106.5 0H0.5V106.122H106.5V0Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_4344_74349)">
                    <path
                      d="M62.7092 -0.784764L55.0236 47.2812L80.0052 5.51982L56.3624 48.0553L94.1044 17.3666L57.3562 49.2412L103.306 33.3267L57.8845 50.6958L106.5 51.475L57.8846 52.2438L103.302 69.6228L57.3554 53.6983L94.0973 85.5808L56.3618 54.8838L79.9956 97.4243L55.0225 55.6581L62.6981 103.725L53.5001 55.9263L44.2914 103.723L51.9772 55.6573L26.9954 97.4188L50.6382 54.8836L12.8963 85.5719L49.6446 53.6973L3.69469 69.612L49.1159 52.2429L0.500298 51.4638L49.116 50.6949L3.69854 33.316L49.645 49.2404L12.9036 17.3579L50.639 48.0547L27.0052 5.51418L51.9781 47.2809L44.3025 -0.786728L53.5008 47.0122L62.7092 -0.784764Z"
                      fill="white"
                    />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_4344_74349">
                    <rect
                      width="106"
                      height="52"
                      fill="white"
                      transform="translate(0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="section-title">Celebrate Every Moment</h2>
            <div className="section-text">
              Life is so much richer when celebrated together. You are invited
              to join us when our community comes together to celebrate key
              events and milestones.
            </div>
            <div className="actions">
              <button className="submit-btn" onClick={scrollToTop}>
                Find Your Community!
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="real">
        <div className="container">
          <h2 className="section-title">Real People, Real Stories</h2>
          <div className="real-testimonials">
            {STORIES.map((story) => {
              return <StoryComp story={story} key={story.index} />;
            })}
          </div>
        </div>
      </section>
      <section className="founder">
        <div className="container">
          <div className="about-founder">
            <div className="first-col">
              <h2 className="section-title">Our Founder</h2>
              <p>
                <strong>Gurudev Sri Sri Ravi Shankar</strong> is a global
                humanitarian, spiritual leader, and peace envoy, who has been
                teaching breath-based meditation techniques for health and
                well-being for more than 40 years. His approach blends ancient
                Vedic wisdom with modern sensibility for a new paradigm of
                leadership and living a stress-free, violence-free society.
              </p>
              <p>
                Through Gurudev's programs, millions of people worldwide have
                found peace and resilience in the face of adversity, learning
                not only how to excel in their own lives, but also how to become
                powerful agents for social change.
              </p>
              <p>
                Gurudev has thus inspired a wave of volunteerism and service,
                resulting in the growth of one of the largest volunteer-based
                organizations in the world, with more than 30,000 teachers and
                over one million volunteers engaged in service projects in 180
                countries.
              </p>
            </div>
            <div className="second-col">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/k493mHHWTfw?si=TXZlbZfVWJmEchhf&rel=0"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <section className="find-art">
        <div className="container">
          <div className="blue-box">
            <h2 className="section-title">
              Find An Art Of Living Center Near You
            </h2>
            <div className="actions">
              <button className="submit-btn" onClick={scrollToTop}>
                Find Your Community!
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Course.requiresAuth = true;
// Course.redirectUnauthenticated = "/login";

export default Centers;
