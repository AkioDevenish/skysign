"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { internal } from "./_generated/api";


export const generate = action({
  args: {
    signatureId: v.id("signatures"),
    signerName: v.string(),
    signerEmail: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 2. Add Content
    // Header
    page.drawText('AUDIT TRAIL CERTIFICATE', {
      x: 50,
      y: height - 60,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('SkySign Secure Transaction', {
        x: 50,
        y: height - 85,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
    });

    // Valid Badge (Simulated)
    page.drawRectangle({
        x: width - 150,
        y: height - 80,
        width: 100,
        height: 30,
        color: rgb(0.9, 1, 0.9), // Light green
    });
    page.drawText('SIGNED', {
        x: width - 125,
        y: height - 70,
        size: 12,
        font: boldFont,
        color: rgb(0, 0.5, 0),
    });

    // Section 1: Transaction Details
    let y = height - 150;
    const drawField = (label: string, value: string) => {
        page.drawText(label, { x: 50, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(value, { x: 150, y, size: 10, font: font, color: rgb(0, 0, 0) });
        y -= 20;
    };

    page.drawText('Transaction Details', { x: 50, y: y + 10, size: 14, font: boldFont });
    y -= 20;
    drawField('Transaction ID:', args.signatureId);
    drawField('Timestamp (UTC):', args.timestamp);
    drawField('Document Status:', 'Completed');

    y -= 20; // Spacer

    // Section 2: Signer Identity
    page.drawText('Signer Identity', { x: 50, y: y + 10, size: 14, font: boldFont });
    y -= 20;
    drawField('Signer Name:', args.signerName);
    drawField('Signer Email:', args.signerEmail || 'Not verified');
    drawField('IP Address:', args.ipAddress || 'Not recorded');
    drawField('Device:', args.userAgent || 'Unknown');

    // Footer
    page.drawLine({
        start: { x: 50, y: 50 },
        end: { x: width - 50, y: 50 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
    });
    page.drawText(`Powered by SkySign | Generated at ${new Date().toISOString()}`, {
        x: 50,
        y: 35,
        size: 8,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
    });

    // 3. Serialize and Upload
    const pdfBytes = await pdfDoc.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    
    // Upload to Convex Storage
    const uploadUrl = await ctx.storage.generateUploadUrl();
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: blob,
    });
    
    if (!result.ok) {
        throw new Error(`Failed to upload audit trail: ${result.statusText}`);
    }

    const { storageId } = await result.json();

    // 4. Update the Signature record with the auditStorageId
    // TODO: Implement this internal mutation in signatures.ts
    // await ctx.runMutation(internal.signatures.updateAuditTrail, {
    //     signatureId: args.signatureId,
    //     auditStorageId: storageId,
    // });

    return storageId;
  }
});
