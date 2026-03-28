import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ArrowLeft,
  Camera,
  MapPin,
  Upload,
  X,
  Stethoscope,
  Flame,
  CloudLightning,
  Building2,
  PawPrint,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCoordinator } from "@/context/CoordinatorContext";
import { IncidentCategory, IncidentSeverity } from "@/types";
import { IncidentMap } from "@/components/maps/IncidentMap";
import { MUMBAI } from "@/lib/map/mapConfig";

const categories = [
  { value: "medical", label: "Medical", icon: <Stethoscope className="w-5 h-5" /> },
  { value: "fire", label: "Fire", icon: <Flame className="w-5 h-5" /> },
  { value: "disaster", label: "Disaster", icon: <CloudLightning className="w-5 h-5" /> },
  { value: "infrastructure", label: "Infrastructure", icon: <Building2 className="w-5 h-5" /> },
  { value: "wildlife", label: "Wildlife", icon: <PawPrint className="w-5 h-5" /> },
];

const severities = [
  { value: "low", label: "Low", icon: <Info className="w-4 h-4" /> },
  { value: "medium", label: "Medium", icon: <Info className="w-4 h-4" /> },
  { value: "high", label: "High", icon: <AlertTriangle className="w-4 h-4" /> },
  { value: "critical", label: "Critical", icon: <AlertCircle className="w-4 h-4" /> },
];

const ReportIncident: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addIncident } = useCoordinator();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as IncidentCategory | "",
    severity: "" as IncidentSeverity | "",
    address: "",
    photos: [] as File[],
    addressLat: undefined as number | undefined,
    addressLng: undefined as number | undefined,
  });

  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - formData.photos.length);
    setFormData({ ...formData, photos: [...formData.photos, ...files] });
    setPhotoPreviewUrls([...photoPreviewUrls, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
    setFormData({ ...formData, photos: formData.photos.filter((_, i) => i !== index) });
  };

  const getCurrentLocation = () => {
  setIsLocating(true);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      console.log("📍 RAW GPS:", latitude, longitude, "±", accuracy, "meters");

      setFormData({
        ...formData,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        addressLat: latitude,
        addressLng: longitude,
      });

      setIsLocating(false);
      toast({ title: "Location captured", description: "GPS set!" });
    },
    () => {
      setIsLocating(false);
      toast({
        title: "Location error",
        description: "Unable to access GPS",
        variant: "destructive",
      });
    }
  );
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.category ||
      !formData.severity ||
      !formData.title ||
      !formData.addressLat ||
      !formData.addressLng
    ) {
      toast({ title: "Missing information", description: "Fill all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      addIncident({
        category: formData.category,
        severity: formData.severity,
        title: formData.title,
        description: formData.description || "No details",
        location: {
          lat: formData.addressLat,
          lng: formData.addressLng,
          address: formData.address,
        },
        reportedBy: user?.id || "anonymous",
      });

      await new Promise((r) => setTimeout(r, 800));

      toast({ title: "Incident Reported", description: "Emergency services notified." });
      navigate("/customer");
    } catch {
      toast({ title: "Error", description: "Failed to submit.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 flex items-center h-16">
          <button onClick={() => navigate("/customer")} className="mr-4 p-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Report Incident
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CATEGORY */}
          <div>
            <Label className="font-semibold">Emergency Type *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setFormData({ ...formData, category: c.value as IncidentCategory })}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1 ${
                    formData.category === c.value ? "border-primary text-primary" : "border-border"
                  }`}
                >
                  {c.icon}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* SEVERITY */}
          <div>
            <Label className="font-semibold">Severity *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {severities.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setFormData({ ...formData, severity: s.value as IncidentSeverity })}
                  className={`p-3 border rounded-xl flex items-center gap-2 ${
                    formData.severity === s.value ? "border-destructive text-destructive" : "border-border"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div>
            <Label className="font-semibold">Title *</Label>
            <Input
              placeholder="e.g., Fire in building"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Optional details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* LOCATION */}
          <div>
            <Label className="font-semibold">Location *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Click GPS to auto-fill"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Button type="button" onClick={getCurrentLocation} disabled={isLocating}>
                {isLocating ? "..." : <MapPin className="w-4 h-4" />}
              </Button>
            </div>

            {/* MAP ALWAYS SHOWN */}
            <div className="mt-3 border rounded-xl overflow-hidden">
              <IncidentMap
                incidentLat={formData.addressLat ?? MUMBAI.lat}
                incidentLng={formData.addressLng ?? MUMBAI.lng}
              />
            </div>
          </div>

          {/* PHOTOS */}
          <div>
            <Label>Photos (Optional, max 4)</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {photoPreviewUrls.map((url, i) => (
                <div key={i} className="relative aspect-square border rounded-xl overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1">
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
              {formData.photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border border-dashed rounded-xl flex items-center justify-center text-muted-foreground"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </div>

          {/* SUBMIT */}
          <Button type="submit" disabled={isSubmitting} className="w-full h-14">
            {isSubmitting ? "Submitting..." : <><Upload className="w-5 h-5 mr-2" /> Submit Emergency Report</>}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ReportIncident;

