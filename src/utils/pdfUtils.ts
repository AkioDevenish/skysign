import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Merges a signature image into a PDF and appends a digital certificate.
 */
export async function signPdf(
    pdfFile: File,
    signatureDataUrl: string,
    containerDims: { width: number; height: number },
    pageNumber: number = 1,
    yOffset: number = 0,
    signerName?: string,
    auditId?: string
): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const signatureImage = await pdfDoc.embedPng(signatureDataUrl);

    const page = pdfDoc.getPages()[pageNumber - 1];
    const { width: pdfWidth } = page.getSize();
    const scaleFactor = pdfWidth / containerDims.width;

    const renderedHeightInPdfUnits = containerDims.height * scaleFactor;
    const scrollOffsetInPdfUnits = -yOffset * scaleFactor;
    const drawY = page.getHeight() - renderedHeightInPdfUnits - scrollOffsetInPdfUnits;

    page.drawImage(signatureImage, {
        x: 0,
        y: drawY,
        width: pdfWidth,
        height: renderedHeightInPdfUnits,
    });

    // --- Digital Certificate Embedding ---
    if (signerName && auditId) {
        const certPage = pdfDoc.addPage([600, 400]);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        certPage.drawRectangle({
            x: 20, y: 20, width: 560, height: 360,
            borderColor: rgb(0.1, 0.1, 0.1),
            borderWidth: 2,
        });

        certPage.drawText('CERTIFICATE OF AUTHENTICITY', {
            x: 50, y: 340, size: 20, font, color: rgb(0, 0, 0),
        });

        certPage.drawText(`Document: ${pdfFile.name}`, { x: 50, y: 300, size: 12, font: regularFont });
        certPage.drawText(`Signer: ${signerName}`, { x: 50, y: 280, size: 12, font: regularFont });
        certPage.drawText(`Timestamp: ${new Date().toUTCString()}`, { x: 50, y: 260, size: 12, font: regularFont });
        certPage.drawText(`Unique Audit ID: ${auditId}`, { x: 50, y: 240, size: 10, font: regularFont, color: rgb(0.4, 0.4, 0.4) });

        certPage.drawText('This document has been electronically signed via SkySign.', {
            x: 50, y: 100, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5)
        });
    }

    const pdfBytesSaved = await pdfDoc.save();
    return pdfBytesSaved;
}
