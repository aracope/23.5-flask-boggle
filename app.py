from flask import Flask, render_template, session, jsonify, request
from boggle import Boggle

import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.config["SECRET_KEY"] = "Super_secret_key" \
""
boggle_game = Boggle()

# Load the word list
words = set(open("words.txt").read().splitlines())

print(f"First 10 words in dictionary: {list(words)[:10]}")

@app.route("/")
def homepage():
    """Show the game board/game statistics"""
    board = boggle_game.make_board()
    # Store board in session
    session["board"] = board
    # session.setdefault("games_played", 0)
    # session.setdefault("high_score", 0)

    return render_template("index.html", board=board)

@app.route("/check-word")
def check_word():
    """Check if submitted word is valid"""
    word = request.args.get("word", "").lower()
    board = session["board"]

    logging.debug(f"Received word: {word}")
    logging.debug(f"Board: {board}")

    result = boggle_game.check_valid_word(board, word)

    logging.debug(f"Word '{word}' check result: {result}")
    return jsonify({"result": result})

@app.route("/post-score", methods=["POST"])
def post_score():
    """Update game statistics with the submitted score."""
    score = request.json.get("score")
    if "games_played" not in session:
        session["games_played"] = 0
    if "high_score" not in session:
        session["high_score"] = 0
            
    session["games_played"] += 1
    session["high_score"] = max(session["high_score"], score)

    return jsonify({
        "games_played": session["games_played"],
        "high_score": session["high_score"]
    })

if __name__ == "__main__":
    app.run(debug=True)







