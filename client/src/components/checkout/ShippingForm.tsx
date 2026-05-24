import { useState, type FormEvent } from 'react';
import type { ShippingDetails } from '../../types/order.types';

interface ShippingFormProps {
  initialValues: ShippingDetails | null;
  onSubmit: (values: ShippingDetails) => void;
}

type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

const EMPTY: ShippingDetails = {
  shipping_name: '',
  shipping_address: '',
  shipping_city: '',
  shipping_country: '',
};

export default function ShippingForm({ initialValues, onSubmit }: ShippingFormProps) {
  const [values, setValues] = useState<ShippingDetails>(initialValues ?? EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (field: keyof ShippingDetails, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!values.shipping_name.trim()) next.shipping_name = 'Full name is required';
    if (!values.shipping_address.trim()) next.shipping_address = 'Address is required';
    if (!values.shipping_city.trim()) next.shipping_city = 'City is required';
    if (!values.shipping_country.trim()) next.shipping_country = 'Country is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      shipping_name: values.shipping_name.trim(),
      shipping_address: values.shipping_address.trim(),
      shipping_city: values.shipping_city.trim(),
      shipping_country: values.shipping_country.trim(),
    });
  };

  const inputClass = (field: keyof ShippingDetails) =>
    `w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Full name */}
        <div>
          <label htmlFor="shipping_name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <input
            id="shipping_name"
            type="text"
            autoComplete="name"
            value={values.shipping_name}
            onChange={(e) => set('shipping_name', e.target.value)}
            placeholder="Jane Doe"
            className={inputClass('shipping_name')}
          />
          {errors.shipping_name && (
            <p className="mt-1 text-xs text-red-600">{errors.shipping_name}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1.5">
            Street address
          </label>
          <input
            id="shipping_address"
            type="text"
            autoComplete="street-address"
            value={values.shipping_address}
            onChange={(e) => set('shipping_address', e.target.value)}
            placeholder="123 Main St"
            className={inputClass('shipping_address')}
          />
          {errors.shipping_address && (
            <p className="mt-1 text-xs text-red-600">{errors.shipping_address}</p>
          )}
        </div>

        {/* City + Country side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700 mb-1.5">
              City
            </label>
            <input
              id="shipping_city"
              type="text"
              autoComplete="address-level2"
              value={values.shipping_city}
              onChange={(e) => set('shipping_city', e.target.value)}
              placeholder="New York"
              className={inputClass('shipping_city')}
            />
            {errors.shipping_city && (
              <p className="mt-1 text-xs text-red-600">{errors.shipping_city}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping_country" className="block text-sm font-medium text-gray-700 mb-1.5">
              Country
            </label>
            <input
              id="shipping_country"
              type="text"
              autoComplete="country-name"
              value={values.shipping_country}
              onChange={(e) => set('shipping_country', e.target.value)}
              placeholder="USA"
              className={inputClass('shipping_country')}
            />
            {errors.shipping_country && (
              <p className="mt-1 text-xs text-red-600">{errors.shipping_country}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md mt-2"
        >
          Continue to Review
        </button>
      </form>
    </div>
  );
}
