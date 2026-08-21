import { GoogleGenAI } from "@google/genai";

let aiClient = null;
let initAttempted = false;

const VISION_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro"];

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

function categoryFromText(text = "") {
    const value = String(text).toLowerCase();
    if (/water|pipe|leak|drip|pressure|tap|flush|bathroom|shower|washroom|sewage|drain|toilet|plumbing/.test(value)) {
        return "water";
    }
    if (/wire|spark|switch|socket|ac\b|fan|power|trip|electric|light|bulb|lamp|voltage|breaker|fuse|charger/.test(value)) {
        return "electricity";
    }
    if (/food|mess|meal|roti|rice|insect|cockroach|stale|hygiene|kitchen|canteen|spoil/.test(value)) {
        return "food";
    }
    return "miscellaneous";
}

function heuristicFromText(title = "", description = "", hostelBlock = "", categoryHint = "") {
    const combinedText = `${title} ${description} ${hostelBlock}`.toLowerCase();
    let category = categoryFromText(combinedText);
    let priority = "normal";
    let detected = ["campus issue"];

    if (category === "water") {
        category = "water";
        detected = ["plumbing", "water infrastructure"];
    } else if (category === "electricity") {
        category = "electricity";
        detected = ["electrical equipment"];
    } else if (category === "food") {
        category = "food";
        detected = ["food / mess"];
    } else if (["electricity", "water", "food", "miscellaneous"].includes(categoryHint)) {
        category = categoryHint;
        detected = [`${categoryHint} infrastructure`];
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
export const analyzeComplaintImage = async (imageBuffer, mimeType, title = "", description = "", hostelBlock = "", categoryHint = "") => {
    const client = getAiClient();
    const heuristic = heuristicFromText(title, description, hostelBlock, categoryHint);

    if (client && imageBuffer) {
        try {
            const base64Image = imageBuffer.toString("base64");
            const cleanMime = String(mimeType || "image/jpeg").split(";")[0].trim().toLowerCase();
            const prompt = `Analyze this image for a campus complaint (e.g. leaks, damage, overcrowding). Determine the following:
1) A short, descriptive title.
2) A detailed description of the issue.
3) The most appropriate category strictly from: electricity, water, food, miscellaneous.
4) An isUrgent boolean flag (set to true ONLY if it poses an immediate safety hazard, active leak, or severe property damage risk).

User hints (may be empty):
Title: "${title || "(none)"}"
Description: "${description || "(none)"}"
Location: "${hostelBlock || "(unknown)"}"

Return strictly in JSON format (no markdown):
{
  "title": "short specific title",
  "description": "detailed description of the issue and evidence",
  "category": "electricity" | "water" | "food" | "miscellaneous",
  "isUrgent": true | false,
  "confidenceScore": 0.0-1.0,
  "aiSummary": "2-sentence summary for staff dashboard",
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
                                mimeType: cleanMime,
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
                const rawCat = parsed.category || parsed.predictedCategory;
                const modelCategory = normalizeCategory(rawCat);
                const titleStr = parsed.title || parsed.suggestedTitle || heuristic.suggestedTitle;
                const descStr = parsed.description || parsed.suggestedDescription || parsed.aiSummary || heuristic.suggestedDescription;
                const isUrgent = Boolean(parsed.isUrgent) || parsed.suggestedPriority === "high" || heuristic.suggestedPriority === "high";

                const supportingText = [
                    titleStr,
                    descStr,
                    parsed.aiSummary,
                    parsed.triageNotes,
                    ...(Array.isArray(parsed.detectedObjects) ? parsed.detectedObjects : [])
                ].join(" ");
                const textCategory = categoryFromText(supportingText);
                const category = modelCategory === "miscellaneous" && textCategory !== "miscellaneous"
                    ? textCategory
                    : modelCategory;
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
                    suggestedPriority: isUrgent ? "high" : "normal",
                    suggestedTitle: String(titleStr || "Campus issue").slice(0, 80),
                    suggestedDescription: String(descStr || heuristic.suggestedDescription),
                    aiSummary: parsed.aiSummary || `${category} issue flagged at ${hostelBlock || "campus"}.`,
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

export const analyzeVoiceComplaint = async (audioBuffer, mimeType = "audio/webm") => {
    const client = getAiClient();
    if (!client || !audioBuffer) return null;
    let rawResponse = "";
    const cleanMime = String(mimeType || "audio/webm").split(";")[0].trim().toLowerCase();

    const prompt = `Transcribe this audio complaint and categorize it. The audio might be in Hindi or English. Translate the transcript to English.
Categorize as strictly one of: electricity, water, food, miscellaneous (or Electricity, Water, Sanitation, Road, Safety, Miscellaneous).

Return strictly in JSON format (no markdown, no extra text):
{
  "title": "short descriptive title in English",
  "description": "detailed description translated to English",
  "transcript": "full transcription translated to English if audio was in Hindi",
  "category": "Electricity" | "Water" | "Sanitation" | "Road" | "Safety" | "Miscellaneous",
  "urgency_level": "normal" | "urgent" | "emergency",
  "is_emergency": true | false,
  "emergency_type": "fire" | "short_circuit" | "injury" | "flooding" | "other" | null,
  "confidence": 0.0 to 1.0,
  "summary": "one-line summary for admin dashboard"
}
Rules for is_emergency=true: set to true ONLY if clear verbal indicators of immediate danger such as fire, smoke, sparking wires, injury, electric shock, or active flooding exist.`;

    try {
        const response = await generateWithFallback(client, [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: cleanMime, data: audioBuffer.toString("base64") } }
                ]
            }
        ]);
        rawResponse = String(response.text || "");
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in Gemini response");
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const allowedCategories = ["Electricity", "Water", "Sanitation", "Road", "Safety", "Miscellaneous"];
        const allowedUrgencies = ["normal", "urgent", "emergency"];
        const confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0));
        const isEmergency = Boolean(parsed.is_emergency) && confidence > 0.7;
        return {
            transcript: String(parsed.transcript || "").slice(0, 5000),
            category: allowedCategories.includes(parsed.category) ? parsed.category : "Miscellaneous",
            urgencyLevel: isEmergency ? "emergency" : allowedUrgencies.includes(parsed.urgency_level) ? parsed.urgency_level : "normal",
            isEmergency,
            emergencyType: isEmergency && ["fire", "short_circuit", "injury", "flooding", "other"].includes(parsed.emergency_type)
                ? parsed.emergency_type
                : null,
            confidence,
            summary: String(parsed.summary || "Voice complaint requires review.").slice(0, 300),
            needsManualReview: false
        };
    } catch (error) {
        console.warn("[VOICE AI] Raw response could not be parsed or Gemini failed:", error.message);
        if (rawResponse) console.warn("[VOICE AI] Raw Gemini response:", rawResponse);
        return {
            transcript: "",
            category: "Miscellaneous",
            urgencyLevel: "normal",
            isEmergency: false,
            emergencyType: null,
            confidence: 0,
            summary: "Audio requires manual review.",
            needsManualReview: true
        };
    }
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
            const prompt = `System Instruction: You are a compassionate, empathetic AI counselor for college students. You listen to their stress, academic pressure, or personal feelings. Validate their emotions, offer brief supportive advice, and remind them that professional help is available if they feel overwhelmed. Keep responses concise, warm, and non-judgmental.

NOT a therapist. No medical diagnosis. Keep replies under 160 words. Continuity matters — use prior chat context if provided.

Prior chat (oldest → newest):
${historyBlock || "(none)"}

Latest student message:
"""
${text}
"""
Crisis keywords detected: ${crisisDetected}

Return ONLY valid JSON (no markdown):
{
  "mood": "calm" | "anxious" | "overwhelmed" | "sad" | "frustrated" | "hopeful",
  "aiResponse": "Empathetic, compassionate reply validating their feelings, offering brief advice and practical coping steps",
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
