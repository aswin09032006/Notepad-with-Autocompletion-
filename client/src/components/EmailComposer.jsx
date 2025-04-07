import { FileText, MessageSquare, RefreshCw, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const EmailComposer = () => {
    // Email state
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    
    // Autocomplete state
    const [query, setQuery] = useState('');
    const [activeField, setActiveField] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [cursorPosition, setCursorPosition] = useState(0);
    
    // Status state
    const [status, setStatus] = useState('');
    
    // Refs
    const toInputRef = useRef(null);
    const subjectInputRef = useRef(null);
    const bodyInputRef = useRef(null);
    const suggestionListRef = useRef(null);

    // Mock data for demonstration purposes (in a real app, this would come from an API)
    const mockData = {
        contacts: [
        {"name": "John Smith", "email": "john.smith@example.com", "frequency": 100},
        {"name": "Jane Doe", "email": "jane.doe@example.com", "frequency": 90},
        {"name": "Michael Johnson", "email": "michael@example.com", "frequency": 85},
        {"name": "Emily Williams", "email": "emily@example.com", "frequency": 75},
        {"name": "David Brown", "email": "david@example.com", "frequency": 70}
        ],
        phrases: [
        {"text": "Thank you for your time", "frequency": 100},
        {"text": "I hope this email finds you well", "frequency": 95},
        {"text": "Looking forward to hearing from you", "frequency": 90},
        {"text": "Please let me know if you have any questions", "frequency": 85},
        {"text": "Best regards", "frequency": 80}
        ],
        templates: [
        {
            "name": "Meeting Request",
            "subject": "Request for Meeting: [Topic]",
            "body": "Dear [Name],\n\nI would like to schedule a meeting to discuss [Topic]. Are you available on [Date] at [Time]?\n\nBest regards,\n[Your Name]",
            "frequency": 100
        },
        {
            "name": "Project Update",
            "subject": "Project Update: [Project Name]",
            "body": "Dear [Name],\n\nI wanted to provide you with an update on the [Project Name] project. We have completed [Milestone] and are on track to deliver by [Due Date].\n\nBest regards,\n[Your Name]",
            "frequency": 90
        }
        ]
    };
    
    // Fetch suggestions based on current input and active field
    useEffect(() => {
        const fetchSuggestions = async () => {
        if (!query.trim() || !activeField) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Mock API call with our local data
            setTimeout(() => {
            const results = [];
            const queryLower = query.toLowerCase();
            
            // Determine which data to search based on active field
            if (activeField === 'to') {
                const filteredContacts = mockData.contacts.filter(contact => 
                contact.name.toLowerCase().includes(queryLower) || 
                contact.email.toLowerCase().includes(queryLower)
                );
                
                filteredContacts.forEach(contact => {
                results.push({
                    type: 'contact',
                    text: contact.name,
                    data: contact
                });
                });
            } 
            
            if (activeField === 'body') {
                const filteredPhrases = mockData.phrases.filter(phrase => 
                phrase.text.toLowerCase().includes(queryLower)
                );
                
                filteredPhrases.forEach(phrase => {
                results.push({
                    type: 'phrase',
                    text: phrase.text,
                    data: phrase
                });
                });
            }
            
            // Templates can be suggested in any field
            const filteredTemplates = mockData.templates.filter(template => 
                template.name.toLowerCase().includes(queryLower)
            );
            
            filteredTemplates.forEach(template => {
                results.push({
                type: 'template',
                text: template.name,
                data: template
                });
            });
            
            // Sort by frequency
            results.sort((a, b) => b.data.frequency - a.data.frequency);
            
            setSuggestions(results.slice(0, 5));
            setLoading(false);
            }, 300); // Simulate network delay
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setLoading(false);
        }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query, activeField]);

    // Handle input changes for different fields
    const handleInputChange = (e, field) => {
        const value = e.target.value;
        
        if (field === 'to') {
        setTo(value);
        } else if (field === 'subject') {
        setSubject(value);
        } else if (field === 'body') {
        setBody(value);
        setCursorPosition(e.target.selectionStart);
        }
        
        setQuery(value);
        setActiveField(field);
        setSelectedIndex(-1);
    };

    // Handle field focus
    const handleFocus = (field) => {
        setActiveField(field);
        let currentValue = '';
        
        if (field === 'to') {
        currentValue = to;
        } else if (field === 'subject') {
        currentValue = subject;
        } else if (field === 'body') {
        currentValue = body;
        }
        
        setQuery(currentValue);
    };

    // Handle field blur
    const handleBlur = () => {
        // Use a small delay to allow for suggestion clicks to register
        setTimeout(() => {
            if (!suggestionListRef.current?.contains(document.activeElement)) {
                setSuggestions([]);
                setSelectedIndex(-1);
            }
        }, 200);
    };

    // Apply a suggestion
    const applySuggestion = (suggestion) => {
        if (suggestion.type === 'contact') {
        setTo(suggestion.data.email);
        } else if (suggestion.type === 'phrase' && activeField === 'body') {
        const before = body.substring(0, cursorPosition);
        const after = body.substring(cursorPosition);
        setBody(`${before}${suggestion.data.text} ${after}`);
        } else if (suggestion.type === 'template') {
        setSubject(suggestion.data.subject);
        setBody(suggestion.data.body);
        }
        
        setSuggestions([]);
        setSelectedIndex(-1);
        
        // Focus back on the appropriate field
        if (activeField === 'to') toInputRef.current?.focus();
        else if (activeField === 'subject') subjectInputRef.current?.focus();
        else if (activeField === 'body') bodyInputRef.current?.focus();
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;
        
        if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
            prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
        setSuggestions([]);
        }
    };

    // Send email
    const sendEmail = () => {
        // In a real app, this would call an API to send the email
        setStatus('sending');
        setTimeout(() => {
        setStatus('sent');
        setTimeout(() => {
            setTo('');
            setSubject('');
            setBody('');
            setStatus('');
        }, 2000);
        }, 1500);
    };

    const renderSuggestionIcon = (type) => {
        switch (type) {
        case 'contact':
            return <User className="text-blue-500" size={16} />;
        case 'phrase':
            return <MessageSquare className="text-green-500" size={16} />;
        case 'template':
            return <FileText className="text-purple-500" size={16} />;
        default:
            return null;
        }
    };

    // Render suggestions dropdown
    const renderSuggestions = () => {
        if (suggestions.length === 0) return null;
        
        return (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" 
                ref={suggestionListRef}>
                <div className="p-2 text-sm text-gray-500 border-b">
                    Suggestions
                </div>
                <ul>
                    {suggestions.map((suggestion, index) => (
                        <li
                        key={`${suggestion.type}-${index}`}
                        onClick={() => applySuggestion(suggestion)}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                            index === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                        >
                        <div className="mr-2">
                            {renderSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">
                            {suggestion.type === 'contact' ? suggestion.data.name : suggestion.text}
                            </div>
                            {suggestion.type === 'contact' && (
                            <div className="text-sm text-gray-500">{suggestion.data.email}</div>
                            )}
                            {suggestion.type === 'template' && (
                            <div className="text-sm text-gray-500">Email template</div>
                            )}
                        </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">New Email</h2>
        
        <div className="space-y-4">
            {/* To field */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                <input
                    ref={toInputRef}
                    type="email"
                    value={to}
                    onChange={(e) => handleInputChange(e, 'to')}
                    onFocus={() => handleFocus('to')}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Type to search contacts..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {activeField === 'to' && (
                    <>
                        {renderSuggestions()}
                        {loading && (
                            <div className="absolute right-3 top-10">
                                <RefreshCw size={16} className="animate-spin text-gray-400" />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Subject field */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                <input
                    ref={subjectInputRef}
                    type="text"
                    value={subject}
                    onChange={(e) => handleInputChange(e, 'subject')}
                    onFocus={() => handleFocus('subject')}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Email subject..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {activeField === 'subject' && (
                    <>
                        {renderSuggestions()}
                        {loading && (
                            <div className="absolute right-3 top-10">
                                <RefreshCw size={16} className="animate-spin text-gray-400" />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Body field */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                <textarea
                    ref={bodyInputRef}
                    value={body}
                    onChange={(e) => handleInputChange(e, 'body')}
                    onFocus={() => handleFocus('body')}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here... Try phrases like 'Thank you' or 'I hope'"
                    className="w-full h-60 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {activeField === 'body' && (
                    <>
                        {renderSuggestions()}
                        {loading && (
                            <div className="absolute right-3 top-10">
                                <RefreshCw size={16} className="animate-spin text-gray-400" />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-4">
                <button
                    onClick={() => {
                    setTo('');
                    setSubject('');
                    setBody('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                >
                    <X size={16} className="mr-1" /> Discard
                </button>
                
                <button
                    onClick={sendEmail}
                    disabled={status !== ''}
                    className={`px-4 py-2 rounded-md text-white flex items-center focus:outline-none focus:ring-2 ${
                    status ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {status === 'sending' ? (
                    <>
                        <RefreshCw size={16} className="animate-spin mr-1" />
                        Sending...
                    </>
                    ) : status === 'sent' ? (
                    'Sent!'
                    ) : (
                    <>
                        <Send size={16} className="mr-1" /> Send
                    </>
                    )}
                </button>
            </div>
        </div>
        </div>
    );
};

export default EmailComposer;