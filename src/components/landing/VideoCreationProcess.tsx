import { Button } from "@/components/ui/button";

export default function VideoCreationProcess() {
  const steps = [
    {
      number: "1",
      title: "Write your script",
      description: "Enter or automatically generate a script that aligns with your brand's message to personalize your AI-generated video.",
      icon: "✏️",
      color: "bg-blue-50 text-blue-600"
    },
    {
      number: "2",
      title: "Pick an avatar",
      description: "Select from over 300 unique AI avatars to represent your brand's style and give a visual identity to your video.",
      icon: "👤",
      color: "bg-purple-50 text-purple-600"
    },
    {
      number: "3",
      title: "Generate your video",
      description: "Combine the selected avatar and script to quickly produce a high-quality, personalized video for your brand in minutes.",
      icon: "🎬",
      color: "bg-indigo-50 text-indigo-600"
    }
  ];

  return (
    <section className="relative bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Create <span className="text-blue-600">AI UGC</span> videos in minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate scroll-stopping content with AI, anytime you want
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Gradient blue background card */}
              <div className="absolute inset-4 bg-gradient-to-br from-blue-50/60 to-blue-100/40 rounded-3xl opacity-80"></div>

              {/* Content */}
              <div className="relative text-center p-6">
                <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Get Started Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-8 py-4 h-auto text-lg rounded-lg"
          >
            Get Started
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}