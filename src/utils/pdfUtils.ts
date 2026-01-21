import { PDFDocument } from 'pdf-lib';

/**
 * Merges a signature image into a PDF at specific coordinates using WYSIWYG mapping.
 * @param pdfFile The original PDF file
 * @param signatureDataUrl The signature image as a base64 Data URL (PNG)
 * @param containerDims The dimensions of the HTML container displaying the PDF { width, height }
 * @param pageNumber 1-based page number
 */
export async function signPdf(
    pdfFile: File,
    signatureDataUrl: string,
    containerDims: { width: number; height: number },
    pageNumber: number = 1,
    yOffset: number = 0
): Promise<Uint8Array> {
    // 1. Load the PDF
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // 2. Embed the signature image
    const signatureImage = await pdfDoc.embedPng(signatureDataUrl);

    // 3. Get the page
    // Note: pdf-lib uses 0-based index
    const page = pdfDoc.getPages()[pageNumber - 1];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();

    // 4. Calculate scaling ratio
    // The container (visual) might not match the PDF aspect ratio perfectly if CSS "object-fit" is involved.
    // However, our DocumentLayer forces width='100%'.
    // We assume the visual width corresponds to the PDF width.
    const scaleFactor = pdfWidth / containerDims.width;

    // 5. Calculate Position & Size
    // The visual canvas is width=W, height=500.
    // The PDF rendered is width=W, height=H_rendered.
    // Top-Left of visual canvas corresponds to (0, -yOffset) on the rendered PDF.
    // (Note: yOffset is usually negative when scrolling down, dragging visual up)

    // We want to calculate the Y position (from bottom-left) to place the BOTTOM-LEFT of the signature image.
    // Signature Image Height (on PDF) = containerDims.height * scaleFactor
    // Visual Top (on PDF from Top) = -yOffset * scaleFactor (since yOffset is negative pixels)
    // Visual Bottom (on PDF from Top) = Visual Top + Signature Image Height
    // Y (from Bottom) = PageHeight - Visual Bottom

    const renderedHeightInPdfUnits = containerDims.height * scaleFactor;
    const scrollOffsetInPdfUnits = -yOffset * scaleFactor;

    // Y coordinate in pdf-lib is from bottom-left
    const drawY = page.getHeight() - renderedHeightInPdfUnits - scrollOffsetInPdfUnits;

    page.drawImage(signatureImage, {
        x: 0,
        y: drawY,
        width: pdfWidth,
        height: renderedHeightInPdfUnits,
    });

    // 6. Save
    const pdfBytesSaved = await pdfDoc.save();
    return pdfBytesSaved;
}
