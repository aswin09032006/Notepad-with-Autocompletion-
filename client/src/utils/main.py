from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.frequency = 0

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        """Insert a word into the trie"""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.frequency += 1
    
    def search(self, word):
        """Search for a word in the trie"""
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word
    
    def get_suggestions(self, prefix, limit=10):
        """Get suggestions for a prefix"""
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        
        suggestions = []
        self._dfs(node, prefix, suggestions, limit)
        return suggestions
    
    def _dfs(self, node, prefix, suggestions, limit):
        """Helper function for depth-first search"""
        if len(suggestions) >= limit:
            return
        
        if node.is_end_of_word:
            suggestions.append((prefix, node.frequency))
        
        for char, child_node in node.children.items():
            self._dfs(child_node, prefix + char, suggestions, limit)

# Create Trie instance
trie = Trie()

# Track loading status
loading_status = {"loaded": False, "words_loaded": 0, "duration": 0}

def load_words_from_file(filepath, max_words=None):
    start_time = time.time()
    count = 0
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                word = line.strip()
                if word:
                    trie.insert(word.lower())
                    count += 1
                if max_words and i >= max_words - 1:
                    break
    except Exception as e:
        print(f"Error loading file: {e}")
    finally:
        loading_status["loaded"] = True
        loading_status["words_loaded"] = count
        loading_status["duration"] = round(time.time() - start_time, 2)
        print(f"Loaded {count} words in {loading_status['duration']}s")

# Background loading
threading.Thread(target=lambda: load_words_from_file("words.txt"), daemon=True).start()

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    prefix = request.args.get('prefix', '')
    limit = int(request.args.get('limit', 10))
    
    if len(prefix) < 2:
        return jsonify([])
    
    suggestions = trie.get_suggestions(prefix.lower(), limit)
    suggestions.sort(key=lambda x: x[1], reverse=True)
    return jsonify([word for word, _ in suggestions])

@app.route('/api/add-word', methods=['POST'])
def add_word():
    data = request.json
    word = data.get('word', '')
    
    if word and len(word) >= 2:
        trie.insert(word.lower())
        return jsonify({"status": "success", "message": f"Added '{word}' to dictionary"})
    
    return jsonify({"status": "error", "message": "Invalid word"}), 400

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(loading_status)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
