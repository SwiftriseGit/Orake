export default function ContactMap() {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm w-full h-[400px] sm:h-[500px]">
      <div className="relative h-full w-full bg-gray-100">
        <iframe
          src="https://maps.google.com/maps?q=21.330945,83.6383182&z=17&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="transition-all duration-500"
        />
      </div>
    </div>
  );
}
