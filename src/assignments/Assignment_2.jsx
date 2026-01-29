import { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./Assignment_2.css";

const MODEL = "./models";

export default function Assignment_2() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [detected, setDetected] = useState(false);
  const [detector, setDetector] = useState("tiny"); 

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
      setDetected(false);
    }
  };

  const handleDetect = async () => {
    if (!imageFile) {
      alert("Upload an image first!");
      return;
    }

    if (!detector) {
      alert("Please select a face detector!");
      return;
    }

    try {
      let detections;
      // tiny face detector
      if (detector === "tiny") {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL);

        detections = await faceapi.detectAllFaces(
          imageRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
      }

      // SSD mobile net
      if (detector === "ssd") {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL);

        detections = await faceapi.detectAllFaces(
          imageRef.current,
          new faceapi.SsdMobilenetv1Options()
        );
      }

      const image = imageRef.current;
      const canvas = canvasRef.current;

      const displaySize = {
        width: image.width,
        height: image.height
      };

      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(
        detections,
        displaySize
      );
      //draw on canvas
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resized);

      setDetected(true);
    } catch (error) {
      console.error("Face detection error:", error);
    }
  };

  return (
    <div className="face-container">
      <h3>Face Detection</h3>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {imageFile && (
        <>
          <div className="image-box">
            <img
              ref={imageRef}
              src={imageFile}
              alt="Uploaded"
              width="620"
              height="620"
            />
            <canvas
              ref={canvasRef}
              width="620"
              height="620"
            />
          </div>

          <div style={{ marginTop: "15px" }}>
            <label>
              <input
                type="checkbox"
                checked={detector === "tiny"}
                onChange={() => setDetector("tiny")}
              />{" "}
              Tiny Face Detector
            </label>

            <br />

            <label>
              <input
                type="checkbox"
                checked={detector === "ssd"}
                onChange={() => setDetector("ssd")}
              />{" "}
              SSD MobileNet
            </label>
          </div>

          <button className="btn" onClick={handleDetect}>
            Detect Faces
          </button>
        </>
      )}
    </div>
  );
}
