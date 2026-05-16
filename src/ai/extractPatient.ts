import { GoogleGenerativeAI } from "@google/generative-ai";
import { PatientFields, PatientFieldsSchema } from "../shared/types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function extractPatientFields(file: File): Promise<PatientFields> {
    if (!API_KEY) {
        throw new Error("Missing Gemini API Key in VITE_GEMINI_API_KEY in .env file");
    }

    const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // Instruction prompt
    const prompt = `
    You are an expert clinical trial specialist and medical data extractor.
    Read this patient's medical summary PDF.
    Extract the patient's data and return it as a JSON object.
    You MUST adhere EXACTLY to this JSON structure:
    {
        "age": 0,
        "sex": "MALE or FEMALE",
        "conditions": ["string"],
        "medications": ["string"],
        "biomarkers": {"key": "value"},
        "stage": "string or null",
        "priorTreatments": ["string"]
    }`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64String,
                    mimeType: "application/pdf"
                }
            }
        ]);

        // Read Gemini's response
        const responseText = result.response.text();
        const rawObject = JSON.parse(responseText);

        // Run the AI's data through Zod Schema
        const validatedPatient = PatientFieldsSchema.parse(rawObject);

        return validatedPatient;

    } catch (error) {
        console.error("PDF Extraction Failed:", error);
        throw new Error("Failed to extract patient data from the PDF.");
    }
}
