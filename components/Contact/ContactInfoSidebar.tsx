import { MapPin, Phone, Clock } from "lucide-react";
import { titleFont, textFont } from "@/lib/fonts";

export default function ContactInfoSidebar() {
  return (
    <div className="space-y-6">
      {/* Details Card */}
      <div className="bg-[#15161b] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#de3e4f] rounded-full blur-[80px] opacity-15" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#dbba53] rounded-full blur-[60px] opacity-10" />

        <h3 className={`${titleFont.className} text-2xl uppercase tracking-wide relative z-10 mb-8`}>
          The Details
        </h3>

        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[#de3e4f]" />
            </div>
            <h4 className={`${textFont.className} font-bold text-base uppercase tracking-wider`}>HQ</h4>
          </div>
          <p className={`${textFont.className} text-white/60 text-sm pl-[3.25rem] leading-relaxed`}>
            E House No.-011, S.R.I.T Plot<br />
            Railway Station Road, Industrial Area<br />
            Bargarh, Odisha 768028
          </p>
        </div>

        <div className="border-t border-white/10 my-6" />

        {/* Contact */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-[#de3e4f]" />
            </div>
            <h4 className={`${textFont.className} font-bold text-base uppercase tracking-wider`}>Direct Line</h4>
          </div>
          <div className="pl-[3.25rem] space-y-1">
            <p className={`${textFont.className} text-lg font-medium tracking-wide`}>+91 63709 99393</p>
            <p className={`${textFont.className} text-sm text-white/60`}>contact@drinkorake.com</p>
          </div>
        </div>

        <div className="border-t border-white/10 my-6" />

        {/* Hours */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-[#dbba53]" />
            </div>
            <h4 className={`${textFont.className} font-bold text-base uppercase tracking-wider`}>Hours</h4>
          </div>
          <div className="pl-[3.25rem] space-y-0.5">
            <p className={`${textFont.className} text-sm text-white/60`}>Mon – Fri: 10:00 AM – 4:00 PM IST</p>
            <p className={`${textFont.className} text-sm text-white/60`}>Sat: 10:00 AM – 1:00 PM IST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
