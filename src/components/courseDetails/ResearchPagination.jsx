import React, { useState, useEffect } from "react";
import renderHTML from "react-render-html";

const researchImgItems = [
  {
    image: {
      gray: "/img/research-highlights-ijoy-gray.png",
      color: "/img/research-highlights-ijoy-color.png",
    },
    quote: '"Improved immune cell counts within as<br /> little as 3 weeks"',
  },
  {
    image: {
      gray: "/img/research-highlights-sabr-gray.png",
      color: "/img/research-highlights-sabr-color.png",
    },
    quote: "“3x more time spent in deep,<br />restful stages of sleep.”",
  },
  {
    image: {
      gray: "/img/research-highlights-prevention-gray.png",
      color: "/img/research-highlights-prevention-color.png",
    },
    quote:
      '"The Easy Breathing Technique That Can<br /> Lower Your Anxiety 44%"',
  },
  {
    image: {
      gray: "/img/research-highlights-hhp-gray.png",
      color: "/img/research-highlights-hhp-color.png",
    },
    quote: '"Shows promise in providing relief for<br /> depression"',
  },
];

export const ResearchPagination = () => {
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
        <p className="research__quote">
          {renderHTML(researchImgItems[activeIndex].quote)}
        </p>
        <div className="research__block">
          {researchImgItems.map((research, index) => {
            if (index === activeIndex) {
              return <img src={research.image.color} alt="ljoy" key={index} />;
            }
            return <img src={research.image.gray} alt="ljoy" key={index} />;
          })}
        </div>
      </div>
      <div className="d-lg-none research__list-container swiper-container">
        <div className="research__list-wrapper swiper-wrapper">
          <div className="research__list-item swiper-slide">
            <p className="research__quote">
              {renderHTML(researchImgItems[activeIndex].quote)}
            </p>
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
