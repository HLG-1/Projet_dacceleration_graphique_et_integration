import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from src.config import DEVICE, LLM_MODEL

class LLMInference:
    def __init__(self, model_name=LLM_MODEL):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(DEVICE)

    def generate(self, prompt: str, max_tokens: int = 200):
        inputs = self.tokenizer(prompt, return_tensors="pt").to(DEVICE)
        output = self.model.generate(**inputs, max_new_tokens=max_tokens)
        return self.tokenizer.decode(output[0], skip_special_tokens=True)
