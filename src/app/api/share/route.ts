import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, documentName, pdfData, type } = body;

        if (type === 'email') {
            console.log(`[SHARE] Sending email to ${email} for document: ${documentName}`);
            // console.log(`[SHARE] PDF Data (base64) length: ${pdfData.length}`);

            // In a real implementation:
            // const resend = new Resend(process.env.RESEND_API_KEY);
            // await resend.emails.send({
            //     from: 'SkySign <no-reply@skysign.io>',
            //     to: email,
            //     subject: `Signed Document: ${documentName}`,
            //     text: `Please find the signed document attached.`,
            //     attachments: [{
            //         filename: documentName,
            //         content: pdfData,
            //     }]
            // });

            // Simulate processing time
            await new Promise(r => setTimeout(r, 1000));

            return NextResponse.json({ success: true, message: 'Email sent' });
        }

        return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    } catch (error) {
        console.error('Share API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
