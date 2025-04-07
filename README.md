# Autocomplete System with Trie Data Structure

A high-performance autocomplete system that uses a Trie data structure to provide efficient word suggestions. This project features a Python/Flask backend API and a React frontend interface that work together to deliver a seamless autocomplete experience.

![image](https://github.com/user-attachments/assets/0994181f-8312-4be4-910d-b2df3e87ec3a)

## Features

- **Efficient Trie-based autocompletion** with O(m) lookup time where m is the word length
- **Responsive React frontend** with real-time suggestion display
- **Keyboard navigation** for suggestion selection
- **Theme switching** (dark/light mode)
- **Offline capability** with local dictionary fallback
- **Text persistence** and download options

## System Architecture

### Backend

- **Python** with **Flask** web framework
- **Trie data structure** implementation with:
  - Word insertion (O(m) time complexity)
  - Word search (O(m) time complexity)
  - Prefix-based suggestion retrieval

### Frontend

- **React** application with:
  - Real-time suggestion display
  - Keyboard and mouse navigation
  - Theme support
  - Text analysis for current word detection

## Installation

### Prerequisites

- Python 3.7+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/autocomplete-trie.git
cd autocomplete-trie/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install  # or: yarn install

# Start the development server
npm start  # or: yarn start
```

The application will be available at `http://localhost:3000`.

## Usage

1. Type in the text area to see autocompletion suggestions
2. Press Tab or Right Arrow key to accept a suggestion
3. Use Up/Down Arrow keys to navigate through suggestions
4. Click on a suggestion to select it

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/suggestions/<prefix>` | GET | Get autocomplete suggestions for a prefix |
| `/api/add-word` | POST | Add a new word to the dictionary |
| `/api/dictionary` | GET | Get the complete dictionary |

## Performance Optimizations

- **Debouncing** to prevent excessive API calls during typing
- **Local dictionary fallback** for offline functionality
- **Minimum prefix length** of 2 characters for suggestion triggering
- **Result limiting** to maximum 10 suggestions
- **Background dictionary loading** to avoid blocking the UI

## Future Enhancements

- Enhanced local storage using IndexedDB
- Learning user patterns for personalized suggestions
- Multi-word suggestion support
- Spelling correction using Levenshtein distance
- Multilingual dictionary support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Trie data structure implementation was inspired by classic algorithm texts
- UI design influenced by modern autocomplete systems
