import axios from "axios";
import { CONFIG } from "../config/config";
import { InvoiceResponse } from "../types/invoice.types";
import { retryRequest } from "../utils/retryRequest";

// Extract invoice data from IMAGE

export async function extractInvoiceFromImage(
  fileBuffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    const base64File = fileBuffer.toString("base64");
    return retryRequest(
      async () => {
        const response = await axios.post(
          CONFIG.OPENROUTER_URL,
          {
            model: CONFIG.MODEL,
            messages: [
              {
                role: "system",
                content:
                  "You are an AI that extracts structured invoice data in JSON format. Return only valid JSON without markdown formatting.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType};base64,${base64File}` },
                  },
                ],
              },
            ],
            temperature: 0,
            max_tokens: 4000,
          },
          {
            headers: {
              Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://github.com/invoice-extractor",
              "X-Title": "Invoice Data Extractor",
            },
          }
        );

        const content = response.data.choices[0].message.content;
        console.log("✅ Received response from OpenRouter (Image)");

        return parseJSONResponse(content);
      },
      3,
      5000
    );
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);
    throw err;
  }
}

export async function extractInvoiceFromPDF(
  fileBuffer: Buffer,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    const base64PDF = fileBuffer.toString("base64");

   
    return retryRequest(async()=>{

        const response = await axios.post(
            CONFIG.OPENROUTER_URL,
            {
        model: "google/gemini-2.0-flash-exp:free", 
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
                        file: {
                            name: "invoice.pdf",
                            mime_type: "application/pdf",
                            data: base64PDF, 
                        },
                    },
                ],
            },
        ],
        temperature: 0,
        max_tokens: 4000,
      },
      {
          headers: {
              Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://github.com/invoice-extractor",
              "X-Title": "Invoice Data Extractor",
            },
        }
    );
    
    const content = response.data.choices[0].message.content;
    console.log("✅ Received response from OpenRouter (PDF)");
    
    return parseJSONResponse(content);
},3,5000)
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);
    throw err;
  }
}

// Extract invoice data from PDF TEXT (fallback method)
 
export async function extractInvoiceFromPDFText(
  pdfText: string,
  prompt: string
): Promise<InvoiceResponse> {
  try {
    return retryRequest(async()=>{

        const response = await axios.post(
            CONFIG.OPENROUTER_URL,
            {
                model: CONFIG.MODEL,
                messages: [
                    {
                        role: "system",
                        content:
                        "You are an AI that extracts structured invoice data in JSON format. Return only valid JSON without markdown formatting.",
                    },
                    {
                        role: "user",
                        content: `${prompt}\n\nHere is the invoice text extracted from PDF:\n\n${pdfText}`,
                    },
                ],
                temperature: 0,
                max_tokens: 4000,
            },
            {
                headers: {
                    Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/invoice-extractor",
          "X-Title": "Invoice Data Extractor",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    console.log("✅ Received response from OpenRouter (PDF Text)");
    
    return parseJSONResponse(content);
},3,5000)
} catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);
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
