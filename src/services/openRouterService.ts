import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { CONFIG } from "../config/config";
import { InvoiceResponse } from "../types/invoice.types";
import { retryRequest } from "../utils/retryRequest";


const openrouter = createOpenRouter({
  apiKey: CONFIG.OPENROUTER_API_KEY,
});


export async function extractInvoiceFromImage(
  fileBuffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    const base64File = fileBuffer.toString("base64");

    return retryRequest(
      async () => {
        const { text } = await generateText({
          model: openrouter(CONFIG.IMAGE_MODEL),
          system:
            "You are an AI that extracts structured invoice data in JSON format. Return only valid JSON without markdown formatting.",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image",
                  image: `data:${mimeType};base64,${base64File}`,
                },
              ],
            },
          ],
          temperature: 0,
          maxRetries: 3,
        });

        return parseJSONResponse(text);
      },
      3,
      5000
    );
  } catch (err: any) {
    console.error("OpenRouter API error:", err.message);
    throw err;
  }
}


export async function extractInvoiceFromPDF(
  fileBuffer: Buffer,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    const base64PDF = fileBuffer.toString("base64");

    return retryRequest(
      async () => {
        const { text } = await generateText({
          model: openrouter(CONFIG.IMAGE_MODEL),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${prompt}\n\nExtract data from this PDF invoice and return ONLY valid JSON (no markdown, no explanations):`,
                },
                {
                  type: "file",
                  data: base64PDF,
                  mediaType: "application/pdf",
                },
              ],
            },
          ],
          temperature: 0,
          maxRetries: 3,
        });

        console.log("✅ Received response from OpenRouter (PDF)");
        return parseJSONResponse(text);
      },
      3,
      5000
    );
  } catch (err: any) {
    console.error("OpenRouter API error:", err.message);
    throw err;
  }
}


export async function extractInvoiceFromPDFText(
  pdfText: string,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    return retryRequest(
      async () => {
        const { text } = await generateText({
          model: openrouter(CONFIG.MODEL),
          system:
            "You are an AI that extracts structured invoice data in JSON format. Return only valid JSON without markdown formatting.",
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nHere is the invoice text extracted from PDF:\n\n${pdfText}`,
            },
          ],
          temperature: 0,
          maxRetries: 3,
        });

        console.log("✅ Received response from OpenRouter (PDF Text)");
        return parseJSONResponse(text);
      },
      3,
      5000
    );
  } catch (err: any) {
    console.error("OpenRouter API error:", err.message);
    throw err;
  }
}

function parseJSONResponse(content: string): InvoiceResponse {
  try {
    let jsonString = content.trim();


    if (jsonString.startsWith("```")) {
      jsonString = jsonString
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const parsed = JSON.parse(jsonString);
    return parsed as InvoiceResponse;
  } catch (error) {
    console.error("Failed to parse JSON:", content);
    throw new Error(
      `Failed to parse JSON response: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
