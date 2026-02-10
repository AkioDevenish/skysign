// Contract Templates Library
// Pre-built legal document templates for common use cases

export interface ContractTemplate {
    id: string;
    name: string;
    category: 'nda' | 'contract' | 'waiver' | 'agreement' | 'consent';
    description: string;
    icon: string;
    isPro: boolean;
    fields: TemplateField[];
    content: string; // HTML content with {{placeholders}}
}

export interface TemplateField {
    id: string;
    label: string;
    type: 'text' | 'date' | 'email' | 'textarea' | 'select';
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
}

// Template content uses {{fieldId}} placeholders that get replaced with user input

export const contractTemplates: ContractTemplate[] = [
    // ========== NDA Templates ==========
    {
        id: 'nda-mutual',
        name: 'Mutual NDA',
        category: 'nda',
        description: 'A mutual non-disclosure agreement where both parties agree to protect confidential information.',
        icon: '🤝',
        isPro: false,
        fields: [
            { id: 'party1Name', label: 'First Party Name', type: 'text', placeholder: 'Your name or company', required: true },
            { id: 'party1Address', label: 'First Party Address', type: 'text', placeholder: 'Address', required: true },
            { id: 'party2Name', label: 'Second Party Name', type: 'text', placeholder: 'Other party name', required: true },
            { id: 'party2Address', label: 'Second Party Address', type: 'text', placeholder: 'Address', required: true },
            { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
            { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the purpose...', required: true },
            { id: 'duration', label: 'Agreement Duration', type: 'select', options: ['1 year', '2 years', '3 years', '5 years', 'Indefinite'], required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">MUTUAL NON-DISCLOSURE AGREEMENT</h1>
    
    <p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of <strong>{{effectiveDate}}</strong> by and between:</p>
    
    <p><strong>Party A:</strong> {{party1Name}}<br>
    Address: {{party1Address}}</p>
    
    <p><strong>Party B:</strong> {{party2Name}}<br>
    Address: {{party2Address}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">1. PURPOSE</h2>
    <p>The parties wish to explore a business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information for the following purpose:</p>
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{purpose}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">2. DEFINITION OF CONFIDENTIAL INFORMATION</h2>
    <p>"Confidential Information" means any data or information that is proprietary to the disclosing party and not generally known to the public, whether in tangible or intangible form, including but not limited to: trade secrets, technical data, business strategies, customer information, and financial information.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">3. OBLIGATIONS</h2>
    <p>Each party agrees to:</p>
    <ul>
        <li>Hold and maintain the Confidential Information in strict confidence</li>
        <li>Not disclose or publish the Confidential Information to any third party</li>
        <li>Use the Confidential Information solely for the Purpose stated above</li>
        <li>Protect the Confidential Information with at least the same degree of care used to protect its own confidential information</li>
    </ul>
    
    <h2 style="font-size: 16px; margin-top: 30px;">4. TERM</h2>
    <p>This Agreement shall remain in effect for <strong>{{duration}}</strong> from the Effective Date, unless terminated earlier by either party with 30 days written notice.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">5. RETURN OF MATERIALS</h2>
    <p>Upon termination of this Agreement or upon request, each party shall promptly return or destroy all Confidential Information received from the other party.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">6. MISCELLANEOUS</h2>
    <p>This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof. This Agreement may not be amended except by a writing signed by both parties.</p>
    
    <div style="margin-top: 60px;">
        <div style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
                <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>{{party1Name}}</strong></p>
                <p>Signature: _____________________</p>
                <p>Date: _____________________</p>
            </div>
            <div style="width: 45%;">
                <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>{{party2Name}}</strong></p>
                <p>Signature: _____________________</p>
                <p>Date: _____________________</p>
            </div>
        </div>
    </div>
</div>
`
    },

    {
        id: 'nda-unilateral',
        name: 'One-Way NDA',
        category: 'nda',
        description: 'A one-way NDA where only one party discloses confidential information.',
        icon: '🔒',
        isPro: false,
        fields: [
            { id: 'disclosingParty', label: 'Disclosing Party', type: 'text', placeholder: 'Party sharing information', required: true },
            { id: 'receivingParty', label: 'Receiving Party', type: 'text', placeholder: 'Party receiving information', required: true },
            { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
            { id: 'confidentialMatter', label: 'Subject Matter', type: 'textarea', placeholder: 'Describe what information is confidential...', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">UNILATERAL NON-DISCLOSURE AGREEMENT</h1>
    
    <p>This Non-Disclosure Agreement is effective as of <strong>{{effectiveDate}}</strong>.</p>
    
    <p><strong>Disclosing Party:</strong> {{disclosingParty}}</p>
    <p><strong>Receiving Party:</strong> {{receivingParty}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">RECITALS</h2>
    <p>The Disclosing Party possesses certain confidential and proprietary information relating to:</p>
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{confidentialMatter}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">AGREEMENT</h2>
    <p>The Receiving Party agrees that:</p>
    <ol>
        <li>All information disclosed shall be held in strict confidence</li>
        <li>The information shall only be used for legitimate business purposes</li>
        <li>No copies shall be made without written consent</li>
        <li>This obligation continues for 3 years after disclosure</li>
    </ol>
    
    <div style="margin-top: 60px;">
        <p><strong>RECEIVING PARTY:</strong></p>
        <p>Signature: _____________________</p>
        <p>Name: {{receivingParty}}</p>
        <p>Date: _____________________</p>
    </div>
</div>
`
    },

    // ========== Contract Templates ==========
    {
        id: 'freelance-contract',
        name: 'Freelance Service Agreement',
        category: 'contract',
        description: 'A comprehensive contract for freelance or consulting services.',
        icon: '💼',
        isPro: false,
        fields: [
            { id: 'clientName', label: 'Client Name', type: 'text', required: true },
            { id: 'clientEmail', label: 'Client Email', type: 'email', required: true },
            { id: 'freelancerName', label: 'Freelancer/Contractor Name', type: 'text', required: true },
            { id: 'projectDescription', label: 'Project Description', type: 'textarea', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
            { id: 'endDate', label: 'End Date', type: 'date', required: true },
            { id: 'totalFee', label: 'Total Fee ($)', type: 'text', placeholder: '5,000', required: true },
            { id: 'paymentTerms', label: 'Payment Terms', type: 'select', options: ['50% upfront, 50% on completion', 'Monthly payments', 'On completion', 'Net 30'], required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">FREELANCE SERVICE AGREEMENT</h1>
    
    <p>This Service Agreement ("Agreement") is made between:</p>
    
    <p><strong>Client:</strong> {{clientName}} ({{clientEmail}})</p>
    <p><strong>Contractor:</strong> {{freelancerName}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">1. SERVICES</h2>
    <p>The Contractor agrees to provide the following services:</p>
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{projectDescription}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">2. TERM</h2>
    <p>This Agreement begins on <strong>{{startDate}}</strong> and ends on <strong>{{endDate}}</strong>.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">3. COMPENSATION</h2>
    <p>The Client agrees to pay the Contractor <strong>$\{{totalFee}}</strong> for the services.</p>
    <p>Payment Terms: <strong>{{paymentTerms}}</strong></p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">4. INDEPENDENT CONTRACTOR</h2>
    <p>The Contractor is an independent contractor and not an employee of the Client.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">5. INTELLECTUAL PROPERTY</h2>
    <p>Upon full payment, all work product created under this Agreement shall be owned by the Client.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">6. CONFIDENTIALITY</h2>
    <p>Both parties agree to keep confidential any proprietary information received during this engagement.</p>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between;">
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>CLIENT</strong></p>
            <p>Name: {{clientName}}</p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>CONTRACTOR</strong></p>
            <p>Name: {{freelancerName}}</p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
    </div>
</div>
`
    },

    {
        id: 'simple-sales-contract',
        name: 'Simple Sales Contract',
        category: 'contract',
        description: 'A basic contract for the sale of goods or products.',
        icon: '🛒',
        isPro: false,
        fields: [
            { id: 'sellerName', label: 'Seller Name', type: 'text', required: true },
            { id: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
            { id: 'itemDescription', label: 'Item Description', type: 'textarea', required: true },
            { id: 'price', label: 'Price ($)', type: 'text', required: true },
            { id: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">SALES CONTRACT</h1>
    
    <p><strong>Seller:</strong> {{sellerName}}</p>
    <p><strong>Buyer:</strong> {{buyerName}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">ITEM(S) FOR SALE</h2>
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{itemDescription}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">TERMS</h2>
    <p><strong>Purchase Price:</strong> $\{{price}}</p>
    <p><strong>Delivery Date:</strong> {{deliveryDate}}</p>
    
    <p>The Seller agrees to sell and the Buyer agrees to purchase the above item(s) for the stated price.</p>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between;">
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>SELLER</strong></p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>BUYER</strong></p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
    </div>
</div>
`
    },

    // ========== Waiver Templates ==========
    {
        id: 'liability-waiver',
        name: 'Liability Waiver',
        category: 'waiver',
        description: 'A general liability waiver for activities, events, or services.',
        icon: '⚠️',
        isPro: false,
        fields: [
            { id: 'organizationName', label: 'Organization/Business Name', type: 'text', required: true },
            { id: 'activityName', label: 'Activity/Event Name', type: 'text', required: true },
            { id: 'activityDescription', label: 'Activity Description & Risks', type: 'textarea', required: true },
            { id: 'participantName', label: 'Participant Name', type: 'text', required: true },
            { id: 'emergencyContact', label: 'Emergency Contact', type: 'text', required: true },
            { id: 'emergencyPhone', label: 'Emergency Phone', type: 'text', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">LIABILITY WAIVER AND RELEASE</h1>
    
    <p style="text-align: center; margin-bottom: 30px;"><strong>{{organizationName}}</strong><br>{{activityName}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">ASSUMPTION OF RISK</h2>
    <p>I, <strong>{{participantName}}</strong>, understand that participation in the following activity involves inherent risks:</p>
    <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">{{activityDescription}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">WAIVER AND RELEASE</h2>
    <p>In consideration of being permitted to participate, I hereby:</p>
    <ol>
        <li>Assume all risks associated with this activity</li>
        <li>Release {{organizationName}} from any liability for injury or damages</li>
        <li>Agree to indemnify and hold harmless the organization and its staff</li>
        <li>Consent to emergency medical treatment if necessary</li>
    </ol>
    
    <h2 style="font-size: 16px; margin-top: 30px;">EMERGENCY CONTACT</h2>
    <p><strong>Name:</strong> {{emergencyContact}}</p>
    <p><strong>Phone:</strong> {{emergencyPhone}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">ACKNOWLEDGMENT</h2>
    <p>I have read this waiver, understand its terms, and sign it voluntarily.</p>
    
    <div style="margin-top: 40px;">
        <p><strong>PARTICIPANT:</strong></p>
        <p>Name: {{participantName}}</p>
        <p>Signature: _____________________</p>
        <p>Date: _____________________</p>
    </div>
</div>
`
    },

    {
        id: 'photo-release',
        name: 'Photo/Video Release',
        category: 'consent',
        description: 'Permission to use photos or videos of an individual.',
        icon: '📸',
        isPro: false,
        fields: [
            { id: 'subjectName', label: 'Subject Name', type: 'text', required: true },
            { id: 'companyName', label: 'Company/Photographer Name', type: 'text', required: true },
            { id: 'eventDescription', label: 'Event/Occasion', type: 'text', required: true },
            { id: 'usagePurpose', label: 'Usage Purpose', type: 'select', options: ['Marketing & Advertising', 'Website & Social Media', 'Print Publications', 'All purposes'], required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">PHOTO/VIDEO RELEASE FORM</h1>
    
    <p>I, <strong>{{subjectName}}</strong>, hereby grant permission to <strong>{{companyName}}</strong> to use photographs, video recordings, and/or audio recordings of me taken during:</p>
    
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;"><strong>{{eventDescription}}</strong></p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">GRANT OF RIGHTS</h2>
    <p>I grant permission for these images to be used for: <strong>{{usagePurpose}}</strong></p>
    
    <p>I understand that:</p>
    <ul>
        <li>The images may be edited, copied, or distributed</li>
        <li>I will not receive compensation for this use</li>
        <li>I waive any right to inspect or approve the finished product</li>
        <li>This release is permanent and worldwide</li>
    </ul>
    
    <h2 style="font-size: 16px; margin-top: 30px;">AGREEMENT</h2>
    <p>I have read this release and understand its contents. I am signing voluntarily.</p>
    
    <div style="margin-top: 40px;">
        <p>Name: {{subjectName}}</p>
        <p>Signature: _____________________</p>
        <p>Date: _____________________</p>
    </div>
</div>
`
    },

    {
        id: 'employment-offer',
        name: 'Employment Offer Letter',
        category: 'agreement',
        description: 'A formal offer letter for new employees.',
        icon: '👔',
        isPro: true,
        fields: [
            { id: 'companyName', label: 'Company Name', type: 'text', required: true },
            { id: 'candidateName', label: 'Candidate Name', type: 'text', required: true },
            { id: 'jobTitle', label: 'Job Title', type: 'text', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
            { id: 'salary', label: 'Annual Salary ($)', type: 'text', required: true },
            { id: 'manager', label: 'Reporting Manager', type: 'text', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <div style="text-align: right; margin-bottom: 40px;">
        <strong>{{companyName}}</strong><br>
        Date: _______________
    </div>
    
    <p>Dear {{candidateName}},</p>
    
    <p>We are pleased to offer you the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">TERMS OF EMPLOYMENT</h2>
    <ul>
        <li><strong>Start Date:</strong> {{startDate}}</li>
        <li><strong>Position:</strong> {{jobTitle}}</li>
        <li><strong>Salary:</strong> $\{{salary}} per year</li>
        <li><strong>Reports To:</strong> {{manager}}</li>
    </ul>
    
    <p>This offer is contingent upon successful completion of our background check process. Please sign below to accept this offer.</p>
    
    <p>We look forward to welcoming you to the team!</p>
    
    <p>Sincerely,<br>{{companyName}}</p>
    
    <div style="margin-top: 60px; border-top: 1px solid #000; padding-top: 20px;">
        <p><strong>ACCEPTANCE</strong></p>
        <p>I accept this offer of employment.</p>
        <p>Name: {{candidateName}}</p>
        <p>Signature: _____________________</p>
        <p>Date: _____________________</p>
    </div>
</div>
`
    },

    {
        id: 'consulting-agreement',
        name: 'Consulting Agreement',
        category: 'contract',
        description: 'A professional consulting services agreement.',
        icon: '📊',
        isPro: true,
        fields: [
            { id: 'clientCompany', label: 'Client Company', type: 'text', required: true },
            { id: 'consultantName', label: 'Consultant Name', type: 'text', required: true },
            { id: 'scope', label: 'Scope of Services', type: 'textarea', required: true },
            { id: 'hourlyRate', label: 'Hourly Rate ($)', type: 'text', required: true },
            { id: 'estimatedHours', label: 'Estimated Hours', type: 'text', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
    <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">CONSULTING AGREEMENT</h1>
    
    <p>This Consulting Agreement is entered into as of <strong>{{startDate}}</strong>.</p>
    
    <p><strong>Client:</strong> {{clientCompany}}<br>
    <strong>Consultant:</strong> {{consultantName}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">1. SCOPE OF SERVICES</h2>
    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">{{scope}}</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">2. COMPENSATION</h2>
    <p>Rate: <strong>$\{{hourlyRate}}/hour</strong><br>
    Estimated Hours: <strong>{{estimatedHours}}</strong></p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">3. RELATIONSHIP</h2>
    <p>Consultant is an independent contractor and not an employee.</p>
    
    <h2 style="font-size: 16px; margin-top: 30px;">4. CONFIDENTIALITY</h2>
    <p>Consultant agrees to maintain confidentiality of all proprietary information.</p>
    
    <div style="margin-top: 60px; display: flex; justify-content: space-between;">
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>CLIENT</strong></p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
        <div style="width: 45%;">
            <p style="border-top: 1px solid #000; padding-top: 10px;"><strong>CONSULTANT</strong></p>
            <p>Signature: _____________________</p>
            <p>Date: _____________________</p>
        </div>
    </div>
</div>
`
    },
];

// Helper functions
export const getTemplatesByCategory = (category: ContractTemplate['category']) => 
    contractTemplates.filter(t => t.category === category);

export const getFreeTemplates = () => 
    contractTemplates.filter(t => !t.isPro);

export const getProTemplates = () => 
    contractTemplates.filter(t => t.isPro);

export const getTemplateById = (id: string) => 
    contractTemplates.find(t => t.id === id);

export const categories = [
    { id: 'nda', name: 'NDAs', icon: '🔒', description: 'Non-Disclosure Agreements' },
    { id: 'contract', name: 'Contracts', icon: '📝', description: 'Service & Sales Contracts' },
    { id: 'waiver', name: 'Waivers', icon: '⚠️', description: 'Liability & Release Forms' },
    { id: 'agreement', name: 'Agreements', icon: '🤝', description: 'Employment & Business' },
    { id: 'consent', name: 'Consent Forms', icon: '✅', description: 'Permissions & Releases' },
];
