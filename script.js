// script.js
const video = document.getElementById("qr-video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const equipmentInfo = document.getElementById("equipment-info");
const videoContainer = document.getElementById("video-container");
const workoutVideo = document.getElementById("workout-video");
const uploadInput = document.getElementById("upload-image");
const popup = document.getElementById("qr-popup");
const closeBtn = document.querySelector(".popup-close");
const viewGuideBtn = document.querySelector(".popup-button");
let scanning = false;

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
      scanning = true;
      scanQRCode();
    };
  } catch (error) {
    console.error("Camera access denied:", error);
    equipmentInfo.innerText =
      "Error: Camera access denied. Please allow camera permissions.";
  }
}

function scanQRCode() {
  if (!scanning) return;

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
        showPopup();
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
          showPopup();
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

// Show popup
function showPopup() {
  popup.style.display = "block";
}

// Close popup
function closePopup() {
  popup.style.display = "none";
  scanning = true; // Resume scanning
  scanQRCode();
}

// Event listeners
closeBtn.addEventListener("click", closePopup);
viewGuideBtn.addEventListener("click", function () {
  closePopup();
  document.getElementById("guide").scrollIntoView({ behavior: "smooth" });
});

// Close popup when clicking outside
window.addEventListener("click", function (event) {
  if (event.target === popup) {
    closePopup();
  }
});

// Safety Measures Modal
const safetyModal = document.getElementById("safety-modal");
const mainContent = document.getElementById("main-content");
const safetyAccept = document.getElementById("safety-accept");
const safetyCancel = document.getElementById("safety-cancel");

// Show safety modal on page load
document.addEventListener("DOMContentLoaded", function () {
  safetyModal.style.display = "flex";
  mainContent.style.display = "none";
});

// Handle safety acceptance
safetyAccept.addEventListener("click", function () {
  safetyModal.style.display = "none";
  mainContent.style.display = "block";
  // Start the scanner after safety measures are accepted
  startScanner();
});

// Handle safety cancellation
safetyCancel.addEventListener("click", function () {
  window.location.href = "https://www.google.com"; // Redirect to Google or another safe website
});

// Prevent closing modal by clicking outside
safetyModal.addEventListener("click", function (event) {
  if (event.target === safetyModal) {
    event.stopPropagation();
  }
});
