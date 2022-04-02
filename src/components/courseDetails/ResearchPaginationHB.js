import React, { useState, useEffect } from "react";

const researchImgItems = [
  {
    image: {
      gray: "/img/yale-news-gray.png",
      color: "/img/yale-news-color.png",
    },
    quote:
      '"To improve students’ mental health, Yale study finds, teach them to breathe"',
    link: "https://news.yale.edu/2020/07/27/improve-students-mental-health-yale-study-finds-teach-them-breathe",
  },
  {
    image: {
      gray: "/img/stanford-news-gray.png",
      color: "/img/stanford-news-color.png",
    },
    quote: '"Stanford scholar helps veterans recover from war trauma"',
    link: "https://news.stanford.edu/news/2014/september/meditation-helps-ptsd-090514.html",
  },
  {
    image: {
      gray: "/img/harvard-medical-school-gray.png",
      color: "/img/harvard-medical-school-color.png",
    },
    quote: '"Be Kind and Unwind"',
    link: "https://hms.harvard.edu/news/be-kind-unwind",
  },
];

export const ResearchPaginationHB = () => {
  const [indexImg, setIndexImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (indexImg < researchImgItems.length) {
        setIndexImg((prevIndexImg) => prevIndexImg + 1);
      } else {
        setIndexImg(0);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [indexImg]);

  let activeIndex = 0;
  if (indexImg !== 0) {
    activeIndex = indexImg - 1;
  } else {
    activeIndex = researchImgItems.length - 1;
  }

  return (
    <>
      <div className="d-lg-block d-none col-10 m-auto">
        {researchImgItems[activeIndex].quote && (
          <p
            className="research__quote"
            dangerouslySetInnerHTML={{
              __html: researchImgItems[activeIndex].quote,
            }}
          ></p>
        )}

        <div className="research__block">
          {researchImgItems.map((research, index) => {
            if (index === activeIndex) {
              return (
                <img
                  className="!tw-max-h-10"
                  src={research.image.color}
                  alt="ljoy"
                  key={index}
                />
              );
            }
            return (
              <img
                className="!tw-max-h-10"
                src={research.image.gray}
                alt="ljoy"
                key={index}
              />
            );
          })}
        </div>
      </div>
      <div className="d-lg-none research__list-container swiper-container">
        <div className="research__list-wrapper swiper-wrapper">
          <div className="research__list-item swiper-slide">
            {researchImgItems[activeIndex].quote && (
              <p
                className="research__quote"
                dangerouslySetInnerHTML={{
                  __html: researchImgItems[activeIndex].quote,
                }}
              ></p>
            )}
            <div>
              <img src="/img/research-highlights-ijoy-color.png" alt="ljoy" />
            </div>
          </div>
        </div>

        <div className="research__list-pagination"></div>
      </div>
    </>
  );
};
