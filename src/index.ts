import {
  readInvoiceFileAsBase64,
  getMimeType,
  validateFileType,
  extractTextFromPDF,
  isPDF,
} from "./utils/fileReader";
import { buildInvoicePrompt } from "./utils/promptBuilder";
import {
  extractInvoiceFromImage,
  extractInvoiceFromPDFText,
  extractInvoiceFromPDF,
} from "./services/openRouterService";
import { InvoiceValidator } from "./utils/invoiceValidator";
import * as fs from "fs";
import * as path from "path";
import { InvoiceResponse } from "./types/invoice.types";

async function main() {
  try {
    console.log("🚀 Invoice Data Extractor - AUTO PDF PROCESSING");
    console.log("=".repeat(50));

    const args = process.argv.slice(2);
    const inputPath = args[0]
      ? path.resolve(args[0])
      : path.resolve(__dirname, "../samples/invoice_3.jpg");
    console.log(`\n📂 Processing file: ${inputPath}`);

  
    validateFileType(inputPath);

    let extractedData: InvoiceResponse;
    const prompt = buildInvoicePrompt();

    if (isPDF(inputPath)) {
      console.log("\n📄 Processing PDF file...");

      const fileBuffer = fs.readFileSync(inputPath);

  
      
      try {
        const pdfText = await extractTextFromPDF(fileBuffer);
        console.log(`✅ Text-based PDF detected (${pdfText.length} chars)`);
        console.log("🤖 Sending text to OpenRouter API...");
        extractedData = await extractInvoiceFromPDFText(pdfText, prompt);
      } catch (textError) {
        
        console.log(
          "📄 Could not extract text, sending PDF directly to Gemini..."
        );
        extractedData = await extractInvoiceFromPDF(fileBuffer, prompt);
      }
    } else {
      // Process images normally
      console.log("\n🖼️ Processing Image file...");
      console.log("🤖 Sending to OpenRouter API...");

      const fileBase64 = readInvoiceFileAsBase64(inputPath);
      const mimeType = getMimeType(inputPath);
      const base64Data = fileBase64.split(",")[1];
      const fileBuffer = Buffer.from(base64Data, "base64");

      extractedData = await extractInvoiceFromImage(
        fileBuffer,
        mimeType,
        prompt
      );
    }

  
    console.log("\n🔍 Validating extracted data...");
    const isValid = InvoiceValidator(extractedData);

    if (!isValid) {
      console.warn("⚠️ Validation warnings");
    } else {
      console.log("✅ Data validation passed");
    }

    console.log("\n📊 EXTRACTED INVOICE DATA:");
    console.log("=".repeat(50));
    console.log(`📄 Invoice Number: ${extractedData.invoice_number}`);
   

    // Save output
    const timestamp = Date.now();
    const invoiceNumber = extractedData.invoice_number || "unknown";
    const outputPath = path.resolve(
      __dirname,
      `../output/invoice-${invoiceNumber}-${timestamp}.json`
    );

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
    console.log(`\n💾 Output saved to: ${outputPath}`);
    console.log("\n✅ INVOICE EXTRACTED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
