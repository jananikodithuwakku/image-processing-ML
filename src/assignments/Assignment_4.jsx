import { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";

export default function Assignment_4() {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const [hands, setHands] = useState(null);
  const [imageURL, setImageURL] = useState(null);

  // initialize mediaPipe hands
  useEffect(() => {
  const handsModel = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`;
    },
  });

  handsModel.setOptions({
    maxNumHands: 1,
    modelComplexity: 1, 
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  handsModel.onResults(onResults);

  setHands(handsModel);
}, []);

  // upload image
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageURL(url);
  };

  // when image loads send to MediaPipe
  const handleImageLoad = async () => {
    if (hands && imageRef.current) {
      await hands.send({ image: imageRef.current });
    }
  };

  // draw results
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks) return;

    results.multiHandLandmarks.forEach((landmarks) => {
      ctx.fillStyle = "lime";

      landmarks.forEach((point) => {
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload Hand Image Detection</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginTop: "20px",
        }}
      >
        {imageURL && (
          <>
            <img
              ref={imageRef}
              src={imageURL}
              alt="Uploaded"
              onLoad={handleImageLoad}
              style={{ maxWidth: "500px" }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}