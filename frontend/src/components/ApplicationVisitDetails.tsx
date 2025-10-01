import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Trash2, ArrowRightToLine, Trash, XOctagon, RotateCw
} from 'lucide-react';
import { getApplication } from '../services/applicationService';
import { updateApplicationVisit } from '../services/applicationVisitService';
import ConfirmationModal from '../modals/MoveToJoModal';
import JOAssignFormModal from '../modals/JOAssignFormModal';
import ApplicationVisitStatusModal from '../modals/ApplicationVisitStatusModal';
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
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [currentVisitData, setCurrentVisitData] = useState(applicationVisit);

  // Update current visit data when applicationVisit prop changes
  useEffect(() => {
    setCurrentVisitData(applicationVisit);
  }, [applicationVisit]);

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

  const handleEditVisit = () => {
    setShowEditStatusModal(true);
  };

  const handleSaveEditedVisit = (updatedVisit: any) => {
    console.log('Visit details updated successfully:', updatedVisit);
    // Update the current visit data with the new information
    setCurrentVisitData({ ...currentVisitData, ...updatedVisit });
    setShowEditStatusModal(false);
    // You might want to trigger a refresh of the parent component here
    // or call a callback prop to notify the parent of the update
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
    return `${currentVisitData.first_name || ''} ${currentVisitData.middle_initial || ''} ${currentVisitData.last_name || ''}`.trim();
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setLoading(true);
      await updateApplicationVisit(applicationVisit.id, { 
        visit_status: newStatus,
        updated_by_user_id: null
      });
      
      setCurrentVisitData({ ...currentVisitData, visit_status: newStatus });
      
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
          <button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center"
            onClick={handleEditVisit}
            title="Edit Visit Details"
          >
            <Edit size={16} className="mr-1" />
            <span>Edit Visit</span>
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
              <div className="w-40 text-gray-400 text-sm">Timestamp</div>
              <div className="text-white flex-1">{formatDate(currentVisitData.created_at) || 'Not available'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Referred By</div>
              <div className="text-white flex-1">{currentVisitData.referred_by || 'Not specified'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Full Name</div>
              <div className="text-white flex-1">{getFullName()}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Contact Number</div>
              <div className="text-white flex-1 flex items-center">
                {currentVisitData.contact_number || applicationDetails?.mobile_number || 'Not provided'}
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
                {currentVisitData.second_contact_number || applicationDetails?.secondary_number || 'Not provided'}
                {currentVisitData.second_contact_number && (
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
                {currentVisitData.email_address || applicationDetails?.email || 'Not provided'}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Address</div>
              <div className="text-white flex-1">{currentVisitData.address || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Location</div>
              <div className="text-white flex-1">
                {[
                  currentVisitData.barangay, 
                  currentVisitData.city, 
                  currentVisitData.region
                ].filter(Boolean).join(', ') || 'Location not specified'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Chosen Plan</div>
              <div className="text-white flex-1 flex items-center">
                {currentVisitData.choose_plan || 'Not specified'}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Landmark</div>
              <div className="text-white flex-1">{currentVisitData.installation_landmark || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit By</div>
              <div className="text-white flex-1">{currentVisitData.visit_by || 'Not assigned'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit With</div>
              <div className="text-white flex-1">
                {currentVisitData.visit_with === 'Other' 
                  ? (currentVisitData.visit_with_other || 'Other (not specified)') 
                  : (currentVisitData.visit_with || 'None')}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Type</div>
              <div className="text-white flex-1">{currentVisitData.visit_type || 'Initial Visit'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Status</div>
              <div className={`text-${currentVisitData.visit_status?.toLowerCase() === 'completed' ? 'green' : 'orange'}-500 flex-1`}>
                {currentVisitData.visit_status || 'Scheduled'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Notes</div>
              <div className="text-white flex-1">{currentVisitData.visit_notes || 'No notes'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Assigned Email</div>
              <div className="text-white flex-1 flex items-center">
                {currentVisitData.assigned_email || 'Not assigned'}
                {currentVisitData.assigned_email && (
                  <button className="ml-2 text-gray-400">
                    <Mail size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Application Status</div>
              <div className={`text-${currentVisitData.application_status?.toLowerCase() === 'approved' ? 'green' : 'yellow'}-500 flex-1`}>
                {currentVisitData.application_status || applicationDetails?.status || 'Pending'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Modified By</div>
              <div className="text-white flex-1">{currentVisitData.modified_by || 'Not modified'}</div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Modified Date</div>
              <div className="text-white flex-1">
                {currentVisitData.modified_date || 
                 (currentVisitData.updated_at ? new Date(currentVisitData.updated_at).toLocaleString() : 'Not modified')}
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
          id: currentVisitData.application_id,
          first_name: currentVisitData.first_name,
          middle_initial: currentVisitData.middle_initial,
          last_name: currentVisitData.last_name,
          email: currentVisitData.email_address,
          mobile: currentVisitData.contact_number,
          mobile_alt: currentVisitData.second_contact_number,
          address_line: currentVisitData.address,
          barangay: currentVisitData.barangay,
          city: currentVisitData.city,
          region: currentVisitData.region,
          plan_id: currentVisitData.choose_plan,
          landmark: currentVisitData.installation_landmark,
        }}
      />

      {/* Use the ApplicationVisitStatusModal component */}
      <ApplicationVisitStatusModal
        isOpen={showEditStatusModal}
        onClose={() => setShowEditStatusModal(false)}
        onSave={handleSaveEditedVisit}
        visitData={{
          id: currentVisitData.id,
          first_name: currentVisitData.first_name,
          middle_initial: currentVisitData.middle_initial,
          last_name: currentVisitData.last_name,
          contact_number: currentVisitData.contact_number,
          second_contact_number: currentVisitData.second_contact_number,
          email_address: currentVisitData.email_address,
          address: currentVisitData.address,
          barangay: currentVisitData.barangay,
          city: currentVisitData.city,
          region: currentVisitData.region,
          choose_plan: currentVisitData.choose_plan,
          visit_remarks: currentVisitData.visit_remarks,
          status_remarks: currentVisitData.status_remarks,
          visit_notes: currentVisitData.visit_notes,
          assigned_email: currentVisitData.assigned_email,
          visit_by: currentVisitData.visit_by,
          visit_with: currentVisitData.visit_with,
          visit_with_other: currentVisitData.visit_with_other,
          application_status: currentVisitData.application_status,
          visit_status: currentVisitData.visit_status
        }}
      />
    </div>
  );
};

export default ApplicationVisitDetails;