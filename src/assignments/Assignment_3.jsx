import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./Assignment_3.css";

const eyesMiddleTop = 28;
const eyesMiddleBottom = 30;
const lipsBottom = 58;
const faceBottom = 9;
const rightEyeInner = 40;
const rightEyeOuter = 37;
const leftEyeInner = 43;
const leftEyeOuter = 46;

const getDistance = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const getOrientation = (positions, box) => {

  const pos_x = (box.right + box.left) / 2;
  const pos_y = (box.bottom + box.top) / 2;

  const rot_x_a = getDistance(
    positions[eyesMiddleBottom],
    positions[eyesMiddleTop]
  );
  const rot_x_b = getDistance(
    positions[lipsBottom],
    positions[faceBottom]
  );
  const rot_x = Math.asin(
    (0.5 - rot_x_b / (rot_x_a + rot_x_b)) * 2
  );

  const rot_y_a = getDistance(
    positions[rightEyeOuter],
    positions[rightEyeInner]
  );
  const rot_y_b = getDistance(
    positions[leftEyeInner],
    positions[leftEyeOuter]
  );
  const rot_y =
    Math.asin(
      (0.5 - rot_y_b / (rot_y_a + rot_y_b)) * 2
    ) * 2.5;

  const rot_z_y =
    positions[rightEyeOuter].y -
    positions[leftEyeOuter].y;

  const rot_z_d = getDistance(
    positions[rightEyeOuter],
    positions[leftEyeOuter]
  );

  const rot_z = Math.asin(rot_z_y / rot_z_d);

  const scale =
    getDistance(
      positions[rightEyeOuter],
      positions[leftEyeOuter]
    ) * 0.7;

  if (rot_y > 0.7 || rot_y < -0.7) return null;

  return {
    position: { x: pos_x, y: pos_y },
    rotation: { x: rot_x, y: rot_y, z: rot_z },
    scale: { x: scale, y: scale },
  };
};

export default function Assignment_3() {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [imgURL, setImgURL] = useState("");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ]);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImgURL(URL.createObjectURL(file));
    setShowButton(true);

    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const addSpectacles = async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detection) {
      alert("No face detected");
      return;
    }

    const { landmarks, detection: boxData } = detection;

    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

    const scaledPositions = landmarks.positions.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const scaledBox = {
      left: boxData.box.left * scaleX,
      right: boxData.box.right * scaleX,
      top: boxData.box.top * scaleY,
      bottom: boxData.box.bottom * scaleY,
    };

    const orientation = getOrientation(scaledPositions, scaledBox);

    if (!orientation) {
      alert("Face angle not supported");
      return;
    }

    const glasses = new Image();
    glasses.src = "./sunglasses.png";

    glasses.onload = () => {
      ctx.save();
      ctx.translate(
        orientation.position.x,
        orientation.position.y - orientation.scale.y * 0.35,
      );
      ctx.rotate(orientation.rotation.z);

      const width = orientation.scale.x * 2.9;
      const height = orientation.scale.y * 1.9;

      ctx.drawImage(glasses, -width / 2, -height / 2, width, height);

      ctx.restore();
    };
  };

  return (
    <div className="spectacles-container">
      <h2>Add Spectacles</h2>

      <input type="file" onChange={handleUpload} />

      {showButton && (
        <button className="btn3" onClick={addSpectacles}>
          Add Spectacles
        </button>
      )}

      <div className="image-wrap">
        {imgURL && (
          <>
            <img ref={imgRef} src={imgURL} alt="face" />
            <canvas ref={canvasRef} />
          </>
        )}
      </div>
    </div>
  );
}
