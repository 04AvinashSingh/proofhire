import html
import re

# Common prompt injection, jailbreak, and delimiter override signatures
INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directions|prompts|commands)",
    r"(?i)disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|directions|prompts|commands)",
    r"(?i)forget\s+(all\s+)?(previous|prior|above)\s+(instructions|directions|prompts|commands)",
    r"(?i)(system\s+prompt|initial\s+prompt|prompt\s+template)\s*(reveal|leak|print|show|repeat)",
    r"(?i)(print|show|repeat|display|output)\s+(the\s+)?(system|hidden|internal)\s+(prompt|instructions)",
    r"(?i)you\s+are\s+now\s+(in\s+developer\s+mode|dan|an\s+unrestricted\s+ai|jailbroken)",
    r"(?i)override\s+(the\s+)?system\s+(prompt|directive|rule|instruction)",
    r"(?i)bypass\s+(all\s+)?(safety|security)\s+(guidelines|filters|checks)",
    r"(?i)always\s+(output|say|return)\s+(supported|100%|hire)",
    r"(?i)(===|---|###)\s*(SYSTEM|ADMIN|NEW INSTRUCTION|OVERRIDE)",
    r"(?i)(system|evaluator|admin)\s*:\s*(you must|please output|assign score|mark as supported)",
    r"(?i)base64:\s*[A-Za-z0-9+/=]{20,}",
]


def sanitize_for_prompt(text: str, max_chars: int = 10000) -> str:
    """
    Sanitizes untrusted candidate evidence before injecting into an LLM prompt.
    1. Truncates to max_chars to prevent context-window exhaustion DOS attacks.
    2. HTML-escapes raw XML angle brackets to prevent closing prompt demarcation tags.
    3. Normalizes whitespace.
    """
    if not text:
        return ""

    truncated = text[:max_chars].strip()

    # Neutralize fake prompt markers and delimiters before escaping
    cleaned = re.sub(r"</?(system|user|assistant|human|ai)>", "[redacted-tag]", truncated, flags=re.IGNORECASE)
    cleaned = re.sub(r"```+(system|admin|override)", "```[redacted]", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"(={3,}|-{3,}|#{3,})\s*(SYSTEM|ADMIN|PROMPT)", "[redacted-delimiter]", cleaned, flags=re.IGNORECASE)

    # Escape XML/HTML special characters so candidates cannot break out of <untrusted_candidate_evidence>
    escaped = html.escape(cleaned, quote=False)

    return escaped


def check_prompt_injection(text: str) -> tuple[bool, str]:
    """
    Checks if text contains high-confidence prompt injection or jailbreak phrases.
    Returns (is_suspicious, reason).
    """
    if not text:
        return False, ""

    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, text)
        if match:
            return True, f"Suspicious instruction override pattern detected: '{match.group(0)}'"

    return False, ""
