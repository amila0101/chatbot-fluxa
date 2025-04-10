import React, { useState } from 'react';
import { FiLock, FiCreditCard, FiCalendar, FiUser, FiCheck } from 'react-icons/fi';

export function Payment({ theme, plan, onSuccess }) {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Processing payment:', paymentDetails);
    if (onSuccess) onSuccess();
  };

  return (
    <div className={`w-full max-w-xl mx-auto p-8 ${theme.input} rounded-2xl`}>
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="bg-[#2DA8D4]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-8 h-8 text-[#2DA8D4]" />
        </div>
        <h2 className={`text-3xl font-bold ${theme.textDark} mb-2`}>
          Complete Your Purchase
        </h2>
        <p className={`${theme.text} text-sm mb-4`}>
          Your payment is secured with end-to-end encryption
        </p>
      </div>

      {/* Plan Summary */}
      {plan && (
        <div className={`${theme.button} ${theme.buttonBorder} rounded-xl p-4 mb-8`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`${theme.textDark} font-semibold`}>{plan.name} Plan</h3>
              <p className={`${theme.text} text-sm`}>Billed monthly</p>
            </div>
            <div className="text-right">
              <div className={`${theme.textDark} text-2xl font-bold`}>{plan.price}</div>
              <div className={`${theme.text} text-sm`}>per month</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {plan.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <FiCheck className="w-4 h-4 text-[#2DA8D4] mr-2" />
                <span className={theme.text}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className={`block ${theme.text} text-sm mb-2`}>Card Information</label>
            <div className={`${theme.button} ${theme.buttonBorder} rounded-lg p-4 space-y-4`}>
              <div className="relative">
                <FiCreditCard className={`absolute left-3 top-3 ${theme.text}`} />
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className={`w-full pl-10 pr-4 py-2 bg-transparent ${theme.text} border-b ${theme.border} focus:outline-none focus:border-[#2DA8D4]`}
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    cardNumber: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className={`py-2 px-3 bg-transparent ${theme.text} border ${theme.border} rounded-lg focus:outline-none focus:border-[#2DA8D4]`}
                  value={paymentDetails.expiry}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    expiry: e.target.value
                  })}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className={`py-2 px-3 bg-transparent ${theme.text} border ${theme.border} rounded-lg focus:outline-none focus:border-[#2DA8D4]`}
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    cvv: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block ${theme.text} text-sm mb-2`}>Cardholder Name</label>
            <div className="relative">
              <FiUser className={`absolute left-3 top-3 ${theme.text}`} />
              <input
                type="text"
                placeholder="Full name on card"
                className={`w-full pl-10 pr-4 py-2 ${theme.button} ${theme.buttonBorder} ${theme.text} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2DA8D4]/20`}
                value={paymentDetails.name}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  name: e.target.value
                })}
              />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          type="submit"
          className="w-full bg-[#2DA8D4] text-white py-4 rounded-xl hover:bg-[#2B96BC] transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <FiLock className="w-4 h-4" />
          Pay {plan?.price}
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <FiLock className={`w-4 h-4 ${theme.text}`} />
          <span className={`${theme.text} text-sm`}>
            Secured by Stripe • SSL Encrypted
          </span>
        </div>
      </form>
    </div>
  );
}