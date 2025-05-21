import React, { useMemo } from 'react';
import { Accordion, Button } from 'react-bootstrap';

const RelatedData = ({ results, setActiveKey, activeKey, copyToClipboard }) => {
  const getFormattedText = (text) => {
    return text?.replace(/\n/g, '<br />');
  };

  const relatedData = useMemo(() => {
    return results?.slice(1).map((item, index) => {
      const parts = item.content.split('\n\n');
      return {
        index: String(index),
        question: parts[0],
        answer: parts.slice(1).join('\n\n'),
        source: item.source,
      };
    });
  }, [results]);

  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  return (
    <>
      {relatedData?.length && (
        <div class="related-questions-wrap">
          <div class="box-title">
            <span class="icon-aol iconaol-chat-flower"></span>Related
          </div>
          <Accordion className="accordion" defaultActiveKey={activeKey}>
            {relatedData.map((data) => {
              const isSourceUrl =
                data.source &&
                typeof data.source === 'string' &&
                data.source.match(/^(https?:\/\/[^\s]+)/);
              if (data.question) {
                return (
                  <div class="question-item" key={data.index}>
                    <div class="question-header">
                      <h2>
                        <Accordion.Toggle
                          as={Button}
                          className="btn btn-link"
                          variant="link"
                          eventKey={data.index}
                          aria-expanded={data.index === activeKey}
                          onClick={() => handleToggle(data.index)}
                        >
                          {data.question}
                        </Accordion.Toggle>
                      </h2>
                    </div>

                    <Accordion.Collapse eventKey={data.index}>
                      <>
                        <div class="question-body">
                          <p
                            dangerouslySetInnerHTML={{
                              __html: getFormattedText(data?.answer),
                            }}
                          />
                        </div>
                        <div class="tab-content-footer">
                          <div class="source-info">
                            <strong>Source:</strong>{' '}
                            {isSourceUrl ? (
                              <a
                                href={data.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-link"
                              >
                                {data.source}
                              </a>
                            ) : (
                              data.source
                            )}
                          </div>
                          <div class="tab-content-action">
                            <button
                              class="tc-action-btn copy-btn"
                              onClick={() =>
                                copyToClipboard(
                                  isSourceUrl ? data.source : data?.answer,
                                )
                              }
                            >
                              <span class="icon-aol iconaol-copy"></span>
                            </button>
                          </div>
                        </div>
                      </>
                    </Accordion.Collapse>
                  </div>
                );
              }
            })}
          </Accordion>
        </div>
      )}
    </>
  );
};

export default RelatedData;
