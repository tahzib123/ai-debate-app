from .models import User
from .openai_client import client
import json
import random

AI_PERSONAS = {
    "logic_master": {
        "username": "ProfessorLogic",
        "description": "Cuts through debates with strict logic, no emotions attached.",
        "system_prompt": "You are Logic Master, a debate assistant who only uses strict logic and avoids emotions."
    },
    "storyteller": {
        "username": "MythWeaver",
        "description": "Explains arguments with vivid analogies and stories.",
        "system_prompt": "You are Storyteller, a debate assistant who uses analogies and stories to explain points."
    },
    "critic": {
        "username": "RazorTongue",
        "description": "Challenges weak arguments with sharp critiques.",
        "system_prompt": "You are Critic, a debate assistant who aggressively challenges weak arguments."
    },
    "optimist": {
        "username": "SunnySide",
        "description": "Always highlights positives and opportunities in arguments.",
        "system_prompt": "You are Optimist, a debate assistant who highlights the positives and opportunities."
    },
    "troll": {
        "username": "ChaosGremlin",
        "description": "Provokes debates with sarcasm and playful mockery.",
        "system_prompt": "You are Troll, a provocative persona that pokes fun and challenges ideas sarcastically."
    },
    "angry_person": {
        "username": "RageMachine",
        "description": "Responds with frustration, passion, and strong emotions.",
        "system_prompt": "You are Angry Person, a persona that expresses frustration and strong emotions in debates."
    },
    "diplomat": {
        "username": "PeaceBroker",
        "description": "Strives for compromise and tactfully moderates conflicts.",
        "system_prompt": "You are Diplomat, a persona who finds compromises and moderates arguments tactfully."
    },
    "redditor": {
        "username": "HotTakeHero",
        "description": "Debates casually with memes, hot takes, and internet culture.",
        "system_prompt": "You are Redditor, a persona familiar with online debates, memes, and casual internet culture."
    },
    "expert_in_everything": {
        "username": "DrKnowItAll",
        "description": "Answers confidently on any topic with endless expertise.",
        "system_prompt": "You are Expert in Everything, a persona who answers confidently with vast knowledge across topics."
    },
    "phd_student": {
        "username": "CitationWizard",
        "description": "Backs every point with academic rigor and cautious reasoning.",
        "system_prompt": "You are PhD Student, a persona who responds with academic rigor, citations, and cautious reasoning."
    },
    "unemployed_student": {
        "username": "UnemployedAndy",
        "description": "Speaks informally, shares struggles, and questions authority.",
        "system_prompt": "You are Unemployed Student, a persona that responds informally, shares personal struggles, and questions authority."
    },
}

def choose_persona_ai(user_message, conversation_history):
    # Fallback persona selection if OpenAI is not available
    try:
        router_prompt = [
            {"role": "system", "content": "You are a routing assistant. Decide which AI persona(s) should respond based on the conversation. Available personas: logic_master, storyteller, critic, optimist, troll, angry_person, diplomat, redditor, expert_in_everything, phd_student, unemployed_student. Only 3 personas max can be selected. Only return their names as a JSON list."},
            *conversation_history,
            {"role": "user", "content": f"User just said: {user_message}\n\nWhich persona(s) should reply?"}
        ]

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=router_prompt,
            response_format={ "type": "json_schema", "json_schema": {
                "name": "persona_selection",
                "schema": {
                    "type": "object",
                    "properties": {
                        "personas": {
                            "type": "array",
                            "items": {"type": "string"},
                        }
                    },
                    "required": ["personas"]
                }
            }},
        )
        message_text = response.choices[0].message.content

        # Parse JSON safely
        try:
            parsed = json.loads(message_text)
            selected_personas = parsed.get("personas", [])
        except json.JSONDecodeError:
            # fallback if AI returns something invalid
            selected_personas = []

        return selected_personas
    except Exception as e:
        print(f"OpenAI error, using fallback persona selection: {e}")
        # Fallback: randomly select 1-3 personas
        available_personas = list(AI_PERSONAS.keys())
        num_personas = random.randint(1, 3)
        return random.sample(available_personas, min(num_personas, len(available_personas)))

def get_ai_responses(selected_personas, conversation_history):
    import concurrent.futures
    import threading
    
    def get_single_response(persona_name):
        persona = AI_PERSONAS[persona_name]
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": persona["system_prompt"]},
                    *conversation_history,
                ],
            )
            ai_message = response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error for {persona_name}, using fallback response: {e}")
            # Fallback responses based on persona type
            fallback_responses = {
                "logic_master": "Let's analyze this logically. What evidence supports this claim?",
                "storyteller": "This reminds me of an old tale where...",
                "critic": "I have to disagree with several points here.",
                "optimist": "Great point! I see lots of potential here.",
                "troll": "LOL, seriously? 🙄",
                "angry_person": "This is absolutely ridiculous!",
                "diplomat": "Perhaps we can find some middle ground here.",
                "redditor": "This. So much this. Take my upvote!",
                "expert_in_everything": "Actually, studies show that...",
                "phd_student": "According to recent literature...",
                "unemployed_student": "Honestly, I don't know much about this but..."
            }
            ai_message = fallback_responses.get(persona_name, "Interesting perspective!")
        
        return {"message": ai_message, "persona": persona}
    
    # Use ThreadPoolExecutor for concurrent API calls
    responses = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(selected_personas), 5)) as executor:
        future_to_persona = {executor.submit(get_single_response, persona): persona 
                           for persona in selected_personas}
        
        for future in concurrent.futures.as_completed(future_to_persona):
            try:
                response = future.result()
                responses.append(response)
            except Exception as exc:
                persona_name = future_to_persona[future]
                print(f'Persona {persona_name} generated an exception: {exc}')
    
    return responses


def load_personas():
    for key, persona in AI_PERSONAS.items():
        user, created = User.objects.get_or_create(
            name=persona["username"],
            defaults={
                "type": "ai",
                "agent_description": persona["description"],
            },
        )
        if created:
            print(f"✅ Created AI persona: {persona['username']}")
        else:
            print(f"⚡ Already exists: {persona['username']}")


if __name__ == "__main__":
    load_personas()