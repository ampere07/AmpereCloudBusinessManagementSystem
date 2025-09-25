import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Trash2, ArrowRightToLine, Trash, XOctagon, RotateCw
} from 'lucide-react';
import { getApplication } from '../services/applicationService';
import { updateApplicationVisit } from '../services/applicationVisitService';
import ConfirmationModal from '../modals/MoveToJoModal';
import JOAssignFormModal from '../modals/JOAssignFormModal';
import { JobOrderData } from '../services/jobOrderService';

interface ApplicationVisitDetailsProps {
  applicationVisit: {
    id: string;
    application_id: string;
    scheduled_date?: string;
    visit_by?: string;
    visit_with?: string;
    visit_with_other?: string;
    visit_type?: string;
    visit_status?: string;
    visit_remarks?: string;
    visit_notes?: string;
    first_name: string;
    middle_initial?: string;
    last_name: string;
    contact_number: string;
    second_contact_number?: string;
    email_address: string;
    address: string;
    location?: string;
    barangay?: string;
    city?: string;
    region?: string;
    choose_plan?: string;
    installation_landmark?: string;
    assigned_email?: string;
    modified_by?: string;
    modified_date?: string;
    created_at?: string;
    updated_at?: string;
    application_status?: string;
    [key: string]: any;
  };
  onClose: () => void;
}

const ApplicationVisitDetails: React.FC<ApplicationVisitDetailsProps> = ({ applicationVisit, onClose }) => {
  const [applicationDetails, setApplicationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [showJOAssignForm, setShowJOAssignForm] = useState(false);

  // Fetch associated application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!applicationVisit.application_id) return;
      
      try {
        setLoading(true);
        const appData = await getApplication(applicationVisit.application_id);
        setApplicationDetails(appData);
      } catch (err: any) {
        console.error('Error fetching application details:', err);
        setError(`Failed to load application data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationVisit.application_id]);

  const handleMoveToJO = () => {
    setShowMoveConfirmation(true);
  };

  const handleConfirmMoveToJO = () => {
    setShowMoveConfirmation(false);
    setShowJOAssignForm(true);
  };

  const handleSaveJOForm = (formData: JobOrderData) => {
    console.log('Job Order saved successfully:', formData);
    console.log('Application Visit ID:', applicationVisit.id);
    // Job order has already been saved by the modal
    setShowJOAssignForm(false);
  };

  // Format the scheduled date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  // Create full name from components
  const getFullName = () => {
    return `${applicationVisit.first_name || ''} ${applicationVisit.middle_initial || ''} ${applicationVisit.last_name || ''}`.trim();
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setLoading(true);
      await updateApplicationVisit(applicationVisit.id, { 
        Status: newStatus,
        Modified_By: 'current_user@ampere.com' // In real app, this would be the logged-in user
        // The modified_date will be handled by the server
      });
      
      // Update local state to reflect the change
      applicationVisit.visit_status = newStatus;
      
      // Show success message
      alert(`Status updated to ${newStatus}`);
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-950 flex flex-col overflow-hidden border-l border-white border-opacity-30">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-white font-medium">{getFullName()}</h2>
          {loading && <div className="ml-3 animate-pulse text-orange-500 text-sm">Loading...</div>}
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="hover:text-white text-gray-400">
            <Trash2 size={16} />
          </button>
          <button 
            className="hover:text-white text-gray-400"
            onClick={handleMoveToJO}
            title="Move to Job Order"
          >
            <ArrowRightToLine size={16} />
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center">
            <Edit size={16} className="mr-1" />
            <span>Visit Status</span>
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
      
      {/* Status Buttons */}
      <div className="bg-gray-900 py-4 border-b border-gray-700 flex items-center justify-center space-x-8">
        <button 
          className="flex flex-col items-center text-center"
          onClick={() => handleStatusUpdate('Scheduled')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <Trash className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Scheduled</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center"
          onClick={() => handleStatusUpdate('Failed')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <XOctagon className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Failed</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-center"
          onClick={() => handleStatusUpdate('In Progress')}
          disabled={loading}
        >
          <div className="bg-orange-600 p-3 rounded-full">
            <RotateCw className="text-white" size={24} />
          </div>
          <span className="text-xs mt-1 text-gray-300">Visit In Progress</span>
        </button>
      </div>
      
      {/* Error message if any */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 p-3 m-3 rounded">
          {error}
        </div>
      )}
      
      {/* Application Visit Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto py-1 px-4 bg-gray-950">
          <div className="space-y-1">
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Application ID</div>
              <div className="text-white flex-1">{applicationVisit.application_id}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Scheduled Date</div>
              <div className="text-white flex-1">{formatDate(applicationVisit.scheduled_date)}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Name</div>
              <div className="text-white flex-1">{getFullName()}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Contact Number</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.contact_number || applicationDetails?.mobile_number || 'Not provided'}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Phone size={16} />
                </button>
                <button className="text-gray-400 hover:text-white ml-2">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Second Contact Number</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.second_contact_number || applicationDetails?.secondary_number || 'Not provided'}
                {applicationVisit.second_contact_number && (
                  <>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <Phone size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-white ml-2">
                      <MessageSquare size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Email Address</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.email_address || applicationDetails?.email || 'Not provided'}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Address</div>
              <div className="text-white flex-1">{applicationVisit.address || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Location</div>
              <div className="text-white flex-1">
                {[
                  applicationVisit.barangay, 
                  applicationVisit.city, 
                  applicationVisit.region
                ].filter(Boolean).join(', ') || 'Location not specified'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Chosen Plan</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.choose_plan || 'Not specified'}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Landmark</div>
              <div className="text-white flex-1">{applicationVisit.installation_landmark || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit By</div>
              <div className="text-white flex-1">{applicationVisit.visit_by || 'Not assigned'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit With</div>
              <div className="text-white flex-1">
                {applicationVisit.visit_with === 'Other' 
                  ? (applicationVisit.visit_with_other || 'Other (not specified)') 
                  : (applicationVisit.visit_with || 'None')}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Type</div>
              <div className="text-white flex-1">{applicationVisit.visit_type || 'Initial Visit'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Status</div>
              <div className={`text-${applicationVisit.visit_status?.toLowerCase() === 'completed' ? 'green' : 'orange'}-500 flex-1`}>
                {applicationVisit.visit_status || 'Scheduled'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Notes</div>
              <div className="text-white flex-1">{applicationVisit.visit_notes || 'No notes'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Assigned Email</div>
              <div className="text-white flex-1 flex items-center">
                {applicationVisit.assigned_email || 'Not assigned'}
                {applicationVisit.assigned_email && (
                  <button className="ml-2 text-gray-400">
                    <Mail size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Application Status</div>
              <div className={`text-${applicationVisit.application_status?.toLowerCase() === 'approved' ? 'green' : 'yellow'}-500 flex-1`}>
                {applicationVisit.application_status || applicationDetails?.status || 'Pending'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Modified By</div>
              <div className="text-white flex-1">{applicationVisit.modified_by || 'Not modified'}</div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Modified Date</div>
              <div className="text-white flex-1">
                {applicationVisit.modified_date || 
                 (applicationVisit.updated_at ? new Date(applicationVisit.updated_at).toLocaleString() : 'Not modified')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use the ConfirmationModal component */}
      <ConfirmationModal
        isOpen={showMoveConfirmation}
        title="Confirm"
        message="Are you sure you want to move this application to JO?"
        confirmText="Move to JO"
        cancelText="Cancel"
        onConfirm={handleConfirmMoveToJO}
        onCancel={() => setShowMoveConfirmation(false)}
      />

      {/* Use the JOAssignFormModal component */}
      <JOAssignFormModal
        isOpen={showJOAssignForm}
        onClose={() => setShowJOAssignForm(false)}
        onSave={handleSaveJOForm}
        applicationData={{
          id: applicationVisit.application_id,
          first_name: applicationVisit.first_name,
          middle_initial: applicationVisit.middle_initial,
          last_name: applicationVisit.last_name,
          email: applicationVisit.email_address,
          mobile: applicationVisit.contact_number,
          mobile_alt: applicationVisit.second_contact_number,
          address_line: applicationVisit.address,
          barangay: applicationVisit.barangay,
          city: applicationVisit.city,
          region: applicationVisit.region,
          plan_id: applicationVisit.choose_plan,
          landmark: applicationVisit.installation_landmark,
        }}
      />
    </div>
  );
};

export default ApplicationVisitDetails;