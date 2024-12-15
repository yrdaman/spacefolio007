// Interactive hover effects
document.querySelectorAll(".window").forEach(window => {
    window.addEventListener("mouseover", () => {
        window.style.boxShadow = "0 0 25px #00ffff";
    });
    window.addEventListener("mouseout", () => {
        window.style.boxShadow = "0 0 15px #4444ff";
    });
});

console.log("Welcome to Rakesh's Cosmic Portfolio! 🚀");


const marqueeImages = document.querySelectorAll('.marqueeImage');

setInterval(() => {
    marqueeImages.forEach(image => {
        image.style.opacity = Math.random(); // Random opacity for flickering effect
    });
}, 500);