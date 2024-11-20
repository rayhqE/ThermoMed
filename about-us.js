document.addEventListener("DOMContentLoaded", function() {
    const learnMoreBtn = document.getElementById("learnMoreBtn");
    const moreInfo = document.getElementById("moreInfo");

    learnMoreBtn.addEventListener("click", function() {
        if (moreInfo.classList.contains("hidden")) {
            moreInfo.classList.remove("hidden");
            learnMoreBtn.textContent = "Show Less";
        } else {
            moreInfo.classList.add("hidden");
            learnMoreBtn.textContent = "Learn More";
        }
    });
});
