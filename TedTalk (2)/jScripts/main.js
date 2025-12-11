document.addEventListener("DOMContentLoaded", function () {
    console.log("TED Kids page loaded");

    var navbarToggle = document.getElementById("navbarToggle");
    var mainNavbar = document.getElementById("mainNavbar");

    if (navbarToggle && mainNavbar) {
        navbarToggle.addEventListener("click", function () {
            mainNavbar.classList.toggle("show");
        });
    }

    var scormSupported = false;

    try {
        var initResult = doLMSInitialize();
        if (initResult === "true") {
            scormSupported = true;
        }
    } catch (e) {
        console.warn("שגיאה באתחול SCORM:", e);
        scormSupported = false;
    }

    if (scormSupported) {
        console.log("SCORM פעיל – נתונים יישלחו ל-LMS.");
    } else {
        console.log("SCORM לא זמין – העמוד רץ במצב רגיל.");
    }

    var searchInput = document.getElementById("searchInput");
    var searchBtn = document.getElementById("searchBtn");
    var searchMessage = document.getElementById("searchMessage");
    var skillCards = document.getElementsByClassName("skill-card-wrapper");

    function filterSkills() {
        var query = searchInput.value.trim().toLowerCase();
        var foundCount = 0;

        if (query === "") {
            for (var i = 0; i < skillCards.length; i++) {
                skillCards[i].style.display = "";
            }
            searchMessage.textContent = "מציג את כל המיומנויות.";
            searchMessage.className = "text-muted";
            return;
        }

        for (var j = 0; j < skillCards.length; j++) {
            var card = skillCards[j];
            var title = card.getAttribute("data-skill-title");

            if (title) {
                var normalizedTitle = title.toLowerCase();

                if (normalizedTitle.indexOf(query) !== -1) {
                    card.style.display = "";
                    foundCount++;
                } else {
                    card.style.display = "none";
                }
            }
        }

        if (foundCount === 0) {
            searchMessage.textContent = "לא נמצאו מיומנויות מתאימות. נסה/י ניסוח אחר.";
            searchMessage.className = "text-danger";
        } else if (foundCount === 1) {
            searchMessage.textContent = "נמצאה מיומנות אחת שמתאימה לחיפוש.";
            searchMessage.className = "text-success";
        } else {
            searchMessage.textContent = "נמצאו " + foundCount + " מיומנויות שמתאימות לחיפוש.";
            searchMessage.className = "text-success";
        }
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", function () {
            filterSkills();
        });

        searchInput.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                filterSkills();
            }
        });
    }

    var comfortInput = document.getElementById("comfortLevel");
    var helpfulnessInput = document.getElementById("helpfulness");
    var takeawayInput = document.getElementById("takeaway");
    var sendToLMSBtn = document.getElementById("sendToLMSBtn");
    var feedbackMessage = document.getElementById("feedbackMessage");

    var comfortRatingGroup = document.getElementById("comfortRatingGroup");
    var helpfulnessRatingGroup = document.getElementById("helpfulnessRatingGroup");

    function setupRating(groupEl, inputEl) {
        if (!groupEl || !inputEl) return;

        var buttons = groupEl.querySelectorAll(".rating-option");

        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                buttons.forEach(function (b) {
                    b.classList.remove("active");
                });

                btn.classList.add("active");

                var value = btn.getAttribute("data-value");
                inputEl.value = value;

                groupEl.classList.remove("rating-error");
            });
        });
    }

    setupRating(comfortRatingGroup, comfortInput);
    setupRating(helpfulnessRatingGroup, helpfulnessInput);

    function clearValidation() {
        if (comfortRatingGroup) comfortRatingGroup.classList.remove("rating-error");
        if (helpfulnessRatingGroup) helpfulnessRatingGroup.classList.remove("rating-error");

        if (!takeawayInput || !feedbackMessage) return;

        takeawayInput.classList.remove("is-invalid");
        feedbackMessage.textContent = "";
        feedbackMessage.className = "";
    }

    function validateFeedbackForm() {
        clearValidation();
        var isValid = true;

        var comfortValue = parseInt(comfortInput.value, 10);
        var helpfulnessValue = parseInt(helpfulnessInput.value, 10);
        var takeawayValue = takeawayInput.value.trim();

        if (isNaN(comfortValue) || comfortValue < 1 || comfortValue > 5) {
            if (comfortRatingGroup) comfortRatingGroup.classList.add("rating-error");
            isValid = false;
        }

        if (isNaN(helpfulnessValue) || helpfulnessValue < 1 || helpfulnessValue > 5) {
            if (helpfulnessRatingGroup) helpfulnessRatingGroup.classList.add("rating-error");
            isValid = false;
        }

        if (takeawayValue === "") {
            takeawayInput.classList.add("is-invalid");
            isValid = false;
        }

        if (!isValid) {
            feedbackMessage.textContent = "נא לבחור דירוג לכל שאלה ולכתוב משפט סיכום.";
            feedbackMessage.className = "text-danger";
        }

        return isValid;
    }

    if (sendToLMSBtn) {
        sendToLMSBtn.addEventListener("click", function () {
            if (!validateFeedbackForm()) {
                return;
            }

            var comfortValue = comfortInput.value;
            var helpfulnessValue = helpfulnessInput.value;
            var takeawayValue = takeawayInput.value.trim();

            console.log("Feedback values:", {
                comfort: comfortValue,
                helpfulness: helpfulnessValue,
                takeaway: takeawayValue
            });

            if (scormSupported) {
                doLMSSetValue("cmi.core.lesson_status", "completed");

                var score = Math.round((parseInt(comfortValue, 10) + parseInt(helpfulnessValue, 10)) / 2 * 20); // 1-5 => 20-100
                doLMSSetValue("cmi.core.score.raw", score.toString());

                var jsonData = JSON.stringify({
                    comfort: comfortValue,
                    helpfulness: helpfulnessValue,
                    takeaway: takeawayValue
                });
                doLMSSetValue("cmi.suspend_data", jsonData);

                doLMSCommit();
            }

            feedbackMessage.textContent = scormSupported
                ? "הטופס נשלח בהצלחה! הנתונים נשמרו גם במערכת הלמידה."
                : "הטופס נשלח בהצלחה! (במצב זה הנתונים נשמרים רק בעמוד).";

            feedbackMessage.className = "text-success";
        });
    }

    window.addEventListener("unload", function () {
        if (scormSupported) {
            doLMSFinish();
        }
    });
});
