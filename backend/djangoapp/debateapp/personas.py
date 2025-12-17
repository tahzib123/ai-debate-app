from .models import User
from .openai_client import client
import json

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

def get_ai_responses(selected_personas, conversation_history):
    responses = []

    for persona_name in selected_personas:
        persona = AI_PERSONAS[persona_name]

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": persona["system_prompt"]},
                *conversation_history,
            ],
        )

        responses.append({"message": response.choices[0].message.content, "persona": persona})

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