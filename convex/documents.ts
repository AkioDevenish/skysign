'use node';

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const embedSignature = action({
  args: {
    requestId: v.id("signatureRequests"),
    documentStorageId: v.id("_storage"),
    signatureStorageId: v.id("_storage"),
    signerName: v.string(),
    signerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the Document PDF
    const docUrl = await ctx.storage.getUrl(args.documentStorageId);
    if (!docUrl) throw new Error("Document not found");
    const docRes = await fetch(docUrl);
    const docBuffer = await docRes.arrayBuffer();

    // 2. Fetch the Signature Image
    const sigUrl = await ctx.storage.getUrl(args.signatureStorageId);
    if (!sigUrl) throw new Error("Signature not found");
    const sigRes = await fetch(sigUrl);
    const sigBuffer = await sigRes.arrayBuffer();

    // 3. Load PDF
    const pdfDoc = await PDFDocument.load(docBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 4. Embed Signature Image
    const signatureImage = await pdfDoc.embedPng(sigBuffer);

    // 5. Place Signature on the last page of the document
    const pages = pdfDoc.getPages();
    const page = pages[pages.length - 1]; // Use last page
    
    // Draw Text at bottom left
    page.drawText(`Digitally Signed by ${args.signerName}`, {
        x: 50,
        y: 80,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    const now = new Date().toISOString();
    page.drawText(`Date: ${now} | ID: ${args.requestId.substring(0, 8)}`, {
        x: 50,
        y: 65,
        size: 8,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
    });

    // Draw Signature next to text
    page.drawImage(signatureImage, {
        x: 50,
        y: 100,
        width: 100, // Fixed small size for backend auto-placement
        height: 40,
    });

    // 6. Save and Upload
    const pdfBytes = await pdfDoc.save();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const storageId = await ctx.storage.store(blob);

    // 7. Finalize the signature process
    await ctx.runMutation(internal.signatureRequests.finalizeSignature, {
        requestId: args.requestId,
        signedStorageId: storageId,
    });

    return storageId;
  },
});
