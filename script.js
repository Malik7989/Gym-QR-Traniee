// script.js
const video = document.getElementById("qr-video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const equipmentInfo = document.getElementById("equipment-info");
const videoContainer = document.getElementById("video-container");
const workoutVideo = document.getElementById("workout-video");
const uploadInput = document.getElementById("upload-image");

const equipmentVideos = {
  machine1: "https://www.youtube.com/embed/K6I24WgiiPw",
  machine2: "https://www.youtube.com/embed/4Y2ZdHCOXok",
  machine3: "https://www.youtube.com/embed/SALxEARiMkw",
  machine4: "https://www.youtube.com/embed/0mY8dIGDneE",
  machine5: "https://www.youtube.com/embed/dCtwWNTnOq4",
};

async function startScanner() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    video.onloadedmetadata = () => {
      console.log("Camera is ready, starting scan...");
      scanQRCode();
    };
  } catch (error) {
    console.error("Camera access denied:", error);
    equipmentInfo.innerText =
      "Error: Camera access denied. Please allow camera permissions.";
  }
}

function scanQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvas.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      const machineId = code.data.trim();
      console.log("QR Code Detected:", machineId);
      if (equipmentVideos[machineId]) {
        workoutVideo.src = equipmentVideos[machineId];
        videoContainer.style.display = "block";
        equipmentInfo.innerText = `Machine: ${machineId} - Workout Guide Loaded!`;
      } else {
        equipmentInfo.innerText = "Invalid QR Code. No workout video found.";
      }
    } else {
      console.log("No QR code detected");
      equipmentInfo.innerText = "No QR code detected. Please try again.";
    }
  }
  requestAnimationFrame(scanQRCode);
}

uploadInput.addEventListener("change", handleUpload);

function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => {
      // Set canvas to image dimensions and draw the image
      canvasElement.width = img.width;
      canvasElement.height = img.height;
      canvas.drawImage(img, 0, 0, img.width, img.height);
      const imageData = canvas.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        const machineId = code.data.trim();
        console.log("QR Code Detected from upload:", machineId);
        if (equipmentVideos[machineId]) {
          workoutVideo.src = equipmentVideos[machineId];
          videoContainer.style.display = "block";
          equipmentInfo.innerText = `Machine: ${machineId} - Workout Guide Loaded!`;
        } else {
          equipmentInfo.innerText = "Invalid QR Code. No workout video found.";
        }
      } else {
        equipmentInfo.innerText = "No QR code detected in the uploaded image.";
      }
    };
    img.onerror = () => {
      equipmentInfo.innerText = "Error: Unable to load the uploaded image.";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", startScanner);
