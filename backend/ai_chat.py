import os
from cerebras.cloud.sdk import Cerebras

client = Cerebras()  # Will use CEREBRAS_API_KEY from environment by default

async def get_ai_response(message: str, history: list = None) -> dict:
    """
    Get response from Cerebras AI using the official SDK with context.
    """
    try:
        # Initialize history if None
        if history is None:
            history = []
            
        # Add system context message if history is empty
        if not history:
            history.append({
                "role": "system",
                "content": "You are a helpful and empathetic AI assistant focused on mental health support."
            })
            
        # Add the new user message
        history.append({
            "role": "user",
            "content": message
        })
        
        # Get AI response with full conversation history
        chat_completion = client.chat.completions.create(
            messages=history,
            model="llama3.1-8b"
        )
        
        response = chat_completion.choices[0].message.content
        
        # Add AI response to history
        history.append({
            "role": "assistant",
            "content": response
        })
        
        return {"response": response, "history": history}
        
    except Exception as e:
        print(f"Error calling Cerebras API: {str(e)}")
        return {"response": "I apologize, I'm having trouble responding right now.", "history": history}
