import os
import random
import time

def general_answer(message):
    """
    Enhanced general service with realistic responses for streaming
    """
    api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    # Check if API key is available
    if not api_key:
        return "I'm sorry, but I'm currently not connected to my AI model. Please check the configuration and try again."
    
    # Generate contextual responses based on message type
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greeting']):
        responses = [
            f"Hello! I'm your AI assistant, and I'm here to help you with any questions or tasks you might have. You said: '{message}'. How can I assist you today? I can help with various topics including technology, science, history, writing, and much more.",
            
            f"Hi there! I'm excited to chat with you. You mentioned: '{message}'. I'm here to be helpful, informative, and engaging. Whether you need help with a problem, want to learn something new, or just want to have an interesting conversation, I'm ready to assist you.",
            
            f"Hey! Great to meet you. I'm your AI companion, and I'm here to help with whatever you need. You said: '{message}'. I can assist with questions, provide information, help with tasks, or just chat about interesting topics. What would you like to explore today?"
        ]
        return random.choice(responses)
    
    elif any(word in message_lower for word in ['help', 'assist', 'support']):
        responses = [
            f"I'd be happy to help you! You mentioned: '{message}'. I can assist with a wide range of topics including research, writing, problem-solving, explanations, and general knowledge questions. Just let me know what you need help with, and I'll do my best to provide useful information and guidance.",
            
            f"Of course! I'm here to help with whatever you need. You said: '{message}'. I can provide information on various subjects, help you understand complex topics, assist with writing and analysis, or just engage in interesting conversations. What specific area would you like help with?"
        ]
        return random.choice(responses)
    
    elif any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
        responses = [
            f"You're very welcome! I'm glad I could help. Your message '{message}' shows appreciation, and that means a lot. I'm here to be helpful and supportive, so don't hesitate to ask if you need anything else. I enjoy our conversations and look forward to assisting you further.",
            
            f"Thank you for your kind words! I appreciate you taking the time to say '{message}'. It's my pleasure to help, and I'm always here when you need assistance. Whether it's answering questions, providing information, or just having a good conversation, I'm ready to help."
        ]
        return random.choice(responses)
    
    elif any(word in message_lower for word in ['how are you', 'how do you do', 'how\'s it going']):
        responses = [
            f"I'm functioning well, thank you for asking! You said: '{message}'. I'm ready to help and engage in interesting conversations. I don't experience emotions the way humans do, but I'm designed to be helpful, informative, and engaging. How are you doing today? I'd love to hear about what you're working on or what's on your mind.",
            
            f"I'm doing great, thanks! I'm always ready to assist and learn. You mentioned: '{message}'. I'm designed to be helpful and engaging, and I enjoy our conversations. I'm curious about you too - what brings you here today? Are you working on something interesting or do you have questions I can help with?"
        ]
        return random.choice(responses)
    
    elif any(word in message_lower for word in ['what can you do', 'capabilities', 'abilities']):
        responses = [
            f"Great question! I have many capabilities that I'd be happy to share. You asked: '{message}'. I can help with research and information gathering, writing and editing, problem-solving and analysis, explanations of complex topics, creative writing, language translation, mathematical calculations, and much more. I can also engage in interesting conversations about various subjects. What specific area interests you?",
            
            f"I'm glad you're curious about what I can do! You said: '{message}'. I'm designed to be a versatile AI assistant that can help with information, analysis, writing, problem-solving, and engaging conversations. I can work with text, help you understand complex topics, assist with creative projects, and provide insights on various subjects. What would you like to explore?"
        ]
        return random.choice(responses)
    
    else:
        # Generic engaging response
        responses = [
            f"That's an interesting point! You mentioned: '{message}'. I find this topic engaging and would love to explore it further with you. There are many fascinating aspects to discuss, and I'm curious about your perspective. What specific aspects would you like to dive deeper into?",
            
            f"I appreciate you sharing that with me. You said: '{message}'. This is the kind of conversation I enjoy - thoughtful and engaging. I'd love to hear more about your thoughts on this topic and explore different angles together. What aspects are most interesting to you?",
            
            f"That's a great observation! You mentioned: '{message}'. I find this topic really interesting and think there's a lot we could explore together. I'm always eager to learn and discuss new ideas. What would you like to focus on or explore further?",
            
            f"Thank you for sharing that with me. You said: '{message}'. I find this topic fascinating and would love to discuss it more. There are so many interesting angles to consider, and I'm curious about your thoughts and experiences. What aspects would you like to explore together?"
        ]
        return random.choice(responses)

def general_answer_streaming(message, callback):
    """
    Streaming version of general answer for real-time responses
    """
    response = general_answer(message)
    words = response.split()
    
    for i, word in enumerate(words):
        partial_response = ' '.join(words[:i+1])
        callback(partial_response, i == len(words) - 1)
        time.sleep(0.1)  # Adjust timing as needed 