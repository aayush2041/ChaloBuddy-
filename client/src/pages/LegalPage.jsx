import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, FileText, ChevronRight } from 'lucide-react';

export default function LegalPage() {
  const { currentRoute, navigate } = useStore();
  const pageType = currentRoute.page || 'terms';

  const contentMap = {
    terms: {
      title: 'Terms & Conditions',
      lastUpdated: 'January 15, 2026',
      sections: [
        {
          heading: '1. Introduction & Operating Scope',
          body: 'ValorVault operates as an independent peer verification marketplace and escrow intermediary for digital gaming assets and creator accounts. By placing an order, submitting payment details, or listing inventory on ValorVault, you expressly agree to be bound by these Terms & Conditions.'
        },
        {
          heading: '2. Manual Escrow & Payment Verification',
          body: 'All customer payments processed via UPI or Direct Bank Transfer are manually verified against banking records by our operations team before digital inventory is released. Submission of fraudulent or recycled UTR numbers will result in immediate permanent account suspension and blacklisting across gaming federations.'
        },
        {
          heading: '3. Digital Product Custody & Inspection',
          body: 'Upon payment confirmation, digital assets are deposited directly into your authenticated Digital Vault. Buyers are granted an inspection window to verify login credentials, region, rank, and inventory. Any discrepancies must be reported to our support desk immediately prior to confirming full access.'
        },
        {
          heading: '4. Limitation of Liability',
          body: 'ValorVault is not affiliated with, endorsed by, or sponsored by Riot Games, Krafton, Tencent, Garena, or Google LLC. Game titles, trademarks, and associated logos belong to their respective copyright holders.'
        }
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'January 15, 2026',
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'We collect minimal customer information necessary to authenticate purchases and deliver digital goods: account name, email address, phone number (used for WhatsApp delivery notifications), and transaction references (UTR number and payment screenshots).'
        },
        {
          heading: '2. Storage & Vault Encryption',
          body: 'Digital credentials, passwords, and voucher codes are stored using encrypted fields accessible exclusively by authenticated buyers through their private Digital Vault. We never sell, rent, or trade your personal or gaming data to third-party advertisers.'
        },
        {
          heading: '3. Data Retention & Deletion',
          body: 'Transactional audit records are retained for compliance with financial accounting standards. Users may request account deletion and removal of auxiliary telemetry by contacting support@valorvault.gg.'
        }
      ]
    },
    'refund-policy': {
      title: 'Refund & Inspection Policy',
      lastUpdated: 'January 15, 2026',
      sections: [
        {
          heading: '1. 100% First-Login Inspection Guarantee',
          body: 'If credentials delivered to your Digital Vault fail initial authentication, or if account specifications (rank, skins, region) differ materially from the catalog listing, a full 100% refund or replacement will be provided immediately upon verification by our support desk.'
        },
        {
          heading: '2. Warranty Period & Conditions',
          body: 'Accounts carry a 30-day anti-recall warranty. To qualify for warranty protection, the buyer must not use third-party cheat software, unauthorized injectors, or share credentials with unauthorized external parties.'
        },
        {
          heading: '3. Refund Disbursement',
          body: 'Approved refunds are credited directly back to the original remitting UPI ID or bank account within 24–48 hours after arbitration is concluded.'
        }
      ]
    },
    'acceptable-use': {
      title: 'Acceptable Use Policy',
      lastUpdated: 'January 15, 2026',
      sections: [
        {
          heading: '1. Prohibited Activities',
          body: 'Users are strictly prohibited from submitting forged payment screenshots, sharing bot accounts, using automated scraping tools against our product catalog, or engaging in hostile dispute extortion.'
        },
        {
          heading: '2. Account Security Compliance',
          body: 'Buyers must change passwords and link verified recovery channels immediately upon receiving credentials from the Digital Vault. Sharing account access with third parties voids platform warranty.'
        },
        {
          heading: '3. Sanctions & Legal Enforcement',
          body: 'Violations of this policy will result in account termination, forfeiture of escrow balance, and reporting to relevant anti-fraud enforcement authorities.'
        }
      ]
    }
  };

  const currentContent = contentMap[pageType] || contentMap.terms;

  return (
    <div className="bg-[#F8F9FC] min-h-screen py-10 text-[#111426]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-[#667085]">
          <span onClick={() => navigate('home')} className="hover:text-[#5B45F5] cursor-pointer transition">
            Home
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#111426] font-bold">{currentContent.title}</span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-[#E7E9F2] p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b border-[#F1F3F9] pb-6 space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#EEF0FF] text-[#5B45F5] px-3 py-1 rounded-full text-xs font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Documentation</span>
            </div>
            <h1 className="text-3xl font-black text-[#111426] tracking-tight">
              {currentContent.title}
            </h1>
            <p className="text-xs text-[#667085]">Last Updated: {currentContent.lastUpdated}</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#667085] leading-relaxed">
            {currentContent.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-base font-black text-[#111426]">{sec.heading}</h2>
                <p>{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#F1F3F9] flex items-center space-x-2 text-xs text-[#667085]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Official Policy published by ValorVault Legal Compliance Division.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
