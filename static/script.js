class BoggleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;  // Make sure this is properly initialized
        this.guessedWords = new Set(); // Track guessed words
        this.timerId = null;
        this.gamesPlayed = 0; // Track games played
        this.highScore = 0; // Track high score

        this.fetchInitialStats(); // Fetch stats at the start
    }

    async fetchInitialStats() {
        try {
            let response = await axios.get("/get-stats");
            this.gamesPlayed = response.data.games_played;
            this.highScore = response.data.high_score;

            $("#games-played").text(`Games Played: ${this.gamesPlayed}`);
            $("#high-score").text(`High Score: ${this.highScore}`);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    updateTimer() {
        $("#timer").text(`Time left: ${this.timeLeft} seconds`);
    }

    startTimer() {
        this.updateTimer();
        this.timerId = setInterval(() => {  // Use an arrow function to maintain 'this'
            this.timeLeft--;  // Reference 'this.timeLeft' instead of 'timeLeft'
            this.updateTimer();

            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        $("#word-form").find("input, button").prop("disabled", true);
        $("#result").text("Time's up! Game over.");
        this.sendFinalScore();
    }

    async checkWord(word) {
        let response = await axios.get("/check-word", { params: { word: word } });
        return response.data.result;
    }

    async submitWord(word) {
        // Check if word has been guessed already
        if (this.guessedWords.has(word)) {
            return `"${word}" has already been guessed!`
        }

        // Check if word is on the board and valid
        let result = await this.checkWord(word);
        let message = "";

        if (result === "ok") {
            this.addScore(word);
            message = `"${word}" is a valid word! (+${word.length} points)`;
        } else if (result === "not-on-board") {
            message = `"${word}" is not on the board.`;
        } else {
            message = `"${word}" is not a valid word.`;
        }
        return message;
    }

    addScore(word) {
        let wordScore = word.length;
        this.score += wordScore;
        $("#score").text(`Score: ${this.score}`);
        this.guessedWords.add(word);  // Store guessed word
    }

    sendFinalScore() {
        axios.post("/post-score", { score: this.score })
            .then(response => {
                let data = response.data;
                this.gamesPlayed = data.games_played;
                this.highScore = data.high_score;
                $("#games-played").text(`Games Played: ${data.games_played}`);
                $("#high-score").text(`High Score: ${data.high_score}`);
            })
            .catch(error => console.error("Error posting score:", error));
    }
}

$(document).ready(function () {
    // const game = new BoggleGame();
    window.game = new BoggleGame();
    game.startTimer();

    $("#word-form").on("submit", async function (evt) {
        evt.preventDefault();
        if (game.timeLeft <= 0) return;

        let word = $("#word-input").val().toLowerCase(); // Convert to lowercase for consistency

        // Submit and show result
        let message = await game.submitWord(word);
        $("#result").text(message);
        $("#word-input").val("");  // Reset input field
    });
});
