from gpt4all import GPT4All
import threading
import time
import re
import sys
import logging
from functools import lru_cache
import queue
import concurrent.futures

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger('EAGLE')

# Global variables
_model = None
_model_lock = threading.Lock()
_response_cache = {}
_response_queue = queue.Queue(maxsize=100)
_worker_pool = concurrent.futures.ThreadPoolExecutor(max_workers=2)
_last_responses = []

# Quick response patterns with context awareness
QUICK_PATTERNS = {
    r'\b(hi|hello|hey)\b': [
        "Hello! Ready to assist!",
        "Hi there! How can I help?",
        "Greetings! What can I do for you?"
    ],
    r'\b(how are you|how\'s it going)\b': [
        "Operating at peak efficiency!",
        "Ready to help!",
        "Functioning perfectly!"
    ],
    r'\b(thanks|thank you)\b': [
        "You're welcome!",
        "Glad to help!",
        "Anytime!"
    ],
    r'\b(what is|what\'s|define)\b': [
        "Let me explain: ",
        "Here's what you need to know: ",
        "Quick explanation: "
    ],
    r'\b(help|assist)\b': [
        "I'll help with that: ",
        "Let me assist you: ",
        "Here's the solution: "
    ]
}

# Response templates for faster processing
RESPONSE_TEMPLATES = {
    'error': "I'll help you quickly with that.",
    'fallback': "I understand. Let me help you with that.",
    'processing': "Processing your request efficiently.",
    'clarification': "Could you clarify that briefly?",
}

@lru_cache(maxsize=1000)
def get_cached_response(prompt):
    """Cached response lookup with LRU cache"""
    return _response_cache.get(prompt.strip().lower())

def initialize_model():
    """Initialize and warm up the model"""
    global _model
    try:
        _model = GPT4All("Meta-Llama-3-8B-Instruct.Q4_0.gguf")
        # Aggressive warm-up
        for _ in range(5):
            _model.generate("test", max_tokens=1)
        return True
    except Exception as e:
        logger.error(f"Model initialization error: {e}")
        return False

def get_model():
    """Get or initialize the model"""
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                initialize_model()
    return _model

def get_quick_response(prompt):
    """Get quick response based on patterns"""
    lower_prompt = prompt.lower()
    for pattern, responses in QUICK_PATTERNS.items():
        if re.search(pattern, lower_prompt):
            # Avoid repetition in quick responses
            for response in responses:
                if response not in _last_responses:
                    _last_responses.append(response)
                    if len(_last_responses) > 5:
                        _last_responses.pop(0)
                    return response
    return None

def preprocess_prompt(prompt):
    """Preprocess and optimize prompt"""
    return prompt.strip()[:200]  # Limit prompt length

def postprocess_response(response):
    """Clean and optimize response"""
    if not response:
        return RESPONSE_TEMPLATES['fallback']
    return response.strip()[:150]  # Limit response length

def generate_model_response(prompt, max_tokens=20):
    """Generate response from the model with optimized parameters"""
    try:
        model = get_model()
        with model.chat_session():
            return model.generate(
                prompt,
                max_tokens=max_tokens,
                top_k=1,
                top_p=0.1,
                repeat_penalty=1.0
            )
    except Exception as e:
        logger.error(f"Model generation error: {e}")
        return RESPONSE_TEMPLATES['error']

def generate_response(prompt):
    """Main response generation function"""
    try:
        start_time = time.time()
        
        # 1. Check cache
        cached = get_cached_response(prompt)
        if cached:
            return cached

        # 2. Check quick patterns
        quick_response = get_quick_response(prompt)
        if quick_response:
            return quick_response

        # 3. Preprocess prompt
        processed_prompt = preprocess_prompt(prompt)

        # 4. Generate response
        response = generate_model_response(processed_prompt)
        
        # 5. Postprocess response
        final_response = postprocess_response(response)

        # 6. Cache if generation was fast
        elapsed = time.time() - start_time
        if elapsed < 2.0:
            _response_cache[prompt.strip().lower()] = final_response

        return final_response

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return RESPONSE_TEMPLATES['fallback']

def cleanup_old_cache():
    """Cleanup old cache entries"""
    if len(_response_cache) > 1000:
        _response_cache.clear()

# Initialize model at startup
get_model()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        response = generate_response(prompt)
        # Only print the response, no other output
        print(response)
