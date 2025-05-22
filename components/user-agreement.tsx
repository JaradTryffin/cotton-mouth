import React from "react";

interface UserAgreementProps {
  className?: string;
}

export function UserAgreement({ className }: UserAgreementProps) {
  return (
    <div
      className={`max-h-60 overflow-y-auto rounded border p-4 text-sm ${className}`}
    >
      <h4 className="mb-2 font-medium">COTTON MOUTH MEMBER AGREEMENT</h4>
      <p className="mb-2 font-medium">
        Private Membership Agreement for Access to Cannabis
      </p>

      <p className="mb-2">
        <strong>1. Introduction</strong> This Agreement is entered into between
        Cotton Mouth (Pty) Ltd, a private company operating as a cannabis
        membership collective, and the undersigned individual ("Member"). Cotton
        Mouth operates in accordance with South African laws permitting the
        private possession, and consumption of cannabis for personal use.
      </p>

      <p className="mb-2">
        <strong>2. Eligibility & Membership</strong>
      </p>
      <p className="mb-1 ml-4">
        2.1 Membership is restricted to individuals aged 21 years or older.
      </p>
      <p className="mb-1 ml-4">
        2.2 By signing this Agreement, the Member confirms that they are joining
        Cotton Mouth voluntarily for the purpose of accessing cannabis within a
        private, members-only environment.
      </p>
      <p className="mb-2 ml-4">
        2.3 The Member understands that access is not open to the general public
        and is conditional upon compliance with this Agreement.
      </p>

      <p className="mb-2">
        <strong>3. Nature of Cannabis Supply</strong>
      </p>
      <p className="mb-1 ml-4">
        3.1 Cotton Mouth facilitates the private consumption of cannabis amongst
        consenting adult members.
      </p>
      <p className="mb-1 ml-4">
        3.2 Cannabis obtained through Cotton Mouth is for personal use only. The
        resale or distribution to non-members or minors is strictly prohibited.
      </p>
      <p className="mb-2 ml-4">
        3.3 Members acknowledge that any cannabis accessed through Cotton Mouth
        remains in the realm of private use, as per the Constitutional Court's
        ruling of 2018.
      </p>

      <p className="mb-2">
        <strong>4. Code of Conduct</strong>
      </p>
      <p className="mb-1 ml-4">
        4.1 Members shall not engage in any conduct that endangers the safety,
        reputation, or operation of Cotton Mouth.
      </p>
      <p className="mb-1 ml-4">
        4.2 Cannabis may not be consumed on premises unless and until such space
        is designated and compliant with local by-laws.
      </p>
      <p className="mb-1 ml-4">
        4.3 Members shall not attend the premises under the influence of alcohol
        or other substances, or behave in a disruptive or unlawful manner.
      </p>
      <p className="mb-2 ml-4">
        4.4 Any breach of conduct may result in termination of membership
        without refund.
      </p>

      <p className="mb-2">
        <strong>5. Confidentiality & Privacy</strong>
      </p>
      <p className="mb-1 ml-4">
        5.1 Cotton Mouth respects the privacy of its members and handles
        personal data in accordance with the Protection of Personal Information
        Act (POPIA).
      </p>
      <p className="mb-2 ml-4">
        5.2 Member information will not be shared with third parties unless
        required by law.
      </p>

      <p className="mb-2">
        <strong>6. Membership Fees</strong>
      </p>
      <p className="mb-1 ml-4">
        6.1 Members may be required to pay a membership fee and/or contribution
        costs associated with the cultivation and packaging of cannabis.
      </p>
      <p className="mb-2 ml-4">
        6.2 These fees are not payments for the cannabis itself but are
        considered contributions to the operational and logistical costs of the
        club.
      </p>

      <p className="mb-2">
        <strong>7. Liability Waiver</strong>
      </p>
      <p className="mb-1 ml-4">
        7.1 The Member accepts full responsibility for their use of cannabis and
        agrees to indemnify Cotton Mouth against any liability, claims, or
        damages arising from such use.
      </p>
      <p className="mb-2 ml-4">
        7.2 The Member understands the risks associated with cannabis
        consumption, including but not limited to psychological and physical
        effects.
      </p>

      <p className="mb-2">
        <strong>8. Termination of Membership</strong>
      </p>
      <p className="mb-1 ml-4">
        8.1 Membership may be terminated by either party, with or without
        reason, upon written notice.
      </p>
      <p className="mb-2 ml-4">
        8.2 Cotton Mouth reserves the right to revoke membership immediately for
        any breach of this Agreement or applicable laws.
      </p>

      <p className="mb-2">
        <strong>9. Governing Law</strong> This Agreement shall be governed in
        accordance with the laws of the Republic of South Africa.
      </p>

      <p className="mt-4 mb-2 font-medium">Member Acknowledgment & Signature</p>
      <p className="mb-2">
        I, the undersigned, confirm that I have read, understood, and agree to
        the terms set out in this Membership Agreement.
      </p>
    </div>
  );
}
