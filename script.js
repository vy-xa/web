const downloadButton = document.getElementById('downloadButton');

downloadButton.addEventListener('mousemove', (e) => {
    const boundingRect = downloadButton.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    // Calculate tilt factor based on cursor position relative to button center
    const tiltX = offsetX / boundingRect.width - 0.5;
    const tiltY = offsetY / boundingRect.height - 0.5;
    const tiltFactor = Math.atan2(tiltY, tiltX) * (180 / Math.PI) * 0.5;

    // Set custom property --tilt-factor to CSS
    downloadButton.style.setProperty('--tilt-factor', tiltFactor);
});

// Reset tilt on mouse leave
downloadButton.addEventListener('mouseleave', () => {
    downloadButton.style.setProperty('--tilt-factor', 0);
});
