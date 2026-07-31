'use client';

import { useState, useRef, useEffect } from 'react';
import { MobileHeader } from '@/components/layout/mobile-header';
import { ArrowRight, Image as ImageIcon, Mic, Camera, FlipHorizontal, X, Loader2, Play } from 'lucide-react';

interface AttachmentItem {
  id: string;
  file?: Blob | File;
  url?: string;
  type: string;
  isVoiceNote: boolean;
  size?: number;
}

export function AttachmentsStep({ orderId, onNext, onBack, defaultData }: { orderId?: string, onNext: (data: any) => void, onBack: () => void, defaultData?: any }) {
  
  const [attachments, setAttachments] = useState<AttachmentItem[]>(defaultData?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startCamera = async (mode = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const newAttachment = {
              id: Math.random().toString(36).substring(7),
              file: blob,
              isVoiceNote: false,
              type: 'Site',
            };
            setAttachments(prev => [...prev, newAttachment]);
          }
        }, 'image/jpeg');
      }
      stopCamera();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newAttachment = {
          id: Math.random().toString(36).substring(7),
          file: audioBlob,
          isVoiceNote: true,
          type: 'VoiceNote',
        };
        setAttachments(prev => [...prev, newAttachment]);
        // Stop the mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        isVoiceNote: false,
        type: 'Site',
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleProceed = async () => {
    setIsUploading(true);
    try {
      const finalAttachments: any[] = [];
      const filesToUpload = attachments.filter(a => a.file);
      const existingAttachments = attachments.filter(a => a.url);

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((a, index) => {
          let filename = 'file';
          if (a.file instanceof File) filename = a.file.name;
          else if (a.isVoiceNote) filename = `voicenote_${index}.webm`;
          else filename = `capture_${index}.jpg`;
          
          formData.append('files', a.file as Blob, filename);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.data) {
          data.data.forEach((uploaded: any, index: number) => {
            finalAttachments.push({
              url: uploaded.url,
              type: filesToUpload[index].type,
              isVoiceNote: filesToUpload[index].isVoiceNote,
              size: uploaded.size
            });
          });
        } else {
          throw new Error('Upload failed');
        }
      }
      
      existingAttachments.forEach(a => {
        finalAttachments.push({
          url: a.url,
          type: a.type,
          isVoiceNote: a.isVoiceNote,
          size: a.size
        });
      });

      onNext({ attachments: finalAttachments });
    } catch (err) {
      console.error(err);
      alert('Failed to upload attachments');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col relative h-full bg-background md:bg-transparent">
      <MobileHeader title="Attachments" onBack={onBack} />
      
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 text-white absolute top-0 w-full z-10 bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={stopCamera} className="p-2"><X className="w-8 h-8" /></button>
            <button onClick={toggleCamera} className="p-2"><FlipHorizontal className="w-8 h-8" /></button>
          </div>
          <video ref={videoRef} autoPlay playsInline className="flex-1 w-full h-full object-cover" />
          <div className="absolute bottom-10 w-full flex justify-center z-10">
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-95 transition-transform" />
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 md:pt-4 overflow-y-auto">
        <div className="hidden md:block mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Site Photos & Voice Notes</h2>
          <p className="text-muted-foreground text-sm mt-1">Add context to the order with media attachments.</p>
        </div>
        
        <div className="space-y-6 flex-1 pb-32 md:pb-8">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => startCamera()}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
              >
                <Camera className="w-8 h-8" />
              </button>
              <label className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8" />
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="font-label-lg text-label-lg mb-1 text-on-surface">Capture or Upload Photos</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Take a picture or select from device</p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isRecording ? 'bg-error text-white animate-pulse' : 'bg-error/10 text-error'}`}>
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="font-label-lg text-label-lg mb-1 text-on-surface">Record Voice Note</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Explain special requirements or context.</p>
            <button 
              type="button" 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`px-6 py-3 rounded-full font-label-md text-label-md flex items-center gap-2 transition-colors select-none ${isRecording ? 'bg-error text-white' : 'bg-error/10 text-error hover:bg-error/20'}`}
            >
              {isRecording ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  Recording... Release to Save
                </>
              ) : (
                <>Hold to Record</>
              )}
            </button>
          </div>

          {/* List of pending attachments */}
          {attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="font-label-lg text-label-lg mb-4">Attachments ({attachments.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {attachments.map((item, i) => (
                  <div key={item.id} className="relative group rounded-xl border border-outline-variant overflow-hidden bg-surface aspect-square flex flex-col items-center justify-center">
                    <button 
                      onClick={() => removeAttachment(item.id)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {item.isVoiceNote ? (
                      <div className="flex flex-col items-center gap-2 text-primary">
                        <Play className="w-10 h-10" />
                        <span className="text-xs font-medium">Voice Note {i + 1}</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={item.url || (item.file ? URL.createObjectURL(item.file as Blob) : '')} 
                        alt="Attachment" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Area (Sticky Bottom on Mobile) */}
        <div className="fixed bottom-0 left-0 w-full md:static md:w-auto bg-surface border-t border-outline-variant md:border-none p-4 md:p-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-0 md:mt-8 flex justify-between gap-4">
          <button type="button" onClick={onBack} disabled={isUploading} className="flex-1 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg border-2 border-outline-variant hover:bg-surface-variant text-on-surface transition-all disabled:opacity-50">
            Back
          </button>
          <button 
            type="button" 
            onClick={handleProceed}
            disabled={isUploading}
            className="flex-2 md:flex-none font-label-md text-label-md py-3 px-8 rounded-lg flex items-center justify-center gap-xs transition-colors bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Commercial Details
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
