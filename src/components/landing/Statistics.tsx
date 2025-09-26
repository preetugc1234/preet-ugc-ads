export default function Statistics() {
  const stats = [
    {
      number: "163,891",
      label: "Videos generated"
    },
    {
      number: "3.1x",
      label: "Average ROAS"
    },
    {
      number: "2min 23sec",
      label: "Average video generation time"
    }
  ];

  return (
    <section className="relative bg-white py-16 lg:py-24 pb-24 lg:pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Grid */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="flex-1 text-center relative">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
                {stat.number}
              </div>
              <div className="text-gray-600 text-lg font-medium">
                {stat.label}
              </div>

              {/* Vertical divider for desktop (not on last item) */}
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 w-px h-20 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="text-center mt-16 lg:mt-20">
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Thousands of companies trust MakeUGC for creating high quality and engaging AI videos.
          </p>
        </div>
      </div>
    </section>
  );
}