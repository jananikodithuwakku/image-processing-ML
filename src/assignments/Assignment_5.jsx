import { useRef, useEffect } from "react";
import { Hands } from "@mediapipe/hands";

export default function Assignment_5() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);

  //initialize ediapipe
  useEffect(() => {
    const handsModel = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsModel.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    handsModel.onResults(onResults);

    //store in ref
    handsRef.current = handsModel;

    startCamera();
  }, []);

  //start webcam
  const startCamera = async () => {
    const video = videoRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        detectFrame();
      };
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  //continuous detection loop
  const detectFrame = async () => {
    if (handsRef.current && videoRef.current) {
      await handsRef.current.send({ image: videoRef.current });
    }
    requestAnimationFrame(detectFrame);
  };

  //draw results
  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks) return;

    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20]
    ];

    results.multiHandLandmarks.forEach((landmarks) => {
      
      //draw skeleton
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2;

      connections.forEach(([start, end]) => {
        const x1 = landmarks[start].x * canvas.width;
        const y1 = landmarks[start].y * canvas.height;

        const x2 = landmarks[end].x * canvas.width;
        const y2 = landmarks[end].y * canvas.height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      //draw points
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
    <div style={{ textAlign: "center" }}>
      <h2>Live Hand Detection</h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          style={{ width: "600px" }}
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
      </div>
    </div>
  );
}