const captureBtn = document.getElementById('captureBtn');
const status = document.getElementById('status');
const gallery = document.getElementById('gallery');

let isCapturing = false;
let captureInterval = null;
let captureTimeout = null;
let photoCount = 0;

captureBtn.addEventListener('click', startCapture);

async function startCapture() {
    if (isCapturing) return;

    isCapturing = true;
    captureBtn.disabled = true;
    photoCount = 0;
    gallery.innerHTML = '';

    status.textContent = 'Capturing photos...';

    // Capture immediately
    await capturePhoto();

    // Capture every 0.5 seconds
    captureInterval = setInterval(capturePhoto, 500);

    // Stop after 10 seconds
    captureTimeout = setTimeout(() => {
        stopCapture();
    }, 10000);
}

function stopCapture() {
    clearInterval(captureInterval);
    clearTimeout(captureTimeout);
    isCapturing = false;
    captureBtn.disabled = false;
    status.textContent = `Capture complete! ${photoCount} photos captured.`;
}

async function capturePhoto() {
    try {
        const response = await fetch('/api/capture');

        if (!response.ok) {
            throw new Error('Failed to capture photo');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        photoCount++;
        addPhotoToGallery(imageUrl, photoCount);

        status.textContent = `Capturing... ${photoCount} photos captured`;
    } catch (error) {
        console.error('Error capturing photo:', error);
        status.textContent = `Error: ${error.message}`;
    }
}

function addPhotoToGallery(imageUrl, count) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Photo ${count}`;

    const info = document.createElement('div');
    info.className = 'photo-info';
    info.textContent = `Photo #${count} - ${new Date().toLocaleTimeString()}`;

    photoItem.appendChild(img);
    photoItem.appendChild(info);
    gallery.appendChild(photoItem);
}
