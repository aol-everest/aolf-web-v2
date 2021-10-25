import React, { useState } from "react";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import * as RemoveMarkdown from "remove-markdown";
import ReactHtmlParser from "react-html-parser";
import { secondsToHms } from "@utils";

export const ChapterItem = ({ chapter, playChapterAction }) => {
  const [showFull, setShowFull] = useState(false);
  const desc = chapter.description ? RemoveMarkdown(chapter.description) : "";

  const readMoreAction = () => {
    setShowFull(true);
  };

  const handleReflow = (rleState) => {
    const { clamped } = rleState;
    if (!clamped) {
      setShowFull(true);
    }
  };

  if (chapter.isCompleted) {
    return (
      <div className="category-slide-item viewed">
        <div className="insight-item-img">
          <img
            src="/img/ic-play-viewed.svg"
            alt=""
            className="module-viewed"
            onClick={playChapterAction(chapter)}
          />
          <img src="/img/ic-info.svg" alt="" className="module-info" />
        </div>
        <div className="insight-item-details">
          <p className="card-duration">
            <img src="/img/ic-video.svg" alt="" />{" "}
            {Math.floor(chapter.duration / 60)} mins
          </p>
          <h5 className="card-title">{chapter.title}</h5>
          {!showFull && (
            <>
              <p className="card-text">
                <HTMLEllipsis
                  unsafeHTML={desc}
                  onReflow={handleReflow}
                  maxLine="2"
                  ellipsis="..."
                  basedOn="letters"
                />
              </p>
              <p className="read-more" onClick={readMoreAction}>
                Read More
              </p>
            </>
          )}
          {showFull && <p className="card-text">{ReactHtmlParser(desc)}</p>}
        </div>
      </div>
    );
  }
  if (chapter.isAccessible) {
    return (
      <div className="category-slide-item next">
        <div className="insight-item-img">
          <img
            src="/img/ic-play.svg"
            alt=""
            className="module-play"
            onClick={playChapterAction(chapter)}
          />
          <img src="/img/ic-info.svg" alt="" className="module-info" />
        </div>
        <div className="insight-item-details">
          <p className="card-duration">
            <img src="/img/ic-video.svg" alt="" />{" "}
            {secondsToHms(chapter.duration)}
          </p>
          <h5 className="card-title">{chapter.title}</h5>
          {!showFull && (
            <>
              <p className="card-text">
                <HTMLEllipsis
                  unsafeHTML={desc}
                  onReflow={handleReflow}
                  maxLine="2"
                  ellipsis="..."
                  basedOn="letters"
                />
              </p>
              <p className="read-more" onClick={readMoreAction}>
                Read More
              </p>
            </>
          )}
          {showFull && <p className="card-text">{ReactHtmlParser(desc)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="category-slide-item">
      <div className="insight-item-img">
        <img src="/img/ic-play.svg" alt="" className="module-play" />
        <img src="/img/ic-info.svg" alt="" className="module-info" />
      </div>
      <div className="insight-item-details">
        <p className="card-duration">
          <img src="/img/ic-video.svg" alt="" />{" "}
          {Math.floor(chapter.duration / 60)} mins
        </p>
        <h5 className="card-title">{chapter.title}</h5>
        {!showFull && (
          <>
            <p className="card-text">
              <HTMLEllipsis
                unsafeHTML={desc}
                onReflow={handleReflow}
                maxLine="2"
                ellipsis="..."
                basedOn="letters"
              />
            </p>
            <p className="read-more" onClick={readMoreAction}>
              Read More
            </p>
          </>
        )}
        {showFull && <p className="card-text">{ReactHtmlParser(desc)}</p>}
      </div>
    </div>
  );
};
