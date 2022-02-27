export const RetreatPrerequisiteWarning = ({ warningPayload }) => {
  return (
    <>
      <p className="course-join-card__text">
        {warningPayload && warningPayload.message}
      </p>
      <p className="course-join-card__text">
        If our records are not accurate, please contact customer service at{" "}
        <a href="tel:8442735500">(844) 273-5500</a> or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        .
      </p>
    </>
  );
};
