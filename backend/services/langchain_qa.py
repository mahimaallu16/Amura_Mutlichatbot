import os
import random
import time

def qa_answer(question):
    """
    Enhanced QA service with realistic responses for streaming
    """
    api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    
    # Check if API key is available
    if not api_key:
        return "I'm sorry, but I'm currently not connected to my AI model. Please check the configuration and try again."
    
    # Generate a more detailed response based on the question type
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['hello', 'hi', 'hey', 'greeting']):
        return f"Hello! I'm your AI assistant, and I'm here to help you with any questions you might have. You asked: '{question}'. How can I assist you today? I can help with various topics including technology, science, history, and much more."
    
    elif any(word in question_lower for word in ['weather', 'temperature', 'climate']):
        return f"That's an interesting question about weather! While I can't provide real-time weather data, I can explain weather patterns, climate science, and meteorological concepts. Your question '{question}' touches on atmospheric science, which is fascinating. Would you like me to explain any specific weather phenomena?"
    
    elif any(word in question_lower for word in ['python', 'programming', 'code', 'software']):
        return f"Great question about programming! Python is indeed a versatile language. Based on your question '{question}', I can help you with Python syntax, best practices, debugging, and various programming concepts. Programming is all about problem-solving and creativity. What specific aspect would you like to explore?"
    
    elif any(word in question_lower for word in ['ai', 'artificial intelligence', 'machine learning']):
        return f"Excellent question about AI! Artificial Intelligence is transforming our world in incredible ways. Your question '{question}' shows you're interested in this cutting-edge field. AI encompasses machine learning, neural networks, natural language processing, and more. It's fascinating how AI can learn patterns and make predictions. What specific AI topic interests you most?"
    
    elif any(word in question_lower for word in ['history', 'historical', 'past']):
        return f"History is such a rich and fascinating subject! Your question '{question}' shows curiosity about our past. History helps us understand how societies evolved, how decisions shaped our present, and what we can learn from previous generations. Every historical event has multiple perspectives and lessons to teach us. What historical period or event would you like to explore further?"
    
    else:
        # Generic detailed response
        responses = [
            f"That's a thoughtful question! '{question}' is an interesting topic to explore. Let me share some insights that might help you understand this better. The subject you're asking about has many fascinating aspects, and I'd be happy to dive deeper into any specific area that interests you.",
            
            f"I appreciate your curiosity about this topic. Your question '{question}' touches on some important concepts. This is a complex subject with many different perspectives, and I think it's great that you're seeking to understand it better. There's always more to learn, and asking questions is the best way to gain knowledge.",
            
            f"What an interesting question! '{question}' is something that many people wonder about. This topic has evolved over time and continues to be relevant today. Understanding it can provide valuable insights into how things work and why they matter. I'd love to explore this further with you."
        ]
        
        return random.choice(responses)

def qa_answer_streaming(question, callback):
    """
    Streaming version of QA answer for real-time responses
    """
    response = qa_answer(question)
    words = response.split()
    
    for i, word in enumerate(words):
        partial_response = ' '.join(words[:i+1])
        callback(partial_response, i == len(words) - 1)
        time.sleep(0.1)  # Adjust timing as needed
