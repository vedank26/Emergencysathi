import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Radio, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole, AgencyType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roles = [
  {
    id: 'customer' as UserRole,
    icon: <User className="w-6 h-6" />,
    title: 'Citizen',
    description: 'Report emergencies and get help fast',
  },
  {
    id: 'coordinator' as UserRole,
    icon: <Radio className="w-6 h-6" />,
    title: 'Coordinator',
    description: 'Manage and dispatch emergency resources',
  },
  {
    id: 'agency' as UserRole,
    icon: <Building2 className="w-6 h-6" />,
    title: 'Agency',
    description: 'Respond to assigned emergency incidents',
  },
];

const agencyTypes: { id: AgencyType; label: string }[] = [
  { id: 'police', label: 'Police Department' },
  { id: 'ambulance', label: 'Medical Services / Ambulance' },
  { id: 'fire', label: 'Fire Brigade' },
  { id: 'disaster', label: 'Disaster Response Force' },
  { id: 'forest', label: 'Forest Department' },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    agencyType: '' as AgencyType | '',
    departmentName: '',
    officePhone: '',
    officeAddress: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        selectedRole,
        (formData.agencyType as AgencyType) || undefined,
        formData.phone,
        // For agency users we persist the office address on the user object so
        // the agency dashboard can show the correct identity.
        selectedRole === 'agency' ? formData.officeAddress : undefined
      );
      
      // Navigate to appropriate dashboard
      switch (selectedRole) {
        case 'customer':
          navigate('/customer');
          break;
        case 'coordinator':
          navigate('/coordinator');
          break;
        case 'agency':
          navigate('/agency');
          break;
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emergency/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-emergency flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-foreground">EmergencySathi</span>
          </div>
          
          <h1 className="text-4xl font-black text-foreground mb-4">
            Join the Network That
            <span className="text-gradient-emergency"> Saves Lives</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md">
            Whether you're a citizen, coordinator, or emergency service – your role matters in creating a safer community.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg gradient-emergency flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-foreground">EmergencySathi</span>
          </div>

          {step === 'role' ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Role</h2>
                <p className="text-muted-foreground">Choose how you'll use EmergencySathi</p>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
                  Log in
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('role')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {selectedRole === 'customer' && 'Create Citizen Account'}
                  {selectedRole === 'coordinator' && 'Create Coordinator Account'}
                  {selectedRole === 'agency' && 'Register Your Agency'}
                </h2>
                <p className="text-muted-foreground">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{selectedRole === 'agency' ? 'Department Name' : 'Full Name'}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={selectedRole === 'agency' ? 'e.g., Mumbai Fire Brigade' : 'John Doe'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{selectedRole === 'agency' ? 'Office Phone' : 'Phone Number'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {selectedRole === 'agency' && (
                  <>
                    <div>
                      <Label htmlFor="agencyType">Agency Type</Label>
                      <Select
                        value={formData.agencyType}
                        onValueChange={(value) => setFormData({ ...formData, agencyType: value as AgencyType })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select agency type" />
                        </SelectTrigger>
                        <SelectContent>
                          {agencyTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="officeAddress">Office Address</Label>
                      <Input
                        id="officeAddress"
                        type="text"
                        placeholder="Full office address"
                        value={formData.officeAddress}
                        onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
