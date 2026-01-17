import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import RFP from '../models/RFP.model.js';
import Vendor from '../models/Vendor.model.js';
import Proposal from '../models/Proposal.model.js';
import { parseVendorProposal } from './aiProposal.service.js';

const getClient = () => {
    return new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        logger: false
    });
};

export async function checkEmailsForProposals() {
    const client = getClient();
    const results = {
        processed: 0,
        errors: []
    };

    try {
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        
        try {
            // Search for unread emails containing "Proposal" in subject
            // Note: Gmail search might be case insensitive but robust logic helps
            const messages = [];
            for await (const msg of client.fetch({ seen: false, subject: 'Proposal' }, { source: true, envelope: true })) {
                messages.push(msg);
            }
            
            console.log(`📧 Found ${messages.length} new potential proposal emails`);

            for (const msg of messages) {
                try {
                    const parsed = await simpleParser(msg.source);
                    const subject = parsed.subject || '';
                    const fromEmail = parsed.from.value[0].address;
                    const textBody = parsed.text || parsed.html || ''; // Prefer text

                    console.log(`Processing email from ${fromEmail}: "${subject}"`);

                    // 1. Find RFP Reference ID in Subject (e.g. "Proposal for Ref: 12345")
                    // Assuming Ref ID is alphanumeric. Let's look for known Ref IDs in DB if regex fails?
                    // Better: Regex for "REF-..." or just exact match if we enforced it in the email template we sent.
                    
                    // Our sendRfpToVendors sends: "REFERENCE ID: <id>"
                    // So we look for that pattern in Subject or Body? Subject is safer.
                    
                    // Regex to find Ref ID (assuming we use nanoid or similar 8-10 chars)
                    // Let's try to match against open RFPs.
                    
                    // Simplified: Look for any string that matches an existing RFP's referenceId
                    const rfps = await RFP.find({ status: { $ne: 'CLOSED' } });
                    let matchedRfp = null;
                    
                    for (const rfp of rfps) {
                         if (subject.includes(rfp.referenceId) || textBody.includes(rfp.referenceId)) {
                             matchedRfp = rfp;
                             break;
                         }
                    }

                    if (!matchedRfp) {
                        console.log('Skipping: No matching RFP Reference ID found.');
                        continue;
                    }

                    // 2. Find Vendor
                    let vendor = await Vendor.findOne({ email: fromEmail });
                    if (!vendor) {
                        // Optional: Create new vendor? Or skip.
                        // For this assignment, better to create or find loosely.
                        const name = parsed.from.value[0].name || fromEmail.split('@')[0];
                        vendor = await Vendor.create({
                            name: name,
                            company: name + ' (Auto-created)',
                            email: fromEmail,
                            notes: 'Auto-created from incoming email'
                        });
                        console.log('Created new vendor:', vendor.name);
                    }

                    // 3. Parse Proposal with AI
                    console.log('🤖 Parsing proposal content with AI...');
                    const proposalData = await parseVendorProposal(textBody, matchedRfp);

                    // 4. Save Proposal
                    const newProposal = await Proposal.create({
                        rfp: matchedRfp._id,
                        vendor: vendor._id,
                        emailSubject: subject,
                        emailBody: textBody,
                        emailReceivedAt: new Date(),
                        parsedData: proposalData,
                        aiExtracted: true,
                        status: 'PARSED'
                    });

                    // Add vendor to RFP vendors list if not there
                    if (!matchedRfp.vendors.includes(vendor._id)) {
                        matchedRfp.vendors.push(vendor._id);
                        await matchedRfp.save();
                    }

                    console.log('✅ Proposal saved:', newProposal._id);
                    results.processed++;

                    // Mark as seen/read
                    await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen']);

                } catch (err) {
                    console.error('Error processing message:', err.message);
                    results.errors.push({ subject: msg.envelope.subject, error: err.message });
                }
            }

        } finally {
            lock.release();
        }

        await client.logout();

    } catch (err) {
        console.error('IMAP Error:', err);
        throw err;
    }

    return results;
}
