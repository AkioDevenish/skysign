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
    const sigDims = signatureImage.scale(0.5); // Check scale

    // 5. Append a Signature Page (Temporary solution until Field Placement is ready)
    // We add a new page at the end
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Draw Text
    page.drawText(`Digitally Signed by ${args.signerName} (${args.signerEmail})`, {
        x: 50,
        y: height - 100,
        size: 18,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    const now = new Date().toISOString();
    page.drawText(`Date: ${now}`, {
        x: 50,
        y: height - 125,
        size: 12,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
    });

    // Draw Signature
    page.drawImage(signatureImage, {
        x: 50,
        y: height - 250,
        width: sigDims.width,
        height: sigDims.height,
    });

    // 6. Save and Upload
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const storageId = await ctx.storage.store(blob);

    // 7. Finalize the signature process
    await ctx.runMutation(internal.signatureRequests.finalizeSignature, {
        requestId: args.requestId,
        signedStorageId: storageId,
    });

    return storageId;
  },
});
