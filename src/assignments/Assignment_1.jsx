import {
  Card,
  Box,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useState } from "react";

import Tesseract from "tesseract.js";

export default function Assignment_1() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText("");
    }
  };

  const recognizeText = () => {
    if (!image) return;
    setLoading(true);

    Tesseract.recognize(image, "eng")

      .then(({ data }) => {
        const cleanedText = data.text.replace(/\s+/g, " ").trim();
        const hasValidText = /[a-zA-Z0-9]/.test(cleanedText);
        setLoading(false);

        if (!hasValidText) {
          setText("");
          alert("No readable text detected in this image");
          return;
        }

        setText(cleanedText);
      })
      
      .catch(() => {
        setLoading(false);
        alert("Text recognition failed");
      });
  };

  return (
    <Box
      sx={{
        minHeight: "85vh",
        bgcolor: "#f4f6f8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: 500, borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold">
            Image Text Recognition
          </Typography>

          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>

          {image && (
            <Box textAlign="center" mb={2}>
              <img
                src={image}
                alt="preview"
                style={{ maxWidth: "100%", borderRadius: 10 }}
              />
            </Box>
          )}

          {image && (
            <Button
              variant="outlined"
              fullWidth
              onClick={recognizeText}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Recognize Text
            </Button>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}
          {text && (
            <>
              <Typography fontWeight="bold" mb={1}>
                Recognized Text
              </Typography>

              <TextField
                multiline
                rows={8}
                fullWidth
                value={text}
                InputProps={{ readOnly: true }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
