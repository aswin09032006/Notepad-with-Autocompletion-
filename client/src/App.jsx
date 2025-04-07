import { Download, Moon, Save, Sun, Trash2, Wifi, WifiOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:5000/api';

const App = () => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [localDictionary, setLocalDictionary] = useState([
    'react', 'redux', 'javascript', 'tailwind', 'typescript',
    'python', 'programming', 'development', 'application',
    'interface', 'component', 'function', 'variable', 'constant',
    'algorithm', 'data', 'structure', 'trie', 'autocompletion'
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const editorRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Effect to handle theme change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check API availability on load
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/suggestions?prefix=re`);
      setIsOnline(response.ok);
    } catch (error) {
      console.log('API not available, using local suggestions');
      setIsOnline(false);
    }
  };

  // Function to handle text change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Get cursor position
    const position = e.target.selectionStart;
    setCursorPosition(position);
    
    // Get current word
    let wordStart = position;
    while (wordStart > 0 && newText[wordStart - 1] !== ' ' && newText[wordStart - 1] !== '\n') {
      wordStart--;
    }
    
    const word = newText.substring(wordStart, position);
    setCurrentWord(word);
    
    // Debounce API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Show suggestions only if current word is at least 2 characters
    if (word.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        getSuggestions(word);
      }, 200);
    } else {
      setShowSuggestions(false);
    }
  };

  // Function to get suggestions from API or fallback to local dictionary
  const getSuggestions = async (word) => {
    if (isOnline) {
      try {
        const response = await fetch(`${API_URL}/suggestions?prefix=${word.toLowerCase()}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
          setActiveSuggestion(0);
          return;
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setIsOnline(false);
      }
    }
    
    // Fallback to local dictionary
    const wordSuggestions = localDictionary.filter(item => 
      item.toLowerCase().startsWith(word.toLowerCase())
    );
    setSuggestions(wordSuggestions);
    setShowSuggestions(wordSuggestions.length > 0);
    setActiveSuggestion(0);
  };

  // Function to handle suggestion selection
  const handleSuggestionClick = () => {
    if (suggestions.length === 0) return;
    
    const suggestion = suggestions[activeSuggestion];
    const textBeforeCursor = text.substring(0, cursorPosition - currentWord.length);
    const textAfterCursor = text.substring(cursorPosition);
    
    const newText = textBeforeCursor + suggestion + textAfterCursor;
    setText(newText);
    
    // Calculate new cursor position
    const newPosition = textBeforeCursor.length + suggestion.length;
    
    // Focus and set cursor position after state update
    setTimeout(() => {
      const editor = editorRef.current;
      if (editor) {
        editor.focus();
        editor.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
    
    setShowSuggestions(false);
    
    // Add word to dictionary if it's not already there
    addWordToDictionary(suggestion);
  };

  // Function to handle keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    // Only handle keys if suggestions are shown
    if (!showSuggestions) return;
    
    // Tab or Right Arrow key to accept suggestion
    if (e.keyCode === 9 || e.keyCode === 39) {
      if (suggestions.length > 0) {
        e.preventDefault();
        handleSuggestionClick();
      }
    }
    // Up arrow
    else if (e.keyCode === 38) {
      e.preventDefault();
      setActiveSuggestion(prevActive => 
        prevActive === 0 ? suggestions.length - 1 : prevActive - 1
      );
    }
    // Down arrow
    else if (e.keyCode === 40) {
      e.preventDefault();
      setActiveSuggestion(prevActive => 
        prevActive === suggestions.length - 1 ? 0 : prevActive + 1
      );
    }
    // Escape key
    else if (e.keyCode === 27) {
      setShowSuggestions(false);
    }
  };

  // Function to add a new word to dictionary
  const addWordToDictionary = async (word) => {
    if (!word || word.length < 2) return;
    
    // Add to local dictionary
    if (!localDictionary.includes(word.toLowerCase())) {
      setLocalDictionary(prev => [...prev, word.toLowerCase()]);
    }
    
    // Add to API dictionary if online
    if (isOnline) {
      try {
        await fetch(`${API_URL}/add-word`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word }),
        });
      } catch (error) {
        console.error('Error adding word to API dictionary:', error);
      }
    }
  };

  // Function to save text
  const saveText = () => {
    localStorage.setItem('savedNotepadText', text);
    alert('Text saved to local storage');
  };

  // Function to download text as file
  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'notepad-content.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Function to clear text
  const clearText = () => {
    if (confirm('Are you sure you want to clear all text?')) {
      setText('');
    }
  };

  // Load saved text when component mounts
  useEffect(() => {
    const savedText = localStorage.getItem('savedNotepadText');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // Render the visible text with suggested completion
  const renderTextWithSuggestion = () => {
    if (!showSuggestions || suggestions.length === 0) {
      return text;
    }

    const suggestion = suggestions[activeSuggestion];
    const completionPart = suggestion.substring(currentWord.length);
    
    // Calculate the parts of the text to display
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);

    return (
      <>
        {beforeCursor}
        <span className="text-gray-400 dark:text-gray-600">{completionPart}</span>
        {afterCursor}
      </>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark:bg-gray-900 dark:text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`py-3 px-4 flex justify-between items-center border-b ${isDarkMode ? 'dark:border-gray-800 dark:bg-gray-950' : 'border-gray-200 bg-white'} shadow-sm`}>
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-normal tracking-tight">Notepad</h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={saveText}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            title="Save"
          >
            <Save size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={downloadText}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            title="Download"
          >
            <Download size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={clearText}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            title="Clear"
          >
            <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? (
              <Sun size={16} className="text-gray-400" />
            ) : (
              <Moon size={16} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>
      
      {/* Main Editor */}
      <main className="flex-1 p-4 md:p-6 flex items-stretch">
        <div className={`w-full relative rounded-lg ${isDarkMode ? 'dark:bg-gray-900' : 'bg-white shadow-sm border border-gray-200'}`}>
          <div className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-words pointer-events-none" style={{ lineHeight: '1.6' }}>
            {renderTextWithSuggestion()}
          </div>
          <textarea
            ref={editorRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className={`w-full h-full min-h-96 p-4 resize-none focus:outline-none font-mono text-sm bg-transparent caret-current ${
              isDarkMode ? 'dark:placeholder:text-gray-600' : 'placeholder:text-gray-400'
            }`}
            placeholder="Start typing..."
            style={{ lineHeight: '1.6' }}
            spellCheck="false"
          ></textarea>
        </div>
      </main>
      
      {/* Footer */}
      <footer className={`py-2 px-4 flex justify-between items-center text-xs border-t ${
        isDarkMode ? 'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500 ' : 'border-gray-200 bg-white text-gray-400'
      }`}>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi size={12} className="mr-1 text-green-700" />
          ) : (
            <WifiOff size={12} className="mr-1 text-red-700" />
          )}
          <span className="font-mono">{isOnline ? <p className='font-mono text-green-700'>Connected</p> : <p className='font-mono text-red-700'>Offline</p>}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono">{text.length} chars</p>
          {showSuggestions && suggestions.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Tab to complete
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;