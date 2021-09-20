import React from "react";

export const MeetupType = ({
  closeHandler,
  meetupMasters,
  applyClassName = "",
}) => {
  return (
    <>
      {meetupMasters.map((mtype) => (
        <li class={applyClassName} onClick={closeHandler(mtype.id)}>
          {mtype.name}
        </li>
      ))}
    </>
  );
};
