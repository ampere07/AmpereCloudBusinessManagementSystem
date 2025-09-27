import React, { useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import axios from "axios";

// Type declaration for react-signature-canvas
interface SignatureCanvasProps {
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  onEnd?: () => void;
  clear: () => void;
  toDataURL: (type?: string, encoderOptions?: number) => string;
}

// Since we don't have the actual package, we'll create a mock component
const SignatureCanvas = React.forwardRef<SignatureCanvasProps, { canvasProps: any; onEnd: () => void }>(
  (props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    React.useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
      toDataURL: (type = 'image/png', encoderOptions = 0.92) => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL(type, encoderOptions);
        }
        return '';
      }
    }));

    return (
      <canvas 
        ref={canvasRef}
        {...props.canvasProps}
        onMouseUp={props.onEnd}
        onTouchEnd={props.onEnd}
      />
    );
  }
);

// Define response data interface
interface ApiResponse {
  success: boolean;
  jobOrder: any;
  message?: string;
}

interface JobOrderDoneFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  jobOrderData: any;
  onSave: (updatedData: any) => void;
}

const JobOrderDoneFormModal: React.FC<JobOrderDoneFormModalProps> = ({
  isVisible,
  onClose,
  jobOrderData,
  onSave,
}) => {
  // Define proper types for form data
  interface FormData {
    onsite_status: "Done" | "Failed" | "In Progress" | "Reschedule";
    onsite_remarks: string;
    // Fields for Done status
    signed_contract_image: File | string | null;
    setup_image: File | string | null;
    box_reading_image: File | string | null;
    router_reading_image: File | string | null;
    client_signature: string | null;
    // Fields for Failed/In Progress status
    modified_by: string;
    modified_date: string;
    contract_link: string;
    contract_template: number;
    // Failed specific fields
    status_remarks: string;
    // In Progress specific fields
    assigned_email: string;
  }

  const [formData, setFormData] = useState<FormData>({
    onsite_status: "Done",
    onsite_remarks: "",
    // Done status fields
    signed_contract_image: null,
    setup_image: null,
    box_reading_image: null,
    router_reading_image: null,
    client_signature: null,
    // Failed/In Progress status fields
    modified_by: "ravenampere0123@gmail.com",
    modified_date: new Date().toLocaleString(),
    contract_link: "",
    contract_template: 1,
    // Failed specific fields
    status_remarks: "",
    // In Progress specific fields
    assigned_email: "Office",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sigCanvas, setSigCanvas] = useState<SignatureCanvasProps | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isVisible && jobOrderData) {
      // Initialize form with existing data if available
      setFormData({
        onsite_status: jobOrderData.onsite_status || "Done",
        onsite_remarks: jobOrderData.onsite_remarks || "",
        // Done status fields
        signed_contract_image: jobOrderData.signed_contract_image || null,
        setup_image: jobOrderData.setup_image || null,
        box_reading_image: jobOrderData.box_reading_image || null,
        router_reading_image: jobOrderData.router_reading_image || null,
        client_signature: jobOrderData.client_signature || null,
        // Failed/In Progress status fields
        modified_by: jobOrderData.modified_by || "ravenampere0123@gmail.com",
        modified_date: jobOrderData.modified_date || new Date().toLocaleString(),
        contract_link: jobOrderData.contract_link || "",
        contract_template: jobOrderData.contract_template || 1,
        // Failed specific fields
        status_remarks: jobOrderData.status_remarks || "",
        // In Progress specific fields
        assigned_email: jobOrderData.assigned_email || "Office",
      });
    }
  }, [isVisible, jobOrderData]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.onsite_remarks.trim()) {
      newErrors.onsite_remarks = "This entry is required";
    }
    
    if (formData.onsite_status === "Done") {
      // Validate fields for "Done" status
      if (!formData.signed_contract_image) {
        newErrors.signed_contract_image = "This entry is required";
      }
      
      if (!formData.setup_image) {
        newErrors.setup_image = "This entry is required";
      }
      
      if (!formData.box_reading_image) {
        newErrors.box_reading_image = "This entry is required";
      }
      
      if (!formData.router_reading_image) {
        newErrors.router_reading_image = "This entry is required";
      }
      
      if (!formData.client_signature) {
        newErrors.client_signature = "This entry is required";
      }
    } else if (formData.onsite_status === "Failed") {
      // Validate fields for "Failed" status
      if (!formData.status_remarks) {
        newErrors.status_remarks = "This entry is required";
      }
    } else if (formData.onsite_status === "In Progress") {
      // Validate fields for "In Progress" status
      if (!formData.assigned_email) {
        newErrors.assigned_email = "This entry is required";
      }
    } else if (formData.onsite_status === "Reschedule") {
      // Validate fields for "Reschedule" status
      if (!formData.assigned_email) {
        newErrors.assigned_email = "This entry is required";
      }
      
      if (!formData.status_remarks) {
        newErrors.status_remarks = "This entry is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleStatusChange = (status: "Done" | "Failed" | "In Progress" | "Reschedule") => {
    setFormData({
      ...formData,
      onsite_status: status,
    });
  };
  
  const handleNumberChange = (name: string, value: number) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleImageUpload = (name: string, file: File) => {
    setFormData({
      ...formData,
      [name]: file,
    });
  };
  
  const handleSignature = () => {
    if (sigCanvas) {
      const signatureData = sigCanvas.toDataURL();
      setFormData({
        ...formData,
        client_signature: signatureData,
      });
    }
  };
  
  const clearSignature = () => {
    if (sigCanvas) {
      sigCanvas.clear();
      setFormData({
        ...formData,
        client_signature: null,
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Create form data for file uploads
      const submitData = new FormData();
      submitData.append("onsite_status", formData.onsite_status);
      submitData.append("onsite_remarks", formData.onsite_remarks);
      
      if (formData.onsite_status === "Done") {
        // Add fields for "Done" status
        if (formData.signed_contract_image instanceof File) {
          submitData.append("signed_contract_image", formData.signed_contract_image);
        }
        
        if (formData.setup_image instanceof File) {
          submitData.append("setup_image", formData.setup_image);
        }
        
        if (formData.box_reading_image instanceof File) {
          submitData.append("box_reading_image", formData.box_reading_image);
        }
        
        if (formData.router_reading_image instanceof File) {
          submitData.append("router_reading_image", formData.router_reading_image);
        }
        
        if (formData.client_signature) {
          submitData.append("client_signature", formData.client_signature);
        }
      } else if (formData.onsite_status === "Failed") {
        // Add fields for "Failed" status
        submitData.append("modified_by", formData.modified_by);
        submitData.append("modified_date", formData.modified_date);
        submitData.append("contract_link", formData.contract_link);
        submitData.append("contract_template", formData.contract_template.toString());
        submitData.append("status_remarks", formData.status_remarks);
      } else if (formData.onsite_status === "In Progress") {
        // Add fields for "In Progress" status
        submitData.append("modified_by", formData.modified_by);
        submitData.append("modified_date", formData.modified_date);
        submitData.append("contract_link", formData.contract_link);
        submitData.append("contract_template", formData.contract_template.toString());
        submitData.append("assigned_email", formData.assigned_email);
      } else if (formData.onsite_status === "Reschedule") {
        // Add fields for "Reschedule" status
        submitData.append("modified_by", formData.modified_by);
        submitData.append("modified_date", formData.modified_date);
        submitData.append("contract_link", formData.contract_link);
        submitData.append("contract_template", formData.contract_template.toString());
        submitData.append("assigned_email", formData.assigned_email);
        submitData.append("status_remarks", formData.status_remarks);
      }
      
      // Add job order ID
      submitData.append("id", jobOrderData.id);
      
      // Update job order
      const response = await axios.post<ApiResponse>("/api/job-orders/update", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        onSave(response.data.jobOrder);
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update job order");
      }
    } catch (error) {
      console.error("Error updating job order:", error);
      setErrors({
        ...errors,
        form: "Failed to update job order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">{jobOrderData?.customer_name || "Job Order Status"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Onsite Status Selector */}
          <div className="space-y-2">
            <label className="block">
              Onsite Status<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("Done")}
                className={`py-2 px-4 rounded-lg border ${formData.onsite_status === "Done" ? "bg-red-600 border-red-700" : "bg-gray-800 border-gray-700"}`}
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("In Progress")}
                className={`py-2 px-4 rounded-lg border ${formData.onsite_status === "In Progress" ? "bg-yellow-600 border-yellow-700" : "bg-gray-800 border-gray-700"}`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("Reschedule")}
                className={`py-2 px-4 rounded-lg border ${formData.onsite_status === "Reschedule" ? "bg-orange-600 border-orange-700" : "bg-gray-800 border-gray-700"}`}
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("Failed")}
                className={`py-2 px-4 rounded-lg border ${formData.onsite_status === "Failed" ? "bg-red-600 border-red-700" : "bg-gray-800 border-gray-700"}`}
              >
                Failed
              </button>
            </div>
          </div>
          
          {/* Onsite Remarks */}
          <div className="space-y-2">
            <label className="block">
              Onsite Remarks<span className="text-red-500">*</span>
            </label>
            <textarea
              name="onsite_remarks"
              value={formData.onsite_remarks}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
              rows={3}
            ></textarea>
            {errors.onsite_remarks && (
              <p className="text-red-500 text-sm flex items-center">
                <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                {errors.onsite_remarks}
              </p>
            )}
          </div>
          
          {formData.onsite_status === "Done" && (
            // Fields for Done status
            <>
              {/* Signed Contract Image */}
              <div className="space-y-2">
                <label className="block">
                  Signed Contract Image<span className="text-red-500">*</span>
                </label>
                <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload("signed_contract_image", e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.signed_contract_image ? (
                    <div className="text-green-500">Image uploaded</div>
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                </div>
                {errors.signed_contract_image && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.signed_contract_image}
                  </p>
                )}
              </div>
              
              {/* Setup Image */}
              <div className="space-y-2">
                <label className="block">
                  Setup Image<span className="text-red-500">*</span>
                </label>
                <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload("setup_image", e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.setup_image ? (
                    <div className="text-green-500">Image uploaded</div>
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                </div>
                {errors.setup_image && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.setup_image}
                  </p>
                )}
              </div>
              
              {/* Box Reading Image */}
              <div className="space-y-2">
                <label className="block">
                  Box Reading Image<span className="text-red-500">*</span>
                </label>
                <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload("box_reading_image", e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.box_reading_image ? (
                    <div className="text-green-500">Image uploaded</div>
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                </div>
                {errors.box_reading_image && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.box_reading_image}
                  </p>
                )}
              </div>
              
              {/* Router Reading Image */}
              <div className="space-y-2">
                <label className="block">
                  Router Reading Image<span className="text-red-500">*</span>
                </label>
                <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload("router_reading_image", e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.router_reading_image ? (
                    <div className="text-green-500">Image uploaded</div>
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                </div>
                {errors.router_reading_image && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.router_reading_image}
                  </p>
                )}
              </div>
              
              {/* Client Signature */}
              <div className="space-y-2">
                <label className="block">
                  Client Signature<span className="text-red-500">*</span>
                </label>
                <div className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  {!formData.client_signature ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Tap to unlock
                    </div>
                  ) : (
                    <div className="h-full relative">
                      <img 
                        src={formData.client_signature} 
                        alt="Client Signature" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <SignatureCanvas
                    ref={(ref: SignatureCanvasProps | null) => setSigCanvas(ref)}
                    canvasProps={{
                      className: "w-full h-full absolute top-0 left-0",
                      style: { display: formData.client_signature ? "none" : "block" }
                    }}
                    onEnd={handleSignature}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={clearSignature}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                {errors.client_signature && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.client_signature}
                  </p>
                )}
              </div>
            </>
          )}
          
          {formData.onsite_status === "Failed" && (
            // Fields for Failed status
            <>
              {/* Modified By */}
              <div className="space-y-2">
                <label className="block">
                  Modified By<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modified_by"
                  value={formData.modified_by}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  readOnly
                />
              </div>
              
              {/* Modified Date */}
              <div className="space-y-2">
                <label className="block">
                  Modified Date<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="modified_date"
                    value={formData.modified_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white pr-10"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Contract Link */}
              <div className="space-y-2">
                <label className="block">
                  Contract Link
                </label>
                <input
                  type="text"
                  name="contract_link"
                  value={formData.contract_link}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                />
              </div>
              
              {/* Contract Template */}
              <div className="space-y-2">
                <label className="block">
                  Contract Template<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="contract_template"
                    value={formData.contract_template}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    readOnly
                  />
                  <div className="ml-2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", formData.contract_template + 1)}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-t-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", Math.max(1, formData.contract_template - 1))}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-b-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Status Remarks */}
              <div className="space-y-2">
                <label className="block">
                  Status Remarks<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status_remarks"
                    value={formData.status_remarks}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white appearance-none"
                  >
                    <option value="">Select status remarks</option>
                    <option value="No Signal">No Signal</option>
                    <option value="Incorrect Address">Incorrect Address</option>
                    <option value="Customer Unavailable">Customer Unavailable</option>
                    <option value="Technical Issue">Technical Issue</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {errors.status_remarks && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.status_remarks}
                  </p>
                )}
              </div>
            </>
          )}
          
          {formData.onsite_status === "In Progress" && (
            // Fields for In Progress status
            <>
              {/* Modified By */}
              <div className="space-y-2">
                <label className="block">
                  Modified By<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modified_by"
                  value={formData.modified_by}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  readOnly
                />
              </div>
              
              {/* Modified Date */}
              <div className="space-y-2">
                <label className="block">
                  Modified Date<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="modified_date"
                    value={formData.modified_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white pr-10"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Contract Link */}
              <div className="space-y-2">
                <label className="block">
                  Contract Link
                </label>
                <input
                  type="text"
                  name="contract_link"
                  value={formData.contract_link}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                />
              </div>
              
              {/* Contract Template */}
              <div className="space-y-2">
                <label className="block">
                  Contract Template<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="contract_template"
                    value={formData.contract_template}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    readOnly
                  />
                  <div className="ml-2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", formData.contract_template + 1)}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-t-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", Math.max(1, formData.contract_template - 1))}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-b-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Assigned Email */}
              <div className="space-y-2">
                <label className="block">
                  Assigned Email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="assigned_email"
                    value={formData.assigned_email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white appearance-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Support">Support</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {errors.assigned_email && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.assigned_email}
                  </p>
                )}
              </div>
            </>
          )}
          
          {formData.onsite_status === "Reschedule" && (
            // Fields for Reschedule status
            <>
              {/* Modified By */}
              <div className="space-y-2">
                <label className="block">
                  Modified By<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modified_by"
                  value={formData.modified_by}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  readOnly
                />
              </div>
              
              {/* Modified Date */}
              <div className="space-y-2">
                <label className="block">
                  Modified Date<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="modified_date"
                    value={formData.modified_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white pr-10"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Contract Link */}
              <div className="space-y-2">
                <label className="block">
                  Contract Link
                </label>
                <input
                  type="text"
                  name="contract_link"
                  value={formData.contract_link}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                />
              </div>
              
              {/* Contract Template */}
              <div className="space-y-2">
                <label className="block">
                  Contract Template<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="contract_template"
                    value={formData.contract_template}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    readOnly
                  />
                  <div className="ml-2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", formData.contract_template + 1)}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-t-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberChange("contract_template", Math.max(1, formData.contract_template - 1))}
                      className="bg-gray-700 hover:bg-gray-600 p-1 rounded-b-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Assigned Email */}
              <div className="space-y-2">
                <label className="block">
                  Assigned Email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="assigned_email"
                    value={formData.assigned_email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white appearance-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Support">Support</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {errors.assigned_email && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.assigned_email}
                  </p>
                )}
              </div>
              
              {/* Status Remarks */}
              <div className="space-y-2">
                <label className="block">
                  Status Remarks<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status_remarks"
                    value={formData.status_remarks}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white appearance-none"
                  >
                    <option value="">Select status remarks</option>
                    <option value="Customer Request">Customer Request</option>
                    <option value="Bad Weather">Bad Weather</option>
                    <option value="Technician Unavailable">Technician Unavailable</option>
                    <option value="Equipment Issue">Equipment Issue</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {errors.status_remarks && (
                  <p className="text-red-500 text-sm flex items-center">
                    <span className="inline-block w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs mr-2">!</span>
                    {errors.status_remarks}
                  </p>
                )}
              </div>
            </>
          )}
          
          {/* Error message */}
          {errors.form && (
            <div className="bg-red-900 text-white p-3 rounded-lg">
              {errors.form}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobOrderDoneFormModal;