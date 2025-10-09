import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Maximize2, X, Phone, MessageSquare, Info, 
  ExternalLink, Mail, Edit, Trash2, ArrowRightToLine, Eraser, XOctagon, RotateCw
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
    timestamp?: string;
    assigned_email?: string;
    visit_by_user_id?: string;
    visit_with?: string;
    visit_status?: string;
    visit_remarks?: string;
    application_status?: string;
    full_name: string;
    full_address: string;
    referred_by?: string;
    updated_by_user_email: string;
    created_at?: string;
    updated_at?: string;
    first_name?: string;
    middle_initial?: string;
    last_name?: string;
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
  const [userRole, setUserRole] = useState<string>('');

  // Get user role from localStorage
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        setUserRole(user.role?.toLowerCase() || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

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

  const getFullName = () => {
    return currentVisitData.full_name || `${currentVisitData.first_name || ''} ${currentVisitData.middle_initial || ''} ${currentVisitData.last_name || ''}`.trim();
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string | null) => {
    try {
      setLoading(true);
      setError(null);
      
      const authData = localStorage.getItem('authData');
      let updatedByEmail = null;
      
      if (authData) {
        try {
          const user = JSON.parse(authData);
          updatedByEmail = user.email;
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }
      
      await updateApplicationVisit(applicationVisit.id, { 
        visit_status: newStatus,
        updated_by_user_email: updatedByEmail
      });
      
      setCurrentVisitData({ ...currentVisitData, visit_status: newStatus || '' });
      
      const statusMessage = newStatus ? `Status updated to ${newStatus}` : 'Status cleared successfully';
      alert(statusMessage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(`Failed to update status: ${errorMessage}`);
      console.error('Status update error:', err);
      console.error('Error response:', err.response?.data);
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
          {userRole !== 'technician' && userRole === 'administrator' && (
            <>
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
            </>
          )}
          <button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-sm flex items-center"
            onClick={handleEditVisit}
            title="Edit Visit Details"
          >
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
      
      {/* Status Buttons - Only visible for administrators */}
      {userRole !== 'technician' && userRole === 'administrator' && (
        <div className="bg-gray-900 py-4 border-b border-gray-700 flex items-center justify-center space-x-8">
          <button 
            className="flex flex-col items-center text-center hover:opacity-80 transition-opacity"
            onClick={() => handleStatusUpdate(null)}
            disabled={loading}
            title="Clear status and reset to default"
          >
            <div className={`p-3 rounded-full ${loading ? 'bg-gray-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
              <Eraser className="text-white" size={24} />
            </div>
            <span className="text-xs mt-1 text-gray-300">Clear Status</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-center hover:opacity-80 transition-opacity"
            onClick={() => handleStatusUpdate('Failed')}
            disabled={loading}
            title="Mark visit as failed"
          >
            <div className={`p-3 rounded-full ${loading ? 'bg-gray-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
              <XOctagon className="text-white" size={24} />
            </div>
            <span className="text-xs mt-1 text-gray-300">Failed</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-center hover:opacity-80 transition-opacity"
            onClick={() => handleStatusUpdate('In Progress')}
            disabled={loading}
            title="Mark visit as in progress"
          >
            <div className={`p-3 rounded-full ${loading ? 'bg-gray-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
              <RotateCw className="text-white" size={24} />
            </div>
            <span className="text-xs mt-1 text-gray-300">Visit In Progress</span>
          </button>
        </div>
      )}
      
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
                {applicationDetails?.mobile_number || 'Not provided'}
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
                {applicationDetails?.secondary_mobile_number || 'Not provided'}
                {applicationDetails?.secondary_mobile_number && (
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
                {applicationDetails?.email_address || 'Not provided'}
                <button className="text-gray-400 hover:text-white ml-2">
                  <Mail size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Address</div>
              <div className="text-white flex-1">{currentVisitData.full_address || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Chosen Plan</div>
              <div className="text-white flex-1 flex items-center">
                {applicationDetails?.desired_plan || 'Not specified'}
                <button className="ml-2 text-gray-400">
                  <Info size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Landmark</div>
              <div className="text-white flex-1">{applicationDetails?.landmark || 'Not provided'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit By</div>
              <div className="text-white flex-1">{currentVisitData.visit_by_user_id || 'Not assigned'}</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit With</div>
              <div className="text-white flex-1">
                {currentVisitData.visit_with || 'None'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Type</div>
              <div className="text-white flex-1">Initial Visit</div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Status</div>
              <div className={`flex-1 ${
                currentVisitData.visit_status?.toLowerCase() === 'completed' ? 'text-green-500' :
                currentVisitData.visit_status?.toLowerCase() === 'failed' ? 'text-red-500' :
                currentVisitData.visit_status?.toLowerCase() === 'in progress' ? 'text-blue-500' :
                'text-orange-500'
              }`}>
                {currentVisitData.visit_status || 'Scheduled'}
              </div>
            </div>
            
            <div className="flex border-b border-gray-800 py-2">
              <div className="w-40 text-gray-400 text-sm">Visit Notes</div>
              <div className="text-white flex-1">{currentVisitData.visit_remarks || 'No notes'}</div>
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
              <div className="text-white flex-1">{currentVisitData.updated_by_user_email || 'System'}</div>
            </div>
            
            <div className="flex py-2">
              <div className="w-40 text-gray-400 text-sm">Modified Date</div>
              <div className="text-white flex-1">
                {formatDate(currentVisitData.updated_at) || 'Not modified'}
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
          referred_by: applicationDetails?.referred_by || currentVisitData.referred_by,
          first_name: applicationDetails?.first_name || currentVisitData.first_name,
          middle_initial: applicationDetails?.middle_initial || currentVisitData.middle_initial,
          last_name: applicationDetails?.last_name || currentVisitData.last_name,
          email_address: applicationDetails?.email_address,
          mobile_number: applicationDetails?.mobile_number,
          secondary_mobile_number: applicationDetails?.secondary_mobile_number,
          installation_address: applicationDetails?.installation_address,
          barangay: applicationDetails?.barangay,
          city: applicationDetails?.city,
          region: applicationDetails?.region,
          desired_plan: applicationDetails?.desired_plan,
          landmark: applicationDetails?.landmark,
        }}
      />

      {/* Use the ApplicationVisitStatusModal component */}
      <ApplicationVisitStatusModal
        isOpen={showEditStatusModal}
        onClose={() => setShowEditStatusModal(false)}
        onSave={handleSaveEditedVisit}
        visitData={{
          id: currentVisitData.id,
          first_name: applicationDetails?.first_name || currentVisitData.first_name || '',
          middle_initial: applicationDetails?.middle_initial || currentVisitData.middle_initial || '',
          last_name: applicationDetails?.last_name || currentVisitData.last_name || '',
          contact_number: applicationDetails?.mobile_number || '',
          second_contact_number: applicationDetails?.secondary_mobile_number || '',
          email_address: applicationDetails?.email_address || '',
          address: currentVisitData.full_address || '',
          barangay: applicationDetails?.barangay || '',
          city: applicationDetails?.city || '',
          region: applicationDetails?.region || '',
          choose_plan: applicationDetails?.desired_plan || '',
          visit_remarks: currentVisitData.visit_remarks || '',
          status_remarks: currentVisitData.status_remarks || '',
          visit_notes: currentVisitData.visit_remarks || '',
          assigned_email: currentVisitData.assigned_email || '',
          visit_by: currentVisitData.visit_by_user_id || '',
          visit_with: currentVisitData.visit_with || '',
          visit_with_other: '',
          application_status: currentVisitData.application_status || '',
          visit_status: currentVisitData.visit_status || ''
        }}
      />
    </div>
  );
};

export default ApplicationVisitDetails;