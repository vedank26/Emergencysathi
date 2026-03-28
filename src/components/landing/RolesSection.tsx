import React from 'react';
import { User, Radio, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const roles = [
  {
    icon: <User className="w-8 h-8" />,
    title: 'Citizen',
    subtitle: 'Report & Stay Safe',
    description: 'One-tap SOS, easy incident reporting, and real-time updates on emergency response.',
    features: ['Red SOS Button', 'GPS Auto-Location', 'Status Updates', 'Safety Instructions'],
    gradient: 'from-primary/20 to-primary/5',
    borderColor: 'hover:border-primary/50',
  },
  {
    icon: <Radio className="w-8 h-8" />,
    title: 'Coordinator',
    subtitle: 'Command & Control',
    description: 'Central dashboard for managing incidents, dispatching resources, and tracking response.',
    features: ['Live Dashboard', 'Vehicle Dispatch', 'Priority Override', 'Merge Duplicates'],
    gradient: 'from-info/20 to-info/5',
    borderColor: 'hover:border-info/50',
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Agency',
    subtitle: 'Respond & Resolve',
    description: 'Focused interface for emergency services to receive, navigate to, and resolve incidents.',
    features: ['Assigned Incidents', 'Navigation', 'Status Updates', 'Fleet Management'],
    gradient: 'from-success/20 to-success/5',
    borderColor: 'hover:border-success/50',
  },
];

const RolesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            One Platform,
            <span className="text-gradient-emergency"> Three Roles</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each user gets a tailored experience designed for their specific responsibilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl bg-gradient-to-b ${role.gradient} border border-border ${role.borderColor} transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-foreground/5 to-transparent rounded-bl-full" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                  {role.icon}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground">{role.title}</h3>
                  <p className="text-sm font-medium text-primary">{role.subtitle}</p>
                </div>
                
                <p className="text-muted-foreground mb-6">{role.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="ghost" 
                  className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
