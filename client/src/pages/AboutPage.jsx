import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Compass,
  ShieldCheck,
  Users,
  MapPin,
  Sparkles,
  Heart,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  const { navigate } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF5A1F]/30">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Travel. Explore. Belong.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            ChaloBuddy was built on a simple belief: the most transformative journeys are the ones we share with others.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5A1F] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#071A2B]">100% Verified Organizers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every trip host undergoes identity verification, route safety assessments, and certified first-aid screening.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#071A2B]">Smart Planning Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algorithmic day-by-day itineraries tailored to your budget, group dynamics, and favorite travel vibe.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#071A2B]">Social Travel Community</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with fellow adventurers, split lodging and vehicle expenses, and make lifelong travel companions.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
          <h2 className="text-2xl font-extrabold text-[#071A2B]">Frequently Asked Questions</h2>
          <div className="space-y-4 text-xs divide-y divide-slate-100">
            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-[#071A2B]">How does joining a group trip work?</h4>
              <p className="text-slate-600 leading-relaxed">
                Click 'Join This Trip' on any listing. Select the number of travelers, submit your contact information and note to the organizer. Once accepted, you receive an instant confirmation and access to the shared Trip Workspace and group chat.
              </p>
            </div>

            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-[#071A2B]">Can anyone list a trip as a host?</h4>
              <p className="text-slate-600 leading-relaxed">
                Yes! Any verified member can list a trip using our 11-step creation workflow. You set the dates, group capacity, transport method, and budget per person.
              </p>
            </div>

            <div className="pt-3 space-y-1">
              <h4 className="font-bold text-sm text-[#071A2B]">What is the cancellation policy?</h4>
              <p className="text-slate-600 leading-relaxed">
                Under the ChaloBuddy Trust Guarantee, cancellations made up to 48 hours prior to trip departure are eligible for a 100% refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
