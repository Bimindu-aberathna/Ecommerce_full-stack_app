import React from "react";

function Waiting() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-gray-700 border border-gray-300 rounded-md p-6 shadow-md bg-white">
      <div className="text-4xl font-bold text-red-600">OOPS!</div>
      <div className="text-lg font-medium text-gray-700">
        Seems like server is starting up.
      </div>
      <div className="text-md text-gray-500">
        Please wait for a few seconds.
      </div>
    </div>
  );
}

export default Waiting;
