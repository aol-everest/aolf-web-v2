import { useAuth } from "@contexts";
import React, { useEffect, useState } from "react";
import { api, Auth } from "@utils";
import { withAuth } from "@hoc";

function DevOnly() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfo = await Auth.reFetchProfile();

      setUser(userInfo);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="tw-bg-gray-200 tw-text-white tw-text-sm">
      <div className="tw-bg-gray-500 tw-px-4 tw-py-3 tw-text-yellow-300">
        <strong>Debug</strong>
      </div>
      <pre className="tw-block tw-px-4 tw-py-3 tw-m-0 tw-overflow-scroll">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}

export default withAuth(DevOnly);
