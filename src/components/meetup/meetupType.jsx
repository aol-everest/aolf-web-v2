import React from "react";

export const MeetupType = ({
  closeHandler,
  meetupMasters,
  applyClassName = "",
}) => {
  return (
    <>
      {meetupMasters.map((mtype) => (
        <li
          key={mtype.id}
          className={applyClassName}
          onClick={closeHandler(mtype.id)}
        >
          {mtype.name}
        </li>
      ))}
    </>
  );
};
