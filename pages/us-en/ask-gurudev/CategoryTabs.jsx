import React, { useRef } from 'react';
import { A11y, Navigation, Scrollbar, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import { isMobile } from '@utils';

const CategoryTabs = ({ setSelectedCategory, selectedCategory }) => {
  const swiperRef = useRef(null);

  const handlePredefinedElements = (item) => {
    setSelectedCategory(item);
  };

  const isSelectedItem = (element) => {
    return selectedCategory?.toLowerCase() === element.toLowerCase();
  };

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  return (
    <nav className="category-tabs-wrap swiper tabSwiper">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Scrollbar, A11y, Pagination]}
        className="category-tabs swiper-wrapper"
        slidesPerView={'auto'}
        loop={false}
        spaceBetween={isMobile() ? 15 : 0}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: '.slide-button-prev',
          nextEl: '.slide-button-next',
        }}
        slidesOffsetAfter={30}
        slidesOffsetBefore={isMobile() ? 10 : 20}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = '.slide-button-prev';
          swiper.params.navigation.nextEl = '.slide-button-next';
          swiper.navigation.update();
        }}
      >
        <SwiperSlide className="swiper-slide">
          <a
            onClick={() => handlePredefinedElements('Anger')}
            className={`nav-link ${isSelectedItem('Anger') ? 'active' : ''}`}
            id="nav-anger-tab"
            data-toggle="tab"
            role="tab"
          >
            <span className="icon-aol iconaol-angry"></span>Anger
          </a>
        </SwiperSlide>
        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Anxiety')}
            className={`nav-link ${isSelectedItem('Anxiety') ? 'active' : ''}`}
            id="nav-anxiety-tab"
            data-toggle="tab"
            role="tab"
          >
            <span className="icon-aol iconaol-fear"></span>Anxiety
          </a>
        </SwiperSlide>
        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Career')}
            className={`nav-link ${isSelectedItem('Career') ? 'active' : ''}`}
            id="nav-career-tab"
            data-toggle="tab"
            role="tab"
          >
            <span className="icon-aol iconaol-relationship-2"></span>Career
          </a>
        </SwiperSlide>
        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Death')}
            className={`nav-link ${isSelectedItem('Death') ? 'active' : ''}`}
            id="nav-death-tab"
            data-toggle="tab"
            role="tab"
          >
            <span className="icon-aol iconaol-death"></span>Death
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Desire')}
            className={`nav-link ${isSelectedItem('Desire') ? 'active' : ''}`}
            id="nav-desire-tab"
            data-toggle="tab"
            role="tab"
          >
            <span className="icon-aol iconaol-expectations"></span>Desire
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Devotion')}
            className={`nav-link ${isSelectedItem('Devotion') ? 'active' : ''}`}
            id="nav-devotion-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-health-care"></span>Devotion
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Divine')}
            className={`nav-link ${isSelectedItem('Divine') ? 'active' : ''}`}
            id="nav-divine-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-ascetic"></span>Divine
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Emotions')}
            className={`nav-link ${isSelectedItem('Emotions') ? 'active' : ''}`}
            id="nav-emotions-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="true"
          >
            <span className="icon-aol iconaol-emotions"></span>Emotions
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Failure')}
            className={`nav-link ${isSelectedItem('Failure') ? 'active' : ''}`}
            id="nav-failure-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-broken-heart"></span>Failure
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Faith')}
            className={`nav-link ${isSelectedItem('Faith') ? 'active' : ''}`}
            id="nav-faith-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-pray"></span>Faith
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Fear')}
            className={`nav-link ${isSelectedItem('Fear') ? 'active' : ''}`}
            id="nav-fear-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-fear"></span>Fear
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Gratitude')}
            className={`nav-link ${isSelectedItem('Gratitude') ? 'active' : ''}`}
            id="nav-gratitude-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-heart"></span>Gratitude
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Happiness')}
            className={`nav-link ${isSelectedItem('Happiness') ? 'active' : ''}`}
            id="nav-happiness-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-smiley"></span>Happiness
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Health')}
            className={`nav-link ${isSelectedItem('Health') ? 'active' : ''}`}
            id="nav-health-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-smiley"></span>Health
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Karma')}
            className={`nav-link ${isSelectedItem('Karma') ? 'active' : ''}`}
            id="nav-karma-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-karma"></span>Karma
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Life')}
            className={`nav-link ${isSelectedItem('Life') ? 'active' : ''}`}
            id="nav-life-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-family"></span>Life
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Love')}
            className={`nav-link ${isSelectedItem('Love') ? 'active' : ''}`}
            id="nav-love-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-love"></span>Love
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Meditation')}
            className={`nav-link ${isSelectedItem('Meditation') ? 'active' : ''}`}
            id="nav-meditation-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-meditation"></span>Meditation
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Mind')}
            className={`nav-link ${isSelectedItem('Mind') ? 'active' : ''}`}
            id="nav-mind-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-brain"></span>Mind
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Relationships')}
            className={`nav-link ${isSelectedItem('Relationships') ? 'active' : ''}`}
            id="nav-relation-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-relationship-2"></span>
            Relationships
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('SKY')}
            className={`nav-link ${isSelectedItem('SKY') ? 'active' : ''}`}
            id="nav-sky-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-meditation"></span>SKY
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Self')}
            className={`nav-link ${isSelectedItem('Self') ? 'active' : ''}`}
            id="nav-finance-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-user-2"></span>Self
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Service')}
            className={`nav-link ${isSelectedItem('Service') ? 'active' : ''}`}
            id="nav-service-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-heart"></span>Service
          </a>
        </SwiperSlide>

        <SwiperSlide>
          <a
            onClick={() => handlePredefinedElements('Surrender')}
            className={`nav-link ${isSelectedItem('Surrender') ? 'active' : ''}`}
            id="nav-enlight-tab"
            data-toggle="tab"
            role="tab"
            aria-selected="false"
          >
            <span className="icon-aol iconaol-peace"></span>Surrender
          </a>
        </SwiperSlide>
        <div className="swiper-pagination">
          <div className="slide-button-prev slide-button" onClick={handlePrev}>
            <span className="icon-aol iconaol-arrow-left"></span>
          </div>
          <div className="slide-button-next slide-button" onClick={handleNext}>
            <span className="icon-aol iconaol-arrow-right"></span>
          </div>
        </div>
      </Swiper>
    </nav>
  );
};

export default CategoryTabs;
