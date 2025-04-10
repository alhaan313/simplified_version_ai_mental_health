from transformers import pipeline

# Initialize the sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis")

def analyze_sentiment(text: str):
    result = sentiment_pipeline(text)[0]
    sentiment = result["label"].lower()  # e.g., 'positive' or 'negative'
    confidence = round(result["score"], 2)
    return {"sentiment": sentiment, "confidence": confidence}
