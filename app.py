from flask import Flask, render_template, session, jsonify, request
from boggle import Boggle

app = Flask(__name__)
app.config["SECRET_KEY"] = "Super_secret_key" \
""
boggle_game = Boggle()

# Load the word list
words = set(open("words.txt").read().splitlines())

@app.route("/")
def homepage():
    """Show the game board."""
    board = boggle_game.make_board()
    # Store board in session
    session["board"] = board
    return render_template("index.html", board=board)

@app.route("/check-word")
def check_word():
    """Check if submitted word is valid"""
    word = request.args.get("word")
    board = session["board"]

    if word not in words: 
        return jsonify({"result": "not-a-word"})
    
    if not boggle_game.check_valid_word(board, word):
        return jsonify({"result": "not-on-board"})
    
    return jsonify({"result": "ok"})

if __name__ == "__main__":
    app.run(debug=True)