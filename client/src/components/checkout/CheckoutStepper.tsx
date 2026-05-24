interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: 'Shipping' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Confirmation' },
] as const;

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-start justify-center mb-10">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-start">
          {/* Step circle + label */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step.number < currentStep
                  ? 'bg-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                step.number === currentStep
                  ? 'text-blue-600'
                  : step.number < currentStep
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line between steps */}
          {index < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-16 sm:w-24 mx-3 mt-5 transition-colors ${
                step.number < currentStep ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
