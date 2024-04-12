from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch
from langchain.llms import HuggingFacePipeline
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

device = "cuda" if torch.cuda.is_available() else "cpu"

quantization_config = BitsAndBytesConfig(load_in_4bit=True, device_map="auto")
model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-Instruct-v0.1",
    load_in_4bit=True,
    device_map="auto",
    quantization_config=quantization_config,
)
tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1")

# Test prompt 1
vegeterian_recipe_prompt = """### Instruction: Act as a gourmet chef. 
I have a friend coming over who is a vegetarian.
I want to impress my friend with a special vegetarian dish. 
What do you recommend?

Give me two options, along with the whole recipe for each.

 ### Answer:
 """

encoded_instruction = tokenizer(
    vegeterian_recipe_prompt, return_tensors="pt", add_special_tokens=True
)

model_inputs = encoded_instruction.to(device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=1000,
    do_sample=True,
    pad_token_id=tokenizer.eos_token_id
)
decoded = tokenizer.batch_decode(generated_ids)
print(decoded[0])


text_generation_pipeline = transformers.pipeline(
    model=model,
    tokenizer=tokenizer,
    task="text-generation",
    temperature=0.2,
    repetition_penalty=1.1,
    return_full_text=True,
    max_new_tokens=1000,
)
mistral_llm = HuggingFacePipeline(pipeline=text_generation_pipeline)
prompt_template = """
### Instruction: Act as a LARGE Language Models Expert. I will ask you a QUESTION and give you an AUDIENCE PERSONA, and you will respond with an answer easily understandable by the AUDIENCE PERSONA.

### AUDIENCE PERSONA:
{audience_persona}

### QUESTION:
{question}

 ### Answer:
 """


# Input query to LLM
input_text = {
    "audience_persona": "A 5 year-old child",
    "question": "Explain how Large Language Models work.",
}

# Generate and print LLM response
response = llm_chain(input_text)


print(response_text["text"])
