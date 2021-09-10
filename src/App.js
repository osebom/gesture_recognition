// 0. Install dependencies using npm install @tensorflow/tfjs @tensorflow-models/handpose react-webcam in Terminal
// 1. Import dependencies
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen



//Gesture Recognition
//Install fingerpose npm install
//Import useState
//Import emojis and fingerpose as fp, and save THUMPS UP and VICTORY emojis
//Update detect function for gesture handling




//import logo from './logo.svg';

//Importing dependencies
import React, {useRef, useState} from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import './App.css';
import {drawHand} from "./utilities";

//Import new things
import * as fp from "fingerpose"; //fingerpose library, allows us to work wiht our gestures
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png"

function App() {
  const webcamRef=useRef(null);
  const canvasRef=useRef(null); //Defined references

  //State Hook
  const [emoji, setEmoji] = useState(null); //Create two new variables, we can access our gesture state and emoji state using 'emoji' var, we can set that state using setEmoji
  const images = { thumbs_up: thumbs_up, victory: victory };

  //Write function to load handpose model
  const runHandpose = async() => { 
    const net = await handpose.load();
    console.log("Handpose model loaded.")
    //Loop and detect hands, paasing model into detect function
    setInterval(() => {
      detect(net);
    }, 100); //Running our detect function on a loop every 100 milliseconds and detecting to see whether the hand is In the frame
  };

  const detect = async (net) => {
    //Loop and Check if data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {

      //Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //Set or forcing video heigh and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //Make Detections
      const hand = await net.estimateHands(video); //Grabbing NN (from const net = async (net) ), and parsing our video
      console.log(hand);

      //New function
      if (hand.length > 0) { //checking we got detections
        const GE = new fp.GestureEstimator([ //setting up gesture estimator
          fp.Gestures.VictoryGesture, //bringing victory gesture, we can custom gestures here
          fp.Gestures.ThumbsUpGesture,
        ]);

        //Now that we've imported the gestures, let's estimate them
        const gesture = await GE.estimate(hand[0].landmarks, 8); //await means asyncronous, we grab GE and use estimate method to pass through our handpose prediction ("hand")
        if (gesture.gestures !== undefined && gesture.gestures.length > 0){
          // console.log(gesture.gestures);
          const confidence = gesture.gestures.map( //grabbing confidence of each gesture detected and we take the highest one, we're mapping/trasversing through object
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf( //we have an array called confidence which has the confidence of the different detections
            Math.max.apply(null, confidence)
          );
          // console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name); //going back into gestures to pull out the one with max confidence and take its name, we're setting state using setEmoji
          console.log(emoji); //lets us see our gesture emoji name
        }
      }


      //Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);

    }

  };

runHandpose();
  
  //1.Setting up camera
  return (
    <div className="App">
      <header className="App-header">
        <Webcam 
          ref= {webcamRef}
          style= {{
            position: "absolute",
            margineLeft: "auto",
            margineRight:"auto",
            left:0,
            right:0,
            textAlign:"center",
            zindex:9,
            width:640,
            height:480
          }} 
        />
        <canvas 
          ref= {canvasRef}
          style= {{
            position: "absolute",
            margineLeft: "auto",
            margineRight:"auto",
            left:0,
            right:0,
            textAlign:"center",
            zindex:9,
            width:540,
            height:480,
          }} //Use npm run start to test out the app in Terminal
        />

        {emoji !== null ? ( //if 'emoji' var is not null, we return the corresponding emoji image, the source is the 'images' object, specifically passing through the emoji we want
                  <img
                    src={images[emoji]}
                    style={{
                      position: "absolute",
                      marginLeft: "auto",
                      marginRight: "auto",
                      left: 400,
                      bottom: 500,
                      right: 0,
                      textAlign: "center",
                      height: 100,
                    }}
                  />
                ) : (
                  ""
                )}

      </header>
    </div>
  );
}

export default App;
