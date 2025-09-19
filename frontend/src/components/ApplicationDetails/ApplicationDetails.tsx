import React from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Newspaper, ArrowRightFromLine, Clock, 
  Timer, XCircle, RotateCw, Copy, CheckCircle
} from 'lucide-react';

interface ApplicationDetailsProps {
  application: {
    id: string;
    timestamp: string;
    fullName: string;
    assignedEmail: string;
    visitStatus: string;
    applicationStatus: string;
    statusRemarks: string;
    referredBy: string;
    fullAddress: string;
    visitBy: string;
    visitWith: string;
    visitWithOther: string;
    visitRemarks: string;
    modifiedDate: string;
    modifiedBy: string;
    location: string;
    email?: string;
    mobileNumber?: string;
    secondaryMobileNumber?: string;
    desiredPlan?: string;
    governmentId?: string;
    agreementStatus?: string;
    userEmail?: string;
    houseFrontPicture?: string;
    promo?: string;
  };
  onClose: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ application, onClose }) => {
  // Mock data based on the provided image
  const mockApplication = {
    ...application,
    referredBy: 'Precious Ann Vergonio',
    applicationStatus: 'Schedule',
    timestamp: '9/18/2025 6:20:09 PM',
    fullName: 'JUMER A REPTIN',
    fullAddress: '0097 J SUMULONG ST SAUDI VILLAGE BRGY LUNSAD BINANGONAN RIZAL, Lunsad, Binangonan, Rizal',
    email: 'jumerreptin92@gmail.com',
    mobileNumber: '9853910967',
    secondaryMobileNumber: '9121488743',
    desiredPlan: 'SwitchConnect - P799',
    governmentId: 'https://drive.google.com/open?id=1gA4...',
    agreementStatus: 'Yes, I Agree',
    userEmail: 'ravenampere0123@gmail.com',
    houseFrontPicture: 'https://drive.google.com/open?id=1-rv-a...',
    promo: 'None'
  };
  
  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">JUMER</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-transparent text-gray-400 hover:text-white p-1 rounded">
            <Newspaper size={20} />
          </button>
          <button className="bg-transparent text-gray-400 hover:text-white p-1 rounded">
            <ArrowRightFromLine size={20} />
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center">
            <Clock size={16} className="mr-1" />
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
      <div className="bg-gray-900 py-4 border-b border-gray-700 flex items-center justify-center space-x-8">
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <Timer className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">No Facility</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <XCircle className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Cancelled</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <RotateCw className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">No Slot</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <Copy className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Duplicate</span>
        </button>
        
        <button className="flex flex-col items-center text-center">
          <div className="bg-orange-600 p-3 rounded-full">
            <CheckCircle className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Clear Status</span>
        </button>
      </div>
      
      {/* Application Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto py-1 px-4 bg-gray-950">
          <div className="space-y-1">
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Referred by:</div>
              <div className="text-white flex-1">Precious Ann Vergonio</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Status</div>
              <div className="text-green-500 flex-1">Schedule</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Timestamp</div>
              <div className="text-white flex-1">9/18/2025 6:20:09 PM</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Name</div>
              <div className="text-white flex-1">JUMER A REPTIN</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Address</div>
              <div className="text-white flex-1">0097 J SUMULONG ST SAUDI VILLAGE BRGY LUNSAD BINANGONAN RIZAL, Lunsad, Binangonan, Rizal</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Email Address</div>
              <div className="text-white flex-1">jumerreptin92@gmail.com</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Mobile Number</div>
              <div className="text-white flex-1 flex items-center">
                9853910967
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Secondary Mobile Number</div>
              <div className="text-white flex-1 flex items-center">
                9121488743
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Desired Plan</div>
              <div className="text-white flex-1 flex items-center">
                SwitchConnect - P799
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Government Valid ID</div>
              <div className="text-white flex-1 truncate flex items-center">
                https://drive.google.com/open?id=1gA4...
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">I agree to the terms and conditions</div>
              <div className="text-white flex-1">Yes, I Agree</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">User Email</div>
              <div className="text-white flex-1 flex items-center">
                ravenampere0123@gmail.com
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">House Front Picture</div>
              <div className="text-white flex-1 truncate flex items-center">
                https://drive.google.com/open?id=1-rv-a...
                <button className="text-gray-400 hover:text-white ml-2">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Select the applicable promo</div>
              <div className="text-white flex-1">None</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;