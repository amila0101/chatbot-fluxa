import React from 'react';
import { FiStar, FiZap, FiCpu, FiCode } from 'react-icons/fi';

export function PremiumFeatures({ theme, onSubscribe }) {
  const features = [
    {
      icon: <FiStar className="w-6 h-6" />,
      title: "Advanced AI Models",
      description: "Access to GPT-4, Claude, and other premium AI models"
    },
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Faster Processing",
      description: "Priority queue for all your requests"
    },
    {
      icon: <FiCpu className="w-6 h-6" />,
      title: "Advanced Features",
      description: "Access to code generation, image analysis, and more"
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "API Access",
      description: "Direct API access for integration"
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Basic AI Chat",
        "5 requests per day",
        "Basic file uploads",
        "Community support"
      ]
    },
    {
      name: "Pro",
      price: "$19/month",
      features: [
        "Everything in Basic",
        "Unlimited requests",
        "Priority support",
        "Advanced AI models",
        "API access"
      ],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom AI models",
        "Dedicated support",
        "Custom integrations",
        "Team management"
      ]
    }
  ];

  const handleSubscribe = (plan) => {
    if (plan.price !== "Custom") {
      onSubscribe?.(plan);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold ${theme.textDark} mb-4`}>
          Upgrade to <span className="text-[#2DA8D4]">Premium</span>
        </h2>
        <p className={`${theme.text} text-lg`}>
          Get access to advanced features and unlimited AI capabilities
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`${theme.input} rounded-xl p-6 text-center`}
          >
            <div className="text-[#2DA8D4] mb-4">{feature.icon}</div>
            <h3 className={`${theme.textDark} font-semibold mb-2`}>
              {feature.title}
            </h3>
            <p className={`${theme.text} text-sm`}>{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`${theme.input} rounded-xl p-6 ${
              plan.recommended ? 'ring-2 ring-[#2DA8D4]' : ''
            }`}
          >
            <div className="text-center mb-6">
              <h3 className={`${theme.textDark} text-xl font-bold mb-2`}>
                {plan.name}
              </h3>
              <div className={`${theme.textDark} text-3xl font-bold mb-4`}>
                {plan.price}
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-2 px-4 rounded-lg ${
                  plan.recommended
                    ? 'bg-[#2DA8D4] text-white'
                    : `${theme.button} ${theme.text}`
                } hover:bg-[#2DA8D4] hover:text-white transition-colors`}
              >
                {plan.price === "Custom" ? "Contact Us" : "Subscribe Now"}
              </button>
            </div>
            <ul className="space-y-3">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className={`${theme.text} flex items-center`}>
                  <FiStar className="w-4 h-4 text-[#2DA8D4] mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 