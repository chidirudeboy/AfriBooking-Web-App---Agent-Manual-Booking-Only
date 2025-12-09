'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import apiClient, { endpoints } from '@/lib/api';

interface Apartment {
  _id: string;
  apartmentName: string;
  address: string;
  city: string;
  beds: number;
}

export default function AddManualBookingPage() {
  return (
    <ProtectedRoute>
      <AddManualBookingContent />
    </ProtectedRoute>
  );
}

function AddManualBookingContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    selectedApartment: '',
    name: '',
    phoneNumber: '',
    address: '',
    actualPrice: '',
    sellingPrice: '',
  });

  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setApartmentsLoading(true);
      const response = await apiClient.get(endpoints.getApartments);
      if (response.data?.apartments) {
        setApartments(response.data.apartments);
      }
    } catch (error: any) {
      console.error('Error fetching apartments:', error);
      setError('Failed to load apartments. Please refresh the page.');
    } finally {
      setApartmentsLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parsePrice = (formatted: string) => {
    return formatted.replace(/[^0-9]/g, '');
  };

  const handlePriceChange = (field: 'actualPrice' | 'sellingPrice', value: string) => {
    // Remove all non-numeric characters first
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setInvoiceFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setInvoiceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return false;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkIn >= checkOut) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    if (!formData.selectedApartment) {
      setError('Please select an apartment');
      return false;
    }

    if (!formData.actualPrice || !formData.sellingPrice) {
      setError('Please enter both actual and selling prices');
      return false;
    }

    const actualPriceNum = parseFloat(formData.actualPrice);
    const sellingPriceNum = parseFloat(formData.sellingPrice);

    if (isNaN(actualPriceNum) || actualPriceNum <= 0) {
      setError('Please enter a valid actual price');
      return false;
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      setError('Please enter a valid selling price');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    if (!user?._id && !user?.id) {
      setError('User authentication required');
      return;
    }

    try {
      setLoading(true);
      const userId = user._id || user.id;

      const selectedApartment = apartments.find(
        (apt) => apt._id === formData.selectedApartment
      );

      if (!selectedApartment) {
        setError('Selected apartment is invalid');
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append('checkInDate', new Date(formData.checkInDate).toISOString());
      submitFormData.append('checkOutDate', new Date(formData.checkOutDate).toISOString());
      submitFormData.append('propertyId', formData.selectedApartment);
      submitFormData.append('actualPrice', formData.actualPrice);
      submitFormData.append('sellingPrice', formData.sellingPrice);
      submitFormData.append('clientDetails[apartmentName]', selectedApartment.apartmentName);

      if (formData.name) {
        submitFormData.append('clientDetails[name]', formData.name.trim());
      }
      if (formData.phoneNumber) {
        submitFormData.append('clientDetails[phoneNumber]', formData.phoneNumber.trim());
      }
      if (formData.address) {
        submitFormData.append('clientDetails[address]', formData.address.trim());
      }

      // Append invoice files
      invoiceFiles.forEach((file) => {
        submitFormData.append('invoice', file);
      });

      const response = await apiClient.post(endpoints.addManualBooking(userId), submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess('Booking created successfully!');
        // Reset form
        setFormData({
          checkInDate: '',
          checkOutDate: '',
          selectedApartment: '',
          name: '',
          phoneNumber: '',
          address: '',
          actualPrice: '',
          sellingPrice: '',
        });
        setInvoiceFiles([]);
        // Optionally redirect after a delay
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } catch (error: any) {
      console.error('Booking submission error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create booking. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actualPriceNum = parseFloat(formData.actualPrice) || 0;
  const sellingPriceNum = parseFloat(formData.sellingPrice) || 0;
  const profit = sellingPriceNum - actualPriceNum;
  const profitMargin = actualPriceNum > 0 ? ((profit / actualPriceNum) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-auto">
                <Image 
                  src="/logo.png" 
                  alt="AfriBooking Logo" 
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Manual Booking</h1>
                <p className="text-sm text-gray-600 mt-1">Create a new booking for your client</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  required
                  value={formData.checkInDate}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, checkInDate: e.target.value }));
                    // Reset checkout if it's before new checkin
                    if (formData.checkOutDate && new Date(e.target.value) >= new Date(formData.checkOutDate)) {
                      setFormData((prev) => ({ ...prev, checkOutDate: '' }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  id="checkOutDate"
                  required
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, checkOutDate: e.target.value }))}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  disabled={!formData.checkInDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Details</h2>
            <p className="text-sm text-gray-600 mb-4">Optional information about your client</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client's full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter client's address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Apartment *
                </label>
                {apartmentsLoading ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading apartments...</span>
                  </div>
                ) : apartments.length === 0 ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-center text-gray-600">
                    No apartments available
                  </div>
                ) : (
                  <select
                    id="apartment"
                    required
                    value={formData.selectedApartment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, selectedApartment: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
                  >
                    <option value="">Select an apartment</option>
                    {apartments.map((apt) => (
                      <option key={apt._id} value={apt._id}>
                        {apt.apartmentName} - {apt.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="actualPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Cost Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="text"
                    id="actualPrice"
                    required
                    value={formatPrice(formData.actualPrice)}
                    onChange={(e) => handlePriceChange('actualPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="text"
                    id="sellingPrice"
                    required
                    value={formatPrice(formData.sellingPrice)}
                    onChange={(e) => handlePriceChange('sellingPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
              </div>
              {actualPriceNum > 0 && sellingPriceNum > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Profit Margin: <span className="font-semibold text-gray-900">₦{profit.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{profitMargin}% markup</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice & Documents</h2>
            <p className="text-sm text-gray-600 mb-4">Upload invoices or other relevant documents</p>

            {invoiceFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {invoiceFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate w-24">{file.name}</p>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Multiple files allowed)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Booking...
                </span>
              ) : (
                'Create Booking'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

