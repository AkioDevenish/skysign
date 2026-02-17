// Contract Templates Library
// Professional legal document templates for various industries (Triple-A Standard)

export interface ContractTemplate {
    id: string;
    name: string;
    category: 'real-estate' | 'tech' | 'finance' | 'legal' | 'hr';
    description: string;
    icon: string;
    isPro: boolean;
    fields: TemplateField[];
    content: string; // HTML content with {{placeholders}}
}

export interface TemplateField {
    id: string;
    label: string;
    type: 'text' | 'date' | 'email' | 'textarea' | 'select' | 'currency';
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
}

export const categories = [
    { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Leases & Purchase Agreements' },
    { id: 'tech', name: 'Technology', icon: '💻', description: 'SaaS, IP & Development' },
    { id: 'finance', name: 'Finance', icon: '💰', description: 'Loans & Investments' },
    { id: 'legal', name: 'Legal & Corporate', icon: '⚖️', description: 'NDAs & Resolutions' },
    { id: 'hr', name: 'Human Resources', icon: '👥', description: 'Employment & Contractors' },
];

export const contractTemplates: ContractTemplate[] = [
    // ========== Real Estate ==========
    {
        id: 'residential-lease',
        name: 'Residential Lease Agreement',
        category: 'real-estate',
        description: 'A comprehensive lease agreement for residential property rentals.',
        icon: '🏠',
        isPro: false,
        fields: [
            { id: 'landlordName', label: 'Landlord Name', type: 'text', required: true },
            { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
            { id: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
            { id: 'leaseTerm', label: 'Lease Term (Months)', type: 'select', options: ['6 Months', '12 Months', '24 Months'], required: true },
            { id: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
            { id: 'rentAmount', label: 'Monthly Rent ($)', type: 'currency', required: true },
            { id: 'securityDeposit', label: 'Security Deposit ($)', type: 'currency', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">Residential Lease Agreement</h1>
    
    <p>This Residential Lease Agreement (the "Agreement") is made and entered into on this <strong>{{startDate}}</strong> (the "Effective Date") by and between:</p>
    
    <p><strong>LANDLORD:</strong> {{landlordName}} ("Landlord")<br>
    <strong>TENANT:</strong> {{tenantName}} ("Tenant")</p>
    
    <p>The Landlord and Tenant are collectively referred to in this Agreement as the "Parties."</p>
    
    <h3 style="text-transform: uppercase; font-size: 12pt; margin-top: 18px;">1. PROPERTY</h3>
    <p>Landlord hereby leases to Tenant and Tenant accepts in its present condition the house or apartment located at:</p>
    <p style="background: #f0f0f0; padding: 8px; border: 1px solid #ccc;">{{propertyAddress}}</p>
    <p>(the "Premises").</p>
    
    <h3 style="text-transform: uppercase; font-size: 12pt; margin-top: 18px;">2. TERM</h3>
    <p>The term of this Lease shall be for <strong>{{leaseTerm}}</strong> beginning on <strong>{{startDate}}</strong> and ending on the date derived specifically from the start date and duration.</p>
    
    <h3 style="text-transform: uppercase; font-size: 12pt; margin-top: 18px;">3. RENT AND PAYMENTS</h3>
    <p><strong>Monthly Rent:</strong> Tenant agrees to pay Landlord rent in the amount of <strong>\${{rentAmount}}</strong> per month, payable in advance on the first day of each calendar month.</p>
    <p><strong>Security Deposit:</strong> Upon signing this Agreement, Tenant shall pay Landlord a security deposit of <strong>\${{securityDeposit}}</strong> to be held for the duration of the term as security for the performance of Tenant's obligations.</p>
    
    <h3 style="text-transform: uppercase; font-size: 12pt; margin-top: 18px;">4. USE OF PREMISES</h3>
    <p>The Premises shall be used and occupied by Tenant and Tenant's immediate family exclusively as a private single-family residence. No part of the Premises shall be used at any time during the term of this Lease by Tenant for the purpose of carrying on any business, profession, or trade of any kind.</p>
    
    <h3 style="text-transform: uppercase; font-size: 12pt; margin-top: 18px;">5. GOVERNING LAW</h3>
    <p>This Agreement shall be governed, construed, and enforced in accordance with the laws of the jurisdiction in which the Property is located.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>LANDLORD</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>TENANT</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
            </tr>
        </table>
    </div>
</div>
`
    },
    {
        id: 'commercial-lease',
        name: 'Commercial Lease Agreement',
        category: 'real-estate',
        description: 'Lease agreement for commercial property office or retail space.',
        icon: '🏢',
        isPro: true,
        fields: [
            { id: 'landlordName', label: 'Landlord Name', type: 'text', required: true },
            { id: 'tenantName', label: 'Tenant Name', type: 'text', required: true },
            { id: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
            { id: 'leaseTerm', label: 'Lease Term (Years)', type: 'select', options: ['1 Year', '3 Years', '5 Years', '10 Years'], required: true },
            { id: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
            { id: 'rentAmount', label: 'Monthly Rent ($)', type: 'currency', required: true },
            { id: 'depositAmount', label: 'Security Deposit ($)', type: 'currency', required: true },
            { id: 'useOfPremises', label: 'Permitted Use', type: 'text', placeholder: 'e.g., General Office Use', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">COMMERCIAL LEASE AGREEMENT</h1>
    
    <p>This Commercial Lease Agreement (the "Lease") is made and effective as of <strong>{{startDate}}</strong>, by and between <strong>{{landlordName}}</strong> ("Landlord") and <strong>{{tenantName}}</strong> ("Tenant").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. PREMISES</h3>
    <p>Landlord hereby leases to Tenant and Tenant accepts the premises located at <strong>{{propertyAddress}}</strong> (the "Premises").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. TERM</h3>
    <p>The term of this Lease shall be for a period of <strong>{{leaseTerm}}</strong> commencing on {{startDate}}.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. RENT</h3>
    <p>Tenant shall pay to Landlord as Base Rent the sum of <strong>\${{rentAmount}}</strong> per month, due on the first day of each calendar month.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. SECURITY DEPOSIT</h3>
    <p>Tenant shall deposit with Landlord the sum of <strong>\${{depositAmount}}</strong> as security for the performance of Tenant's obligations here under.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">5. USE</h3>
    <p>The Premises shall be used for the following purpose only: <strong>{{useOfPremises}}</strong>.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">6. INSURANCE</h3>
    <p>Tenant shall keep the Premises insured against loss or damage by fire and other casualties.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>LANDLORD</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>TENANT</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
            </tr>
        </table>
    </div>
</div>`
    },

    // ========== Technology ==========
    {
        id: 'saas-agreement',
        name: 'SaaS Agreement (B2B)',
        category: 'tech',
        description: 'Standard B2B Software-as-a-Service agreement tailored for enterprise sales.',
        icon: '💻',
        isPro: true,
        fields: [
            { id: 'providerName', label: 'Service Provider Name', type: 'text', required: true },
            { id: 'customerName', label: 'Customer Name', type: 'text', required: true },
            { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
            { id: 'softwareName', label: 'Software/Platform Name', type: 'text', required: true },
            { id: 'subscriptionFee', label: 'Annual Subscription Fee ($)', type: 'currency', required: true },
            { id: 'uptimeSLA', label: 'Uptime SLA (%)', type: 'text', placeholder: '99.9%', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 12px;">Software as a Service (SaaS) Agreement</h1>
    
    <p style="margin-bottom: 24px;">This SaaS Agreement (the "Agreement") is entered into as of <strong>{{effectiveDate}}</strong> (the "Effective Date") by and between <strong>{{providerName}}</strong> ("Provider") and <strong>{{customerName}}</strong> ("Customer").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. DEFINITIONS</h3>
    <p>"Service" means the <strong>{{softwareName}}</strong> platform provided by Provider.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. ACCESS AND USE</h3>
    <p>Subject to payment of all applicable fees, Provider grants Customer a limited, non-exclusive, non-transferable right to access and use the Service for its internal business purposes during the Subscription Term.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. SERVICE LEVELS</h3>
    <p>Provider shall use commercially reasonable efforts to make the Service available 24 hours a day, 7 days a week, with a monthly uptime percentage of at least <strong>{{uptimeSLA}}</strong>, excluding scheduled maintenance.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. FEES AND PAYMENT</h3>
    <p>Customer shall pay Provider the annual subscription fee of <strong>\${{subscriptionFee}}</strong>. All fees are non-refundable and exclusive of applicable taxes.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">5. CONFIDENTIALITY</h3>
    <p>Each party shall retain in confidence all information disclosed by the other party pursuant to this Agreement which is either designated as proprietary and/or confidential, or by the nature of the circumstances surrounding disclosure, should reasonably be understood to be confidential.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">6. LIMITATION OF LIABILITY</h3>
    <p>EXCEPT FOR INDEMNIFICATION OBLIGATIONS OR BREACH OF CONFIDENTIALITY, NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>{{providerName}}</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>By (Signature)</p>
                    <p>Name: _________________</p>
                    <p>Title: _________________</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>{{customerName}}</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>By (Signature)</p>
                    <p>Name: _________________</p>
                    <p>Title: _________________</p>
                </td>
            </tr>
        </table>
    </div>
</div>
`
    },
    {
        id: 'software-dev-agreement',
        name: 'Software Development Agreement',
        category: 'tech',
        description: 'Contract for custom software development services.',
        icon: '💻',
        isPro: false,
        fields: [
            { id: 'clientName', label: 'Client Name', type: 'text', required: true },
            { id: 'developerName', label: 'Developer Name', type: 'text', required: true },
            { id: 'projectDesc', label: 'Project Description', type: 'textarea', required: true },
            { id: 'totalCost', label: 'Total Project Cost ($)', type: 'currency', required: true },
            { id: 'deadline', label: 'Delivery Deadline', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">SOFTWARE DEVELOPMENT AGREEMENT</h1>
    
    <p>This Software Development Agreement (the "Agreement") is entered into between <strong>{{clientName}}</strong> ("Client") and <strong>{{developerName}}</strong> ("Developer").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. SERVICES</h3>
    <p>Developer agrees to perform the following services (the "Services"):</p>
    <p style="background: #f0f0f0; padding: 10px;">{{projectDesc}}</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. FEES AND PAYMENT</h3>
    <p>Client agrees to pay Developer a total fee of <strong>\${{totalCost}}</strong> for the Services. Payment shall be made according to the schedule set forth in Exhibit A.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. DELIVERY</h3>
    <p>Developer shall deliver the completed Software by <strong>{{deadline}}</strong>.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. INTELLECTUAL PROPERTY</h3>
    <p>Upon full payment, Developer assigns to Client all right, title, and interest in the Software.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>CLIENT</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>DEVELOPER</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
            </tr>
        </table>
    </div>
</div>`
    },

    // ========== Finance ==========
    {
        id: 'promissory-note',
        name: 'Secured Promissory Note',
        category: 'finance',
        description: 'A formal legal instrument acknowledging a debt and promise to repay.',
        icon: '💰',
        isPro: true,
        fields: [
            { id: 'borrowerName', label: 'Borrower Name/Entity', type: 'text', required: true },
            { id: 'lenderName', label: 'Lender Name/Entity', type: 'text', required: true },
            { id: 'principalAmount', label: 'Principal Amount ($)', type: 'currency', required: true },
            { id: 'interestRate', label: 'Interest Rate (%)', type: 'text', placeholder: '5.0%', required: true },
            { id: 'maturityDate', label: 'Maturity Date', type: 'date', required: true },
            { id: 'collateral', label: 'Collateral Description', type: 'textarea', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">SECURED PROMISSORY NOTE</h1>
    
    <div style="text-align: right; margin-bottom: 20px;">
        <p><strong>Amount:</strong> \${{principalAmount}}<br>
        <strong>Date:</strong> {{maturityDate}}</p>
    </div>
    
    <p>FOR VALUE RECEIVED, the undersigned <strong>{{borrowerName}}</strong> ("Borrower") promises to pay to the order of <strong>{{lenderName}}</strong> ("Lender") the principal sum of <strong>\${{principalAmount}}</strong> with interest on the unpaid principal balance at the rate of <strong>{{interestRate}}</strong> per annum.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. PAYMENTS</h3>
    <p>The entire unpaid principal and accrued interest shall be fully due and payable on <strong>{{maturityDate}}</strong> (the "Maturity Date").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. SECURITY</h3>
    <p>This Note is secured by the following collateral (the "Collateral"):</p>
    <p style="background: #f0f0f0; padding: 10px; border: 1px solid #ddd;">{{collateral}}</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. DEFAULT</h3>
    <p>In the event of any default, the Lender may declare the entire unpaid principal and accrued interest immediately due and payable.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. GOVERNING LAW</h3>
    <p>This Note shall be governed by the laws of the State of Delaware.</p>
    
    <div style="margin-top: 60px;">
        <p><strong>BORROWER:</strong></p>
        <p style="margin-top: 10px;">{{borrowerName}}</p>
        <div style="border-bottom: 1px solid #000; width: 300px; margin-top: 40px; margin-bottom: 8px;"></div>
        <p>Signature</p>
    </div>
</div>
`
    },
    {
        id: 'simple-loan-agreement',
        name: 'Simple Loan Agreement',
        category: 'finance',
        description: 'Basic loan agreement for personal or small business loans.',
        icon: '💰',
        isPro: false,
        fields: [
            { id: 'lender', label: 'Lender Name', type: 'text', required: true },
            { id: 'borrower', label: 'Borrower Name', type: 'text', required: true },
            { id: 'amount', label: 'Loan Amount ($)', type: 'currency', required: true },
            { id: 'interest', label: 'Interest Rate (%)', type: 'text', placeholder: '5%', required: true },
            { id: 'repaymentDate', label: 'Repayment Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">LOAN AGREEMENT</h1>
    
    <p>This Loan Agreement is made on this day by and between <strong>{{lender}}</strong> ("Lender") and <strong>{{borrower}}</strong> ("Borrower").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. LOAN AMOUNT</h3>
    <p>Lender promises to loan Borrower the principal sum of <strong>\${{amount}}</strong>.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. INTEREST</h3>
    <p>The loan shall bear interest at a rate of <strong>{{interest}}</strong> per annum.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. REPAYMENT</h3>
    <p>The full balance of the loan and accrued interest shall be due and payable on <strong>{{repaymentDate}}</strong>.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>LENDER</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>BORROWER</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                </td>
            </tr>
        </table>
    </div>
</div>`
    },

    // ========== Legal / Corporate ==========
    {
        id: 'mutual-nda-pro',
        name: 'Mutual NDA (Corporate)',
        category: 'legal',
        description: 'Standard corporate mutual non-disclosure agreement for business partnerships.',
        icon: '⚖️',
        isPro: false,
        fields: [
            { id: 'partyAName', label: 'Company A Name', type: 'text', required: true },
            { id: 'partyBName', label: 'Company B Name', type: 'text', required: true },
            { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
            { id: 'jurisdiction', label: 'Governing Jurisdiction', type: 'text', placeholder: 'State of California', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">MUTUAL NON-DISCLOSURE AGREEMENT</h1>
    
    <p>This Mutual Non-Disclosure Agreement (this "Agreement") is dated <strong>{{effectiveDate}}</strong> between <strong>{{partyAName}}</strong> and <strong>{{partyBName}}</strong> (each a "Party" and collectively the "Parties").</p>
    
    <p>In connection with a potential business relationship (the "Purpose"), each Party may disclose to the other Party certain confidential technical and business information that the disclosing Party protects as confidential.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. CONFIDENTIAL INFORMATION</h3>
    <p>"Confidential Information" means all information enclosed, whether written, oral, or visual, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. EXCLUSIONS</h3>
    <p>Confidential Information excludes information that: (a) is or becomes publicly known other than through a breach of this Agreement; (b) was known to the receiving Party prior to disclosure; or (c) is independently developed by the receiving Party.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. OBLIGATIONS</h3>
    <p>The receiving Party agrees to: (a) hold Confidential Information in strict confidence; (b) not disclose Confidential Information to any third parties; and (c) use Confidential Information only for the Purpose.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. TERM</h3>
    <p>This Agreement remains in effect for three (3) years from the Effective Date.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>{{partyAName}}</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>{{partyBName}}</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                    <p>Date: _________________</p>
                </td>
            </tr>
        </table>
    </div>
</div>
`
    },
    {
        id: 'website-privacy-policy',
        name: 'Website Privacy Policy',
        category: 'legal',
        description: 'GDPR & CCPA compliant privacy policy for websites and apps.',
        icon: '⚖️',
        isPro: true,
        fields: [
            { id: 'websiteName', label: 'Website/App Name', type: 'text', required: true },
            { id: 'companyName', label: 'Company Name', type: 'text', required: true },
            { id: 'contactEmail', label: 'Contact Email', type: 'email', required: true },
            { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">PRIVACY POLICY</h1>
    <p style="text-align: center; font-style: italic;">Last updated: {{effectiveDate}}</p>
    
    <p><strong>{{companyName}}</strong> ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by <strong>{{websiteName}}</strong>.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. INFORMATION WE COLLECT</h3>
    <p>We may collect personal information such as your name, email address, and other information you voluntarily provide to us.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. HOW WE USE YOUR INFORMATION</h3>
    <p>We use the information we collect to operate, maintain, and improve our services.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. SHARING OF INFORMATION</h3>
    <p>We do not share your personal information with third parties except as necessary to provide our services or as required by law.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">4. CONTACT US</h3>
    <p>If you have any questions about this Privacy Policy, please contact us at <strong>{{contactEmail}}</strong>.</p>
</div>`
    },

    // ========== HR ==========
    {
        id: 'offer-letter',
        name: 'Executive Employment Offer',
        category: 'hr',
        description: 'Formal employment offer letter for executive-level hires.',
        icon: '👥',
        isPro: true,
        fields: [
            { id: 'companyName', label: 'Company Name', type: 'text', required: true },
            { id: 'candidateName', label: 'Candidate Name', type: 'text', required: true },
            { id: 'title', label: 'Job Title', type: 'text', required: true },
            { id: 'salary', label: 'Annual Base Salary ($)', type: 'currency', required: true },
            { id: 'equity', label: 'Equity Grant (Shares/Options)', type: 'text', placeholder: '10,000 Options', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="margin: 0; text-transform: uppercase; font-size: 18pt;">{{companyName}}</h1>
        <p style="margin: 0; font-size: 10pt; color: #666;">CONFIDENTIAL EMPLOYMENT OFFER</p>
    </div>
    
    <p>{{startDate}}</p>
    
    <p><strong>PRIVATE & CONFIDENTIAL</strong><br>
    To: {{candidateName}}</p>
    
    <p><strong>Re: Offer of Employment</strong></p>
    
    <p>Dear {{candidateName}},</p>
    
    <p>We are pleased to offer you the position of <strong>{{title}}</strong> at <strong>{{companyName}}</strong> (the "Company"). We feel that your skills and background will be a valuable asset to our team.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. POSITION AND DUTIES</h3>
    <p>You will serve in the position of {{title}}, reporting to the Board of Directors or CEO. You agree to devote your full business time, attention, and best efforts to the performance of your duties.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. COMPENSATION</h3>
    <p><strong>Base Salary:</strong> The Company will pay you an annual base salary of <strong>\${{salary}}</strong>, payable in accordance with the Company's standard payroll schedule.</p>
    <p><strong>Equity:</strong> Subject to approval by the Company’s Board of Directors, you will be granted <strong>{{equity}}</strong>, subject to the terms of the Company’s Equity Incentive Plan.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. AT-WILL EMPLOYMENT</h3>
    <p>Your employment with the Company is for no specific period of time. Your employment with the Company will be "at will," meaning that either you or the Company may terminate your employment at any time and for any reason, with or without cause.</p>
    
    <p style="margin-top: 40px;">To accept this offer, please sign and date this letter below and return it to us.</p>
    
    <div style="margin-top: 60px;">
        <p>Sincerely,</p>
        <p><strong>{{companyName}}</strong></p>
    </div>
    
    <div style="margin-top: 40px; padding: 20px; border: 1px solid #000; background: #fafafa;">
        <p style="margin-bottom: 30px;"><strong>ACCEPTED AND AGREED:</strong></p>
        <div style="border-bottom: 1px solid #000; width: 300px; margin-bottom: 8px;"></div>
        <p>Signature: {{candidateName}}</p>
        <p>Date: _________________</p>
    </div>
</div>
`
    },
    {
        id: 'independent-contractor',
        name: 'Independent Contractor Agreement',
        category: 'hr',
        description: 'Contract for hiring freelancers or independent contractors.',
        icon: '👥',
        isPro: false,
        fields: [
            { id: 'company', label: 'Company Name', type: 'text', required: true },
            { id: 'contractor', label: 'Contractor Name', type: 'text', required: true },
            { id: 'serviceDesc', label: 'Description of Services', type: 'textarea', required: true },
            { id: 'compensation', label: 'Compensation Amount ($)', type: 'currency', required: true },
            { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        ],
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; color: #000; line-height: 1.5; font-size: 11pt;">
    <h1 style="text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24px;">INDEPENDENT CONTRACTOR AGREEMENT</h1>
    
    <p>This Agreement is made on <strong>{{startDate}}</strong> between <strong>{{company}}</strong> ("Company") and <strong>{{contractor}}</strong> ("Contractor").</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">1. SERVICES</h3>
    <p>Contractor agrees to perform the following services:</p>
    <p style="padding: 10px; background: #f9f9f9;">{{serviceDesc}}</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">2. COMPENSATION</h3>
    <p>Company shall pay Contractor the sum of <strong>\${{compensation}}</strong> for the completion of the Services.</p>
    
    <h3 style="text-transform: uppercase; font-size: 11pt; margin-top: 18px;">3. INDEPENDENT CONTRACTOR STATUS</h3>
    <p>Contractor is an independent contractor, not an employee of Company. Contractor is solely responsible for all taxes, withholdings, and other statutory obligations.</p>
    
    <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 20px;">
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>COMPANY</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; vertical-align: top;">
                    <p style="margin-bottom: 40px;"><strong>CONTRACTOR</strong></p>
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 8px;"></div>
                    <p>Signature</p>
                </td>
            </tr>
        </table>
    </div>
</div>`
    }
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
