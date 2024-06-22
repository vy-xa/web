const downloadButton = document.getElementById('downloadButton');

downloadButton.addEventListener('mousemove', (e) => {
    const boundingRect = downloadButton.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    // Calculate tilt factors based on cursor position relative to button center
    const tiltX = (offsetX / boundingRect.width - 0.5) * 2; // Range from -1 to 1
    const tiltY = (offsetY / boundingRect.height - 0.5) * 2; // Range from -1 to 1

    // Set custom properties --tilt-x and --tilt-y to CSS
    downloadButton.style.setProperty('--tilt-x', tiltX);
    downloadButton.style.setProperty('--tilt-y', tiltY);
});

// Reset tilt on mouse leave
downloadButton.addEventListener('mouseleave', () => {
    downloadButton.style.setProperty('--tilt-x', 0);
    downloadButton.style.setProperty('--tilt-y', 0);
});
