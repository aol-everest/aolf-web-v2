/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

function PodcastPage() {
  const router = useRouter();
  return (
    <main className="podcasts">
      <section className="top-video">
        <img
          onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
          src="http://img.youtube.com/vi/Y5JoBOyig-s/maxresdefault.jpg"
          className="video-thumb-img"
          width="100%"
          height="700"
          alt="YouTube"
        />
        <iframe
          width="100%"
          height="700"
          src="https://www.youtube.com/embed/videoseries?si=tLo6vq5L3OavMtMz&amp;list=PLj4pqY15Io_m1E0YeB2_tvY6xxjLuhUNz"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
        <div className="top-video-info">
          <div className="channel-name">Aubrey Marcus 2022</div>
          <div className="video-title">
            Spiritual Guru Answers Life's biggest Questions
          </div>
        </div>
      </section>
      <section className="video-playlist">
        <div className="container">
          <div className="podcast-search-wrap">
            <input
              type="text"
              className="podcast-search-input"
              placeholder="Search..."
            />
          </div>
          <h2 className="section-title">Gurudev in Conversation</h2>
          <div className="section-description">
            Sharing wisdom with the world’s best thought leaders
          </div>
          <div className="featured-video-list">
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/Q7p_E_3Upzg/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/Q7p_E_3Upzg?enablejsapi=1&html5=1&mute=1"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label popular">The Most Popular</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Lewis Howes 2022</div>
                <div className="video-title">
                  Everything You Know About Manifesting Is wrong! (Do This
                  Instead)
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  {/* <li><a href="" className="listen">Listen</a></li> */}
                  <li>
                    <a href="" className="duration">
                      00:37:36
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/WNuI8_8mX34/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/WNuI8_8mX34?si=-hCnl2OJygKWRRbd"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label popular">The Most Popular</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Vishen (Mindvalley)</div>
                <div className="video-title">
                  Your Most Difficult Philosophical Questions Answered
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/wPQJz__rdHo/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/wPQJz__rdHo?si=gcjhHIxpWl7bi0W5"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label featured">Featured</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Next Level Soul</div>
                <div className="video-title">
                  Indian Mystic Reveals everything You Know About the universe
                  is wrong
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      0:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="video-listing">
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/HTtKk7FvqBc/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/HTtKk7FvqBc?si=bRXc9AlYWj4MXMbG"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Lewis Howes 2022</div>
                <div className="video-title">
                  Everything You Know About Manifesting Is wrong! (Do This
                  Instead)
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:37:36
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/n_uN-Lq3nyU/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/n_uN-Lq3nyU?si=WmiN5_MSh_U6exjk"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Vishen (Mindvalley)</div>
                <div className="video-title">
                  Your Most Difficult Philosophical Questions Answered
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/iQWZdALmOcw/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/iQWZdALmOcw?si=5kpV6V7ic_3kuX8x"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Next Level Soul</div>
                <div className="video-title">
                  Indian Mystic Reveals everything You Know About the universe
                  is wrong
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      0:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="load-more-action">
            <button className="load-more-btn">Load more</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PodcastPage;
