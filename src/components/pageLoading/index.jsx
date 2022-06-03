import React from "react";
import Fade from "react-reveal/Fade";

const messages = [
  "swapping space and time",
  "downloading golf balls",
  "warming up reactor",
  "reticulating splines",
  "searching for the answer to life, the universe, and everything",
  "counting backwards from infinity",
  "pay no attention to the man behind the curtain",
  "Calculating gravitational constant in your bay",
  "following the white rabbit",
  "satellites are moving into position",
  "The gods contemplate your fate",
  "Warming up the processors",
  "Reconfiguring the office coffee machine",
  "Recalibrating the internet",
  "testing ozone",
  "embiggening prototypes",
  "deterministically simulating the future",
  "testing for perfection",
  "Initializing Giant Lazer",
  "Dividing eternity by zero",
  "Watching Cat videos on the internet",
  "Creating Universe (this may take some time)",
  "Creating Time-Loop Inversion Field",
  "Transporting you into the future",
  "Commencing infinite loop",
  "Communing with nature",
  "Spinning the wheel of fortune",
  "Logging in to Skynet",
  "Engaging self-awareness circuits",
  "Downloading more pixels",
  "Preparing for hyperspace jump",
  "Slaying a Balrog",
  "Waiting for magic to happen",
  "Locating infinite improbability drive",
  "Traveling backward in time",
  "Taking over the world",
  "Setting the modulating fibulator to full polarity",
  "Reassembling atoms",
  "Please wait while we serve other customers...",
  "Our premium plan is faster",
  "Feeding unicorns...",
];

export const PageLoading = () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  return (
    <Fade opposite>
      <div className="full-page-loader">
        <div className="card-loader">
          <h5>Please Wait !!!</h5>
          <p>{message}</p>
          <div className="loader">
            <div className="spin"></div>
            <div className="bounce"></div>
          </div>
        </div>
      </div>
    </Fade>
  );
};
