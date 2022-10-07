import { orgConfig } from "@org";
export const RetreatPrerequisiteWarning = ({ warningPayload }) => {
  return (
    <>
      <p className="course-join-card__text">
        {warningPayload && warningPayload.message}
      </p>
      <p className="course-join-card__text">
        If our records are not accurate, please contact customer service at{" "}
        <a href={`tel:${orgConfig.contactNumberLink}`}>
          {orgConfig.contactNumber}
        </a>{" "}
        or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        .
      </p>
    </>
  );
};
