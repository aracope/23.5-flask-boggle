$(document).ready(function () {
    let score = 0;
    let timeLeft = 60; // Timer starts at 60 seconds
    let timerId;

    function updateTimer() {
        $("#timer").text(`Time left: ${timeLeft}s`);
    }

    function startTimer() {
        updateTimer(); // Show initial time
        timerId = setInterval(function () {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                $("#word-form").find("input, button").prop("disabled", true); // Disable input & button
                $("#result").text("Time's up! Game over. ");
            }
        }, 1000);
    }

    startTimer(); // Start countdown when the page loads

    $("#word-form").on("submit", async function (evt) {
        evt.preventDefault();
        if (timeLeft <= 0) return; // Prevent submissions after time runs out

        let word = $("#word-input").val();
        let response = await axios.get("/check-word", { params: { word: word } });
        let result = response.data.result;
        let message;

        if (result === "ok") {
            let wordScore = word.length;
            score += wordScore;
            $("#score").text(`Score: ${score}`);
            message = `"${word}" is a valid word! (+${wordScore} points)`;
        } else if (result === "not-on-board") {
            message = `"${word}" is not on the board.`;
        } else {
            message = `"${word}" is not a valid word.`;
        }

        $("#result").text(message);
        $("#word-input").val("");
    });
});
