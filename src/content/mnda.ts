// Source of truth for the Mutual NDA + Non-Circumvention agreement.
// Bump MNDA_VERSION whenever the text below is materially changed; existing
// users will be required to re-sign because we record the version they signed.

export const MNDA_VERSION = "v1";

export const MNDA_DISCLOSING_PARTY = {
  name: "Livio Building Systems, Inc.",
  address: "171 Main Street #562, Los Altos, CA 94022",
  signer: "Navneet Aron",
  title: "Founder & CEO",
};

export const MNDA_TITLE = "Mutual Non-Disclosure & Non-Circumvention Agreement";

export const MNDA_INTRO = `This Agreement is entered into between Livio Building Systems, Inc., 171 Main Street #562, Los Altos, CA 94022 ("Livio"), and you on behalf of your organization (together, the "Parties").

The Parties want to explore a potential business relationship (the "Purpose") and may need to share sensitive information to do so. This Agreement sets out the ground rules for keeping that information confidential and for dealing with each other fairly.`;

export const MNDA_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "1. What Counts as Confidential Information",
    body: `"Confidential Information" means anything one Party (the "Disclosing Party") shares with the other (the "Receiving Party") in connection with the Purpose — in any form, before or after the Effective Date — including business plans, financial data, pricing, technology, trade secrets, intellectual property, customer and supplier relationships, and the existence and terms of this Agreement. Notes or summaries that incorporate shared information are also covered.

The following are not Confidential Information (except personal data, which is always protected):

(a) information that becomes publicly known through no fault of the Receiving Party;
(b) information the Receiving Party lawfully obtains from a third party with no confidentiality restriction; or
(c) information the Receiving Party independently develops without using anything shared under this Agreement.`,
  },
  {
    heading: "2. How to Use (and Not Use) the Information",
    body: `Each Receiving Party agrees to: (a) use Confidential Information only for the Purpose; (b) not share it without the Disclosing Party's prior written consent; and (c) maintain reasonable safeguards to protect it. The Receiving Party is responsible for any misuse by its own authorized representatives.

Sharing with authorized representatives (employees, advisors, and affiliates who need the information to evaluate the Purpose and are bound by equivalent confidentiality obligations) is permitted. Neither Party may use Confidential Information to compete directly with the other or to pursue substantially the same projects the other Party has specifically disclosed under this Agreement.`,
  },
  {
    heading: "3. If Disclosure Is Required by Law",
    body: `If legally required to disclose Confidential Information, the Receiving Party will (where permitted) promptly notify the Disclosing Party so it can seek a protective order. Only the minimum legally required portion will be disclosed, and the Receiving Party will request that confidential treatment be accorded. Routine regulatory examinations not specifically targeting the Disclosing Party are exempt from the notice requirement.`,
  },
  {
    heading: "4. Return or Destruction of Information",
    body: `Upon written request, the Receiving Party will promptly destroy (or return, if requested) all Confidential Information in its possession and confirm compliance in writing. Copies required for legal compliance or legitimate records-retention may be kept.`,
  },
  {
    heading: "5. Ownership",
    body: `Sharing information under this Agreement does not transfer any intellectual property rights or other ownership interests. Each Party retains full ownership of everything it discloses.`,
  },
  {
    heading: "6. No Warranties / No Partnership",
    body: `Confidential Information is shared as-is, with no warranty as to accuracy or completeness. This Agreement does not create a partnership, joint venture, or agency relationship, and does not obligate either Party to enter into any further deal. Each Party bears its own costs. Sharing privileged materials does not waive any attorney-client or work-product privilege.`,
  },
  {
    heading: "7. How Long This Agreement Lasts",
    body: `Confidentiality obligations last 4 years from the Effective Date — indefinitely for information that qualifies as a trade secret under applicable law. Non-circumvention obligations (Section 8) last 4 years from the date of the last Contact introduction. Either Party may terminate on 30 days' written notice, but confidentiality obligations survive termination for 5 additional years.`,
  },
  {
    heading: "8. Non-Circumvention",
    body: `Neither Party will go around the other to deal directly with contacts introduced under this Agreement without the introducing Party's prior written consent. This applies equally to each Party's affiliates, employees, agents, and other representatives.

"Contacts" means any third party, company, or entity specifically introduced in writing by one Party to the other in connection with the Purpose within 36 months of such introduction.

These restrictions do not apply to contacts the Receiving Party already knew before the introduction (evidenced by written records) or that were independently introduced by an unrelated third party.

Penalty for circumvention: The circumventing Party agrees to pay the circumvented Party a sum equal to the commission or fee the circumvented Party would have earned, for each occurrence.`,
  },
  {
    heading: "9. Enforcement",
    body: `Because a breach could cause irreparable harm that money alone cannot fix, either Party may seek injunctive or other equitable relief without posting a bond. The prevailing Party in any legal proceeding to enforce this Agreement may recover court costs and reasonable attorney fees.`,
  },
  {
    heading: "10. General",
    body: `Entire Agreement. This is the complete agreement on confidentiality between the Parties and supersedes all prior discussions on the topic.

Changes. Any amendment must be in writing and signed by both Parties. Failing to enforce a right at any time does not waive it.

Assignment. Neither Party may assign this Agreement without the other's prior written consent.

Governing Law. California law governs this Agreement. Both Parties consent to exclusive jurisdiction in California courts.

Severability. If any provision is found unenforceable, the rest of the Agreement remains in full effect.

Notices. All notices must be in writing, sent to each Party's address listed above (or updated address provided in writing), and are effective the next business day if sent by overnight courier, or upon actual receipt otherwise.

Counterparts. This Agreement may be signed in counterparts and electronically, each of which is an original, and all of which together form one instrument.`,
  },
];
