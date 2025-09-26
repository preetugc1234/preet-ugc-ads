import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function VideoCreationProcess() {
  const avatars = [
    { name: "Sarah", selected: false },
    { name: "Liam", selected: false },
    { name: "Ellie", selected: true },
    { name: "James", selected: false },
    { name: "Noah", selected: false },
  ];

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

        {/* Visual Demo Section */}
        <div className="mb-20 grid lg:grid-cols-3 gap-8 items-start">
          {/* Script Input */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 h-80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Script</h3>
              <div className="bg-white rounded-lg p-4 h-48 border border-gray-200">
                <textarea
                  className="w-full h-full resize-none border-0 outline-none text-gray-500"
                  placeholder="Type your script here"
                  readOnly
                />
              </div>
              <div className="mt-4 flex items-center justify-center">
                <button className="flex items-center gap-2 text-blue-600 font-medium">
                  <span className="text-blue-500">✨</span>
                  Generate with AI
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 h-80">
              <div className="flex items-center justify-center mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {avatars.map((avatar, index) => (
                    <div key={index} className="relative">
                      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                        avatar.selected ? 'border-blue-500' : 'border-gray-200'
                      }`}>
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {avatar.name.slice(0, 1)}
                          </span>
                        </div>
                      </div>
                      {avatar.selected && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <p className="text-center text-sm text-gray-600 mt-1">{avatar.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Video */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 h-80 flex items-center justify-center">
              <div className="bg-gray-900 rounded-2xl w-40 h-72 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-2 right-2 bg-black h-6 rounded-full"></div>
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-sm">▶</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
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