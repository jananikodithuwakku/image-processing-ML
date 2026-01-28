import { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./Assignment_2.css";

const MODEL = "./models";

export default function Assignment_2() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detected, setDetected] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
      setModelsLoaded(false);
      setDetected(false);
    }
  };

  const handleDetect = async () => {
    if (!imageFile) return alert("Upload an image first!");

    try {
      //load tiny face detector model
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL);
      setModelsLoaded(true);
      console.log("Tiny Face Detector model loaded");

      if (!imageRef.current || !canvasRef.current) return;

      const image = imageRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: image.width, height: image.height };
      faceapi.matchDimensions(canvas, displaySize);

      //detect faces
      const detections = await faceapi.detectAllFaces(
        image,
        new faceapi.TinyFaceDetectorOptions()
      );

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      //draw on canvas
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      setDetected(true);
    } catch (err) {
      console.error("Detection error:", err);
    }
  };

  return (
    <div className="face-container">
      <h3>Face Detection</h3>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {imageFile && (
        <>
          <div className="image-box">
            <img ref={imageRef} src={imageFile} alt="Uploaded" width="720" height="560" />
            <canvas ref={canvasRef} width="720" height="560" />
          </div>

          <button className="btn"onClick={handleDetect}>Detect Faces</button>

        </>
      )}
    </div>
  );
}
