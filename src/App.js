import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { CheckCircle, Warning } from "@mui/icons-material";
import axios from "axios";

const meaningfulPhrases = [
  "The necessary bureaucracy delayed our approval.",
  "Typing speed: 85 wpm, accuracy: 98.7%!",
  "Their weird neighbor received an unexpected gift.",
  "Keystroke logging is a key security metric.",
  "Learning never exhausts the mind, keep growing.",
];

const isValidEmail = (email) => {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};

const KeystrokeTracker = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [userEntered, setUserEntered] = useState(false);
  const [texts] = useState(meaningfulPhrases);
  const [inputs, setInputs] = useState({});
  const [completed, setCompleted] = useState({});
  const [keystrokeEvents, setKeystrokeEvents] = useState({});
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleUserSubmit = () => {
    if (!user.name.trim() || !user.email.trim()) {
      setError("Both fields are required.");
      return;
    }
    if (!isValidEmail(user.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setUserEntered(true);
  };

  const handleKeyDown = (event, index) => {
    setKeystrokeEvents((prevEvents) => ({
      ...prevEvents,
      [index]: [
        ...(prevEvents[index] || []),
        { eventType: "KeyDown", key: event.code, timestamp: Date.now() },
      ],
    }));
  };

  const handleKeyUp = (event, index) => {
    setKeystrokeEvents((prevEvents) => ({
      ...prevEvents,
      [index]: [
        ...(prevEvents[index] || []),
        { eventType: "KeyUp", key: event.code, timestamp: Date.now() },
      ],
    }));
  };

  const handleChange = (index, value) => {
    setInputs((prev) => ({ ...prev, [index]: value }));
    setCompleted((prev) => ({ ...prev, [index]: value === texts[index] }));
  };

  const submitToDatabase = async () => {
    const dataToStore = {
      name: user.name,
      email: user.email,
      keystrokeData: Object.keys(inputs).map((key) => ({
        index: key,
        input: inputs[key],
        keystrokes: keystrokeEvents[key] || [],
        completed: completed[key] || false,
      })),
      timestamp: new Date().toISOString(),
    };

    console.log("Data to store:", dataToStore);

    try {
      await axios.post(API_URL, dataToStore);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data.");
    }
  };

  const handleDialogClose = () => {
    window.location.href = "https://www.youtube.com/watch?v=p44G0U4sLCE";
  };

  const allCompleted =
    Object.values(completed).length === texts.length &&
    Object.values(inputs).every((val) => val.trim().length > 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
        {!userEntered ? (
          <>
            <Typography variant="h4" color="primary" gutterBottom>
              Enter Your Details
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Name"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleUserSubmit}
            >
              Start Typing
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" color="primary" gutterBottom>
              Keystroke Dataset
            </Typography>
            {texts.map((text, index) => (
              <Box key={index} mb={3} display="flex" alignItems="center">
                <Box flex={1} sx={{ userSelect: "none", cursor: "default" }}>
                  <Typography variant="body1" gutterBottom>
                    {text}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={inputs[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onKeyUp={(e) => handleKeyUp(e, index)}
                    placeholder="Type the phrase exactly as shown"
                  />
                </Box>
                {completed[index] ? (
                  <IconButton color="success">
                    <CheckCircle fontSize="large" />
                  </IconButton>
                ) : (
                  <IconButton color="warning">
                    <Warning fontSize="large" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={!allCompleted}
              onClick={submitToDatabase}
            >
              Submit
            </Button>
          </>
        )}

        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle>🎉 Congratulations! 🎉</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Thank you for your effort. Here's a cookie 🍪 and 4000 🪄 aura
              points!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default KeystrokeTracker;
