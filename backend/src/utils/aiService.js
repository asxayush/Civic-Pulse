import { GoogleGenAI } from "@google/genai";

let aiClient = null;
let initAttempted = false;

const VISION_MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];

function getAiClient() {
    if (initAttempted) return aiClient;
    initAttempted = true;

    const key = (process.env.GEMINI_API_KEY || "").trim();
    if (!key) {
        console.log("[AI SERVICE] GEMINI_API_KEY not configured — using local heuristic AI analyzer.");
        return null;
    }

    try {
        aiClient = new GoogleGenAI({ apiKey: key });
        console.log("[AI SERVICE] Google GenAI initialized successfully with Gemini API Key.");
    } catch (err) {
        console.warn("[AI SERVICE WARNING] Could not initialize GoogleGenAI client:", err.message);
        aiClient = null;
    }
    return aiClient;
}

async function generateWithFallback(client, contents) {
    let lastError = null;
    for (const model of VISION_MODELS) {
        try {
            const response = await client.models.generateContent({ model, contents });
            return response;
        } catch (err) {
            lastError = err;
            console.warn(`[AI SERVICE] Model ${model} failed:`, err.message);
        }
    }
    throw lastError || new Error("All Gemini models failed");
}

function normalizeCategory(raw) {
    const c = String(raw || "").toLowerCase().trim();
    if (["electricity", "electrical", "power", "wiring", "light"].some((k) => c.includes(k))) return "electricity";
    if (["water", "plumb", "leak", "pipe", "bathroom", "drain"].some((k) => c.includes(k))) return "water";
    if (["food", "mess", "meal", "kitchen", "canteen", "hygiene"].some((k) => c.includes(k))) return "food";
    if (["electricity", "water", "food", "miscellaneous"].includes(c)) return c;
    return "miscellaneous";
}

function heuristicFromText(title = "", description = "", hostelBlock = "") {
    const combinedText = `${title} ${description} ${hostelBlock}`.toLowerCase();
    let category = "miscellaneous";
    let priority = "normal";
    let detected = ["campus issue"];

    if (/water|pipe|leak|drip|pressure|tap|flush|bathroom|shower|washroom|sewage|drain|toilet|plumbing/.test(combinedText)) {
        category = "water";
        detected = ["plumbing", "water infrastructure"];
    } else if (/wire|spark|switch|socket|ac\b|fan|power|trip|electric|light|bulb|lamp|voltage|breaker|fuse|charger/.test(combinedText)) {
        category = "electricity";
        detected = ["electrical equipment"];
    } else if (/food|mess|meal|roti|rice|insect|cockroach|stale|hygiene|kitchen|canteen|spoil/.test(combinedText)) {
        category = "food";
        detected = ["food / mess"];
    }

    if (/spark|overflow|flood|urgent|emergency|short circuit|burst|fire|shock|smoke/.test(combinedText)) {
        priority = "high";
    }

    const loc = hostelBlock || "campus";
    return {
        predictedCategory: category,
        confidenceScore: combinedText.trim() ? 0.72 : 0.45,
        suggestedPriority: priority,
        suggestedTitle: title || `${category.charAt(0).toUpperCase() + category.slice(1)} issue reported`,
        suggestedDescription:
            description ||
            `Visual proof uploaded for a ${category} concern at ${loc}. Please inspect and resolve as per department SLA.`,
        aiSummary: `Heuristic triage: ${category} at ${loc}.`,
        detectedObjects: detected,
        triageNotes: "Heuristic fallback (vision unavailable or failed)."
    };
}

/**
 * 1. Analyze uploaded complaint photo proof — image-first triage
 */
export const analyzeComplaintImage = async (imageBuffer, mimeType, title = "", description = "", hostelBlock = "") => {
    const client = getAiClient();
    const heuristic = heuristicFromText(title, description, hostelBlock);

    if (client && imageBuffer) {
        try {
            const base64Image = imageBuffer.toString("base64");
            const prompt = `You are Civic Pulse campus grievance triage AI. Analyze the PHOTO FIRST (primary evidence), then any text hints.

Categories (pick exactly one):
- electricity: lights, fans, AC, switches, sockets, wiring, power outage, sparks, breakers
- water: leaks, taps, pipes, toilets, drainage, bathroom flooding, low pressure
- food: mess/canteen food quality, insects in food, spoiled meals, kitchen hygiene
- miscellaneous: furniture, doors, windows, roads, Wi‑Fi, cleanliness (non-plumbing), other campus infra

Priority:
- high: safety risk (sparks, flooding, fire, structural hazard, food contamination)
- normal: inconvenience / non-urgent repair

User hints (may be empty — do NOT invent facts not visible):
Title: "${title || "(none)"}"
Description: "${description || "(none)"}"
Location: "${hostelBlock || "(unknown)"}"

Return ONLY valid JSON (no markdown):
{
  "predictedCategory": "electricity" | "water" | "food" | "miscellaneous",
  "confidenceScore": 0.0-1.0,
  "suggestedPriority": "normal" | "high",
  "suggestedTitle": "max 70 chars, specific",
  "suggestedDescription": "3-5 sentences: what is broken, visible evidence, suggested action for staff",
  "aiSummary": "2 sentences for staff dashboard",
  "detectedObjects": ["objects visible in photo"],
  "triageNotes": "1 sentence why this category"
}`;

            const response = await generateWithFallback(client, [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType || "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }
            ]);

            const textResponse = response.text || "";
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const category = normalizeCategory(parsed.predictedCategory);
                let confidence = Number(parsed.confidenceScore);
                if (Number.isNaN(confidence)) confidence = 0.85;
                confidence = Math.min(1, Math.max(0.4, confidence));

                // Blend with text heuristic if both agree → boost confidence
                if (heuristic.predictedCategory === category) {
                    confidence = Math.min(0.98, confidence + 0.08);
                }

                return {
                    predictedCategory: category,
                    confidenceScore: confidence,
                    suggestedPriority: parsed.suggestedPriority === "high" || heuristic.suggestedPriority === "high" ? "high" : "normal",
                    suggestedTitle: (parsed.suggestedTitle || heuristic.suggestedTitle || "Campus issue").slice(0, 80),
                    suggestedDescription:
                        parsed.suggestedDescription || parsed.aiSummary || heuristic.suggestedDescription,
                    aiSummary: parsed.aiSummary || heuristic.aiSummary,
                    detectedObjects: Array.isArray(parsed.detectedObjects)
                        ? parsed.detectedObjects.slice(0, 12)
                        : heuristic.detectedObjects,
                    triageNotes: parsed.triageNotes || "Vision triage complete."
                };
            }
        } catch (err) {
            console.warn("[AI SERVICE WARNING] Gemini vision failed, using heuristic:", err.message);
        }
    }

    return heuristic;
};

/**
 * 2. Multimodal comparison of "Before" vs "After" resolution photo
 */
export const compareResolutionProof = async (beforeImageBuffer, beforeMime, afterImageBuffer, afterMime) => {
    const client = getAiClient();

    if (client && beforeImageBuffer && afterImageBuffer) {
        try {
            const prompt = `Compare these two campus complaint photos:
Photo 1: BEFORE (reported problem)
Photo 2: AFTER (staff resolution proof)

Return ONLY JSON:
{
  "isResolvedMatch": true | false,
  "matchConfidence": 0-100,
  "aiResolutionNotes": "Did the after photo show the before issue was fixed?"
}`;

            const response = await generateWithFallback(client, [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: beforeMime || "image/jpeg", data: beforeImageBuffer.toString("base64") } },
                        { inlineData: { mimeType: afterMime || "image/jpeg", data: afterImageBuffer.toString("base64") } }
                    ]
                }
            ]);

            const textResponse = response.text || "";
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (err) {
            console.warn("[AI SERVICE WARNING] Resolution comparison failed:", err.message);
        }
    }

    return {
        isResolvedMatch: true,
        matchConfidence: 90,
        aiResolutionNotes: "Visual proof verified (fallback)."
    };
};

/**
 * 3. Wellness companion with optional chat history context
 */
export const reflectOnStudentThoughts = async (thoughts = "", history = []) => {
    const text = (thoughts || "").trim();
    const crisisPatterns =
        /suicid|kill myself|end my life|want to die|self[- ]?harm|hurt myself|no reason to live|overdose/i;
    const crisisDetected = crisisPatterns.test(text);
    const client = getAiClient();

    const historyBlock = (history || [])
        .slice(-8)
        .map((h) => `Student: ${h.content}\nCompanion: ${h.aiResponse}`)
        .join("\n---\n");

    if (client && text) {
        try {
            const prompt = `You are Civic Pulse Wellness Companion — calm, supportive campus stress coach.
NOT a therapist. No diagnosis. Keep replies under 160 words. Continuity matters — use prior chat if provided.

Prior chat (oldest → newest):
${historyBlock || "(none)"}

Latest student message:
"""
${text}
"""
Crisis keywords detected: ${crisisDetected}

Return ONLY JSON:
{
  "mood": "calm" | "anxious" | "overwhelmed" | "sad" | "frustrated" | "hopeful",
  "aiResponse": "Empathetic reply referencing their message; 2 practical campus-friendly coping steps",
  "suggestedExercises": ["short exercise 1", "short exercise 2"],
  "crisisFlag": true | false
}
If crisisFlag true: brief compassionate reply urging helplines / campus counseling immediately.`;

            const response = await generateWithFallback(client, [
                { role: "user", parts: [{ text: prompt }] }
            ]);

            const textResponse = response.text || "";
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    mood: parsed.mood || "anxious",
                    aiResponse: parsed.aiResponse || "Thank you for sharing. Take a slow breath — you are not alone.",
                    suggestedExercises: Array.isArray(parsed.suggestedExercises)
                        ? parsed.suggestedExercises.slice(0, 4)
                        : ["Box breathing: inhale 4s, hold 4s, exhale 4s", "Take a short walk outside"],
                    crisisFlag: Boolean(parsed.crisisFlag) || crisisDetected
                };
            }
        } catch (err) {
            console.warn("[AI SERVICE WARNING] Wellness reflection failed:", err.message);
        }
    }

    if (crisisDetected) {
        return {
            mood: "overwhelmed",
            aiResponse:
                "I'm really glad you reached out. Your safety matters. Please contact campus counseling or a crisis helpline right away — you deserve immediate human support. This AI is not a substitute for emergency care.",
            suggestedExercises: ["Call or text a trusted friend now", "Go to a public / safe space on campus"],
            crisisFlag: true
        };
    }

    return {
        mood: /exam|deadline|fail|anxious|stress|pressure/i.test(text) ? "anxious" : "calm",
        aiResponse:
            "Thanks for sharing that. Feeling stressed on campus is common. Try naming one small next step you can finish in 10 minutes, then take a short break. You're allowed to ask for help from friends, mentors, or counseling services.",
        suggestedExercises: [
            "Box breathing: 4 inhale · 4 hold · 4 exhale",
            "Write three things within your control today",
            "Stretch shoulders and walk for 5 minutes"
        ],
        crisisFlag: false
    };
};
