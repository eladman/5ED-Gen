export default function CTA() {
  return (
    <section className="section-padding bg-[#ff8714]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center text-gray-900">
          <h2 className="heading-2 mb-6">
            מוכן להתחיל את המסע שלך?
          </h2>
          <p className="text-xl mb-8 text-gray-800">
            הצטרף לאלפי מתאמנים שכבר משיגים תוצאות מדהימות עם חמש אצבעות
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#ff8714] rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              התחל עכשיו
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
              תיאום שיחת היכרות
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 