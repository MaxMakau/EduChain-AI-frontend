import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Send, X, PlusCircle } from 'lucide-react';

// set backend host for websocket connection
const BACKEND_HOST = 'educhain-ai.onrender.com';

const ParentChatInterface = ({ isOpen, onClose, uniqueTeachers, updateTotalUnreadMessages }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const ws = useRef(null); // WebSocket instance ref
  const [isConnected, setIsConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false); // New state for loading teachers

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getConversationTitle = (conversation, currentUser) => {
    if (conversation.conversation_type === 'teacher_parent' && conversation.teacher) {
      const teacher = conversation.teacher;
      return teacher.first_name && teacher.last_name
        ? `${teacher.first_name} ${teacher.last_name}`
        : teacher.first_name || teacher.email || `Teacher ${teacher.id}`;
    }
    return `Conversation ${conversation.id}`;
  };

  const startConversationWithTeacher = async (teacherId, teacherName) => {
    // Check if a conversation with this teacher already exists
    const existingConversation = conversations.find(
      (conv) => conv.conversation_type === 'teacher_parent' && conv.teacher?.id === teacherId
    );

    if (existingConversation) {
      setCurrentConversation(existingConversation);
      setError(null);
      return;
    }

    const title = `Conversation with ${teacherName}`;
    try {
      const response = await axiosInstance.post('/chat/conversations/create/', {
        title: title,
        conversation_type: 'teacher_parent',
        parent: user.id,
        teacher: teacherId,
      });
      setConversations(prev => [response.data, ...prev]);
      setCurrentConversation(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError('Failed to start conversation.');
    }
  };

  // Fetch conversations and setup WebSocket
  useEffect(() => {
    if (!isOpen) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken || !user?.id) {
      setError("Authentication token or user ID is missing.");
      return;
    }

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/chat/conversations/');
        let fetchedConversations = response.data.filter(conv => 
          conv.conversation_type === 'teacher_parent' && 
          uniqueTeachers.some(teacher => teacher.id === conv.teacher?.id)
        );

        setConversations(fetchedConversations);

        const unreadCount = fetchedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        if (updateTotalUnreadMessages) {
          updateTotalUnreadMessages(unreadCount);
        }

        // If there's no current conversation selected, and we have conversations, set the first one as current
        if (!currentConversation && fetchedConversations.length > 0) {
          setCurrentConversation(fetchedConversations[0]);
        }

        // No need to establish WebSocket here, it will be handled by the currentConversation useEffect
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setError('Failed to load conversations.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };

  }, [isOpen, user, uniqueTeachers, updateTotalUnreadMessages]); // Removed currentConversation from dependencies

  // Re-establish WebSocket when currentConversation changes (if already open)
  useEffect(() => {
    if (!isOpen || !currentConversation?.id || !user?.id) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError("Authentication token is missing for WebSocket.");
      return;
    }

    const websocketUrl = `wss://${BACKEND_HOST}/ws/chat/${currentConversation.id}/?token=${accessToken}`;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }

    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection opened for new conversation.');
      setIsConnected(true);
      setWsError(null);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message via WebSocket:', data);
      setMessages(prevMessages => [...prevMessages, {
          id: data.message_id,
          sender: { id: data.sender_id, first_name: data.sender_first_name },
          content: data.message,
          timestamp: data.timestamp,
      }]);
      // Optionally, refresh conversations to update unread counts
      axiosInstance.get('/chat/conversations/').then(response => {
        const updatedConversations = response.data.filter(conv => 
          conv.conversation_type === 'teacher_parent' && 
          uniqueTeachers.some(teacher => teacher.id === conv.teacher?.id)
        );
        setConversations(updatedConversations);
        const unreadCount = updatedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        if (updateTotalUnreadMessages) {
          updateTotalUnreadMessages(unreadCount);
        }
      });
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket connection closed for new conversation.', event);
      setIsConnected(false);
      if (!event.wasClean) {
        setWsError('WebSocket connection lost unexpectedly. Please refresh.');
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsError('WebSocket connection error. Please try again.');
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };

  }, [currentConversation, isOpen, user, uniqueTeachers, updateTotalUnreadMessages]);

  // Fetch messages for the current conversation via REST API
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }

    const fetchHistoricalMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/chat/conversations/${currentConversation.id}/messages/`);
        setMessages(response.data);
        await axiosInstance.post(`/chat/conversations/${currentConversation.id}/mark-read/`);
        if (updateTotalUnreadMessages) {
          const updatedConversationsResponse = await axiosInstance.get('/chat/conversations/');
          const updatedConversations = updatedConversationsResponse.data.filter(conv => 
            conv.conversation_type === 'teacher_parent' && 
            uniqueTeachers.some(teacher => teacher.id === conv.teacher?.id)
          );
          const unreadCount = updatedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
          updateTotalUnreadMessages(unreadCount);
        }
      } catch (err) {
        console.error('Failed to fetch historical messages:', err);
        setError('Failed to load messages.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistoricalMessages();
  }, [currentConversation, uniqueTeachers, updateTotalUnreadMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim()) {
      console.log("Attempted to send empty message.");
      return;
    }

    let targetConversation = currentConversation;

    if (!targetConversation) { 
      console.log("No target conversation after creation attempt.", { targetConversation, uniqueTeachers });
      setError('No conversation selected or could be initiated.');
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is open. Sending message.", { conversationId: targetConversation.id, message: newMessageContent });
      const messageData = {
        conversation: targetConversation.id,
        message: newMessageContent,
      };
      ws.current.send(JSON.stringify(messageData));
      setNewMessageContent('');
    } else {
      console.log("WebSocket not open or not connected.", { isConnected, wsReadyState: ws.current?.readyState });
      setError("Not connected to chat. Please wait or refresh.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
      <div className="chat-container bg-white rounded-lg shadow-xl flex h-5/6 w-11/12 md:w-2/3 lg:w-1/2">
        
        {/* Chat Sidebar - Conditionally rendered */}
        <div className="chat-sidebar w-1/3 border-r border-gray-200 flex flex-col">
          <div className="sidebar-header p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Conversations</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150">
              <X size={24} />
            </button>
          </div>
          <div className="conversations-list flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-gray-500">Loading conversations...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error}</div>
            ) : (
              <>
                {conversations.length > 0 ? (
                  <div className="mb-6">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        className={`conversation-item p-3 cursor-pointer rounded-md mb-2 ${currentConversation?.id === conv.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50 text-gray-700'}`}
                        onClick={() => setCurrentConversation(conv)}
                      >
                        <div className="conversation-name font-semibold flex justify-between items-center">
                          {getConversationTitle(conv, user)}
                          {conv.unread_count > 0 && (
                            <span className="unread-badge ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{conv.unread_count}</span>
                          )}
                        </div>
                        {conv.last_message && (
                          <div className="conversation-preview text-sm text-gray-600 truncate">
                            {conv.last_message.sender_id === user.id
                              ? "You"
                              : conv.last_message.sender_id === conv.teacher?.id
                                ? conv.teacher.first_name
                                : conv.last_message.sender_id === conv.parent?.id
                                  ? conv.parent.first_name
                                  : "Someone"}: {conv.last_message.content?.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No conversations yet.</p>
                )}
              </>
            )}
          </div>
          {/* Display "Start New Chat" section for parents below conversations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Start New Chat</h3>
            {isLoadingTeachers ? (
              <p className="text-gray-500">Loading teachers...</p>
            ) : uniqueTeachers.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 mb-4">
                {uniqueTeachers.map(teacher => (
                  <div
                    key={teacher.id}
                    className="p-2 cursor-pointer hover:bg-gray-100 rounded-md flex justify-between items-center"
                    onClick={() => startConversationWithTeacher(teacher.id, `${teacher.first_name} ${teacher.last_name}`)}
                  >
                    <span className="font-medium text-gray-800">{`${teacher.first_name} ${teacher.last_name}`}</span>
                    <PlusCircle size={20} className="text-blue-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No teachers available to start a conversation with.</p>
            )}
          </div>
        </div>

        {/* Chat Main Section */}
        <div className="chat-main flex-1 flex flex-col">
          <div className="chat-header p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentConversation 
                ? getConversationTitle(currentConversation, user)
                : (uniqueTeachers.length === 1 && uniqueTeachers[0]
                  ? `Chat with ${uniqueTeachers[0].first_name} ${uniqueTeachers[0].last_name}`
                  : "Select a conversation or start a new one")}
            </h2>
            {(uniqueTeachers.length === 1 || !currentConversation) && (
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                <X size={24} />
              </button>
            )}
          </div>

          <div className="chat-messages flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col" ref={messagesEndRef}>
            {currentConversation ? (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message mb-3 p-3 rounded-lg max-w-[70%] ${message.sender.id === user.id ? 'self-end ml-auto bg-blue-500 text-white' : 'self-start mr-auto bg-gray-200 text-gray-800'}`}
                >
                  <div className="message-info font-semibold text-sm mb-1">
                    {message.sender.id === user.id ? "You" : `Teacher ${message.sender.first_name}`}
                  </div>
                  {message.content}
                  <div className="message-timestamp text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                {uniqueTeachers.length === 1 && uniqueTeachers[0] ? (
                  `Start your chat with ${uniqueTeachers[0].first_name} ${uniqueTeachers[0].last_name}`
                ) : (
                  "Select a conversation or start a new one."
                )}
              </div>
            )}
            <div /> {/* Invisible div for scrolling to bottom */}
          </div>

          {currentConversation || uniqueTeachers.length === 1 ? (
            <form onSubmit={handleSendMessage} className="chat-input-container p-4 border-t border-gray-200 bg-white flex items-center">
              <div className="chat-input-wrapper flex-1 flex items-center border border-gray-300 rounded-lg pr-2">
                <textarea 
                  id="chat-input" 
                  className="chat-input flex-1 p-2 resize-none outline-none overflow-hidden h-10"
                  placeholder="Type your message here..."
                  rows="1"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button type="submit" className="send-button bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex-shrink-0">
                  <Send size={20} />
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ParentChatInterface;
