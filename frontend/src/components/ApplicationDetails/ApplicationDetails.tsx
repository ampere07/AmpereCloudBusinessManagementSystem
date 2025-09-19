import React from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Newspaper, ArrowRightFromLine, Clock
} from 'lucide-react';

interface ApplicationDetailsProps {
  application: {
    id: string;
    name: string;
    date: string;
    time: string;
    address: string;
    location: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    email?: string;
    mobileNumber?: string;
    secondaryMobileNumber?: string;
    desiredPlan?: string;
    governmentId?: string;
    agreementStatus?: string;
    userEmail?: string;
    houseFrontPicture?: string;
    referredBy?: string;
    promo?: string;
  };
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application, onClose }) => {
  // Default values if missing from the application object
  const defaultApplication = {
    ...application,
    email: application.email || 'john.doe@example.com',
    mobileNumber: application.mobileNumber || '9123456789',
    secondaryMobileNumber: application.secondaryMobileNumber || '9876543210',
    desiredPlan: application.desiredPlan || 'AmpereMax - P1299',
    governmentId: application.governmentId || 'https://drive.google.com/open?id=abc123...',
    agreementStatus: application.agreementStatus || 'Yes, I Agree',
    userEmail: application.userEmail || 'admin@amperecloud.com',
    houseFrontPicture: application.houseFrontPicture || 'https://drive.google.com/open?id=xyz789...',
    referredBy: application.referredBy || 'Jane Smith',
    promo: application.promo || 'New Customer Discount'
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time} PM`;
  };
  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">JOHN</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 flex items-center justify-center border border-gray-700">
            <Newspaper size={18} />
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 flex items-center justify-center border border-gray-700">
            <ArrowRightFromLine size={18} />
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center">
            <Clock size={16} className="mr-2" />
            <span>Schedule</span>
          </button>
          <button className="hover:text-white text-gray-400"><ArrowLeft size={16} /></button>
          <button className="hover:text-white text-gray-400"><ArrowRight size={16} /></button>
          <button className="hover:text-white text-gray-400"><Maximize2 size={16} /></button>
          <button 
            onClick={onClose}
            className="hover:text-white text-gray-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-gray-900 py-5 border-b border-gray-700 flex items-center justify-center space-x-8">
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">No Facility</span>
        </button>
        
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">Cancelled</span>
        </button>
        
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">No Slot</span>
        </button>
        
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">Duplicate</span>
        </button>
        
        <button className="flex flex-col items-center text-center p-2 rounded-md">
          <div className="bg-orange-600 p-2 rounded-full">
            <div className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-300">Clear Status</span>
        </button>
      </div>
      
      {/* Application Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-6 px-4 bg-gray-950">
          <div className="space-y-4">
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Referred by:</div>
              <div className="text-white flex-1">Jane Smith</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Timestamp:</div>
              <div className="text-white flex-1">09/19/2025 10:35:22 PM</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Name:</div>
              <div className="text-white flex-1">JOHN H DOE</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Full Address:</div>
              <div className="text-white flex-1">123 MAIN STREET SAMPLE SUBDIVISION BRGY EXAMPLE
ANYTOWN CITY, Sample Province</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Email Address:</div>
              <div className="text-white flex-1">{defaultApplication.email}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Mobile Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.mobileNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Secondary Mobile Number:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.secondaryMobileNumber}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Desired Plan:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.desiredPlan}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">Government Valid ID:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {defaultApplication.governmentId}
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">I agree to the terms and conditions:</div>
              <div className="text-white flex-1">{defaultApplication.agreementStatus}</div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">User Email:</div>
              <div className="text-white flex-1 flex items-center">
                {defaultApplication.userEmail}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 pb-4">
              <div className="w-40 text-gray-400 text-sm">House Front Picture:</div>
              <div className="text-white flex-1 truncate flex items-center">
                {defaultApplication.houseFrontPicture}
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex pb-4">
              <div className="w-40 text-gray-400 text-sm">Select the applicable promo:</div>
              <div className="text-white flex-1">{defaultApplication.promo}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;