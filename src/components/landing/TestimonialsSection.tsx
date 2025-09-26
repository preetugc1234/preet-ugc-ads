export default function TestimonialsSection() {
  const testimonials = [
    // Column 1
    [
      {
        id: 1,
        author: "John Smith",
        handle: "@johnsmith",
        content: "MakeUGC has revolutionized our content creation process. Amazing results!",
        time: "2h",
        likes: "1.2K",
        retweets: "340"
      },
      {
        id: 2,
        author: "Sarah Johnson",
        handle: "@sarahj",
        content: "Best investment we've made for our marketing. ROI increased by 300%!",
        time: "4h",
        likes: "856",
        retweets: "124"
      },
      {
        id: 3,
        author: "Mike Chen",
        handle: "@mikechen",
        content: "The AI avatars are incredibly realistic. Our customers love the videos!",
        time: "6h",
        likes: "2.1K",
        retweets: "567"
      },
      {
        id: 4,
        author: "Emily Davis",
        handle: "@emilyd",
        content: "From concept to final video in under 2 minutes. This is the future!",
        time: "8h",
        likes: "1.8K",
        retweets: "234"
      },
      {
        id: 5,
        author: "Alex Rodriguez",
        handle: "@alexr",
        content: "MakeUGC saved us thousands in production costs. Highly recommend!",
        time: "12h",
        likes: "945",
        retweets: "178"
      },
      {
        id: 6,
        author: "Lisa Wang",
        handle: "@lisawang",
        content: "The multilingual feature is a game-changer for global campaigns.",
        time: "1d",
        likes: "1.5K",
        retweets: "298"
      }
    ],
    // Column 2
    [
      {
        id: 7,
        author: "David Kim",
        handle: "@davidkim",
        content: "Never thought AI could create such authentic-looking UGC content!",
        time: "1h",
        likes: "2.3K",
        retweets: "445"
      },
      {
        id: 8,
        author: "Rachel Green",
        handle: "@rachelg",
        content: "Our conversion rates doubled after using MakeUGC for our ads.",
        time: "3h",
        likes: "1.7K",
        retweets: "312"
      },
      {
        id: 9,
        author: "Tom Wilson",
        handle: "@tomw",
        content: "The hook generator creates scroll-stopping content every time.",
        time: "5h",
        likes: "1.1K",
        retweets: "189"
      },
      {
        id: 10,
        author: "Jessica Brown",
        handle: "@jessicab",
        content: "300+ AI creators to choose from - perfect for our brand diversity.",
        time: "7h",
        likes: "987",
        retweets: "156"
      },
      {
        id: 11,
        author: "Chris Lee",
        handle: "@chrisl",
        content: "Script writer AI understands our brand voice perfectly. Impressive!",
        time: "10h",
        likes: "1.4K",
        retweets: "267"
      },
      {
        id: 12,
        author: "Amanda Taylor",
        handle: "@amandat",
        content: "MakeUGC is lowkey addicted. Can't stop creating amazing content!",
        time: "2d",
        likes: "2.0K",
        retweets: "398"
      }
    ],
    // Column 3
    [
      {
        id: 13,
        author: "Kevin Park",
        handle: "@kevinp",
        content: "Some of the AI's I've been using recently: MakeUGC for video ads.",
        time: "30m",
        likes: "3.1K",
        retweets: "612"
      },
      {
        id: 14,
        author: "Sophie Miller",
        handle: "@sophiem",
        content: "Fastest way to create winning ads with AI creators. Mind blown!",
        time: "2h",
        likes: "1.6K",
        retweets: "287"
      },
      {
        id: 15,
        author: "Ryan Thompson",
        handle: "@ryant",
        content: "The quality is indistinguishable from real UGC. Customers can't tell!",
        time: "4h",
        likes: "2.2K",
        retweets: "445"
      },
      {
        id: 16,
        author: "Maya Patel",
        handle: "@mayap",
        content: "Our agency switched to MakeUGC. Client satisfaction through the roof!",
        time: "6h",
        likes: "1.3K",
        retweets: "201"
      },
      {
        id: 17,
        author: "Jake Johnson",
        handle: "@jakej",
        content: "MakeUGC AI generates authentic-looking UGC but no actual creators.",
        time: "8h",
        likes: "1.9K",
        retweets: "334"
      },
      {
        id: 18,
        author: "Nina Foster",
        handle: "@ninaf",
        content: "It's the fastest way to produce TikTok-native content at scale.",
        time: "1d",
        likes: "2.5K",
        retweets: "478"
      }
    ]
  ];

  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/features-background-aesthetic.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Gradient blur effects */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

      <div className="relative z-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Don't take our <span className="text-blue-600">word</span> for it
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            See why thousands of business owners can't stop talking about MakeUGC.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] overflow-hidden">
          {testimonials.map((column, columnIndex) => (
            <div key={columnIndex} className="relative h-full overflow-hidden">
              <div className={`flex flex-col gap-4 animate-scroll-vertical-${columnIndex + 1}`}>
                {/* Double testimonials for seamless infinite loop */}
                {[...column, ...column].map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex-shrink-0"
                  >
                    {/* Profile header */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-400 text-xs">IMG</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-gray-500 text-sm">{testimonial.handle}</div>
                      </div>
                      <div className="text-gray-400 text-sm">{testimonial.time}</div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {testimonial.content}
                    </p>

                    {/* Engagement stats */}
                    <div className="flex items-center space-x-6 text-gray-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{Math.floor(Math.random() * 50)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🔄</span>
                        <span>{testimonial.retweets}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span>{testimonial.likes}</span>
                      </div>
                    </div>

                    {/* Image placeholder for some cards */}
                    {(index % 6 === 0 || index % 6 === 2 || index % 6 === 4) && (
                      <div className="mt-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                        <span className="text-gray-400">Image Placeholder</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}