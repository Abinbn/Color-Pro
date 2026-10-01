document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const resultsSection = document.getElementById('resultsSection');
    const paletteGrid = document.getElementById('paletteGrid');
    const colorCountEl = document.getElementById('colorCount');
    const toast = document.getElementById('toast');

    // Handle Drag and Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });

    // Handle File Input
    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // Handle Click on Upload Area (if clicking outside the button)
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-content') && e.target.tagName !== 'BUTTON') {
            imageInput.click();
        }
    });

    function handleImageUpload(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Show preview
                document.querySelector('.upload-content').hidden = true;
                imagePreview.src = img.src;
                imagePreview.hidden = false;
                
                // Show analyzing state
                resultsSection.hidden = false;
                colorCountEl.textContent = "Analyzing pixels...";
                paletteGrid.innerHTML = '';

                // Process colors (use setTimeout to allow UI to update first)
                setTimeout(() => extractColors(img), 50);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Scale down image for processing performance and grouping
        // A 100x100 grid is 10,000 pixels, plenty for finding dominant colors
        const MAX_DIMENSION = 150; 
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
            } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height).data;
        const colorCounts = {};
        let totalPixels = 0;

        for (let i = 0; i < imageData.length; i += 4) {
            // Skip highly transparent pixels
            if (imageData[i + 3] < 128) continue;

            // Quantize colors (grouping similar colors together)
            // Divide by 16, round, multiply by 16 creates buckets of similar colors
            const QUANTIZE = 16;
            const r = Math.round(imageData[i] / QUANTIZE) * QUANTIZE;
            const g = Math.round(imageData[i + 1] / QUANTIZE) * QUANTIZE;
            const b = Math.round(imageData[i + 2] / QUANTIZE) * QUANTIZE;
            
            // Clamp to 255
            const finalR = Math.min(255, r);
            const finalG = Math.min(255, g);
            const finalB = Math.min(255, b);

            const hex = rgbToHex(finalR, finalG, finalB);
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            totalPixels++;
        }

        // Sort by frequency (hierarchical order)
        const sortedColors = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 48); // Keep top 48 colors

        renderPalette(sortedColors, totalPixels);
    }

    function rgbToHex(r, g, b) {
        const toHex = c => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    function renderPalette(colors, totalPixels) {
        paletteGrid.innerHTML = '';
        
        if (colors.length === 0) {
            colorCountEl.textContent = "No visible colors found.";
            return;
        }

        colorCountEl.textContent = `Found ${colors.length} dominant colors`;

        colors.forEach(([hex, count]) => {
            const percentage = ((count / totalPixels) * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = 'color-card';
            card.title = `Click to copy ${hex}`;
            
            card.innerHTML = `
                <div class="color-swatch" style="background-color: ${hex}"></div>
                <div class="color-details">
                    <div class="color-hex">${hex.toUpperCase()}</div>
                    <div class="color-freq">${percentage}% of image</div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
                    showToast(`Copied ${hex.toUpperCase()}`);
                });
            });
            
            paletteGrid.appendChild(card);
        });
    }

    let toastTimeout;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});
