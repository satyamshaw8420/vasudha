import { useState, useEffect } from 'react';
import { 
  Truck, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Calendar, 
  History, 
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';

// Fix for Leaflet default icon issues in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to calculate bearing between two points
function calculateBearing(start: [number, number], end: [number, number]) {
  const startLat = (start[0] * Math.PI) / 180;
  const startLng = (start[1] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const endLng = (end[1] * Math.PI) / 180;
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Custom Truck Icon with Dynamic Rotation
const getTruckIcon = (rotation: number) => new L.DivIcon({
  html: `<div class="bg-[var(--brand-secondary)] p-2 rounded-full shadow-lg border-2 border-white bioluminescent-glow transition-transform duration-500" style="transform: rotate(${rotation}deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface Pickup {
  id: string;
  status: 'confirmed' | 'en_route' | 'at_location' | 'processing' | 'completed';
  agent: {
    name: string;
    avatar: string;
    vehicle: string;
    rating: number;
  };
  location: { lat: number; lng: number };
  items: string[];
  scheduledTime: any;
  createdAt?: any;
  creditsAwarded?: number;
}

// Component to handle map center updates
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function PickupStatusPage() {
  const { user, profile } = useAuth();
  const [activePickup, setActivePickup] = useState<Pickup | null>(null);
  const [history, setHistory] = useState<Pickup[]>([]);
  const [eta, setEta] = useState(12);
  const [distance, setDistance] = useState(2.4);
  const [truckRotation, setTruckRotation] = useState(0);
  const [mapRotation, setMapRotation] = useState(0);
  const [hasFoundLocation, setHasFoundLocation] = useState(false);

  // High-Precision Geolocation: Defaulting to Howrah, West Bengal
  const [userPos, setUserPos] = useState<[number, number]>([22.5769, 88.3186]);
  const [driverPos, setDriverPos] = useState<[number, number]>([22.5869, 88.3286]);

  // Live GPS Tracking: Syncing the User's exact location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPos([latitude, longitude]);
          setHasFoundLocation(true);
        },
        (error) => {
          console.warn("High-accuracy GPS lock failed. Using network location.", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Custom Home Icon for User
  const homeIcon = new L.DivIcon({
    html: `<div class="bg-[var(--brand-primary)] p-2 rounded-full shadow-lg border-2 border-white bioluminescent-glow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
    className: 'custom-home-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  // Mock Active Pickup for Demonstration if none exists in DB
  const demoActivePickup: Pickup = {
    id: 'demo-092',
    status: 'en_route',
    agent: {
      name: 'Agent S. Vasu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vasu',
      vehicle: 'ECO-EV 092',
      rating: 4.9
    },
    location: { lat: 22.5833, lng: 88.3333 }, // Howrah Base
    items: ['12.5kg Mixed Plastic', '5kg Corrugated Paper'],
    scheduledTime: new Date(Date.now() + 3600000)
  };

  const [fullRoutePath, setFullRoutePath] = useState<[number, number][]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Real-Road Routing: Fetch driving directions from OSRM
  useEffect(() => {
    if (!hasFoundLocation) return;
    
    const fetchRoute = async () => {
      try {
        // Start driver nearby (offset by 0.012 - approx. 1.2km)
        const startLat = userPos[0] + 0.012;
        const startLng = userPos[1] + 0.012;
        setDriverPos([startLat, startLng]);

        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${userPos[1]},${userPos[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setFullRoutePath(coords as [number, number][]);
          setCurrentStep(0);
          // Snap driver to the actual start of the road
          setDriverPos(coords[0]);
          setDistance(parseFloat((data.routes[0].distance / 1000).toFixed(2)));
          setEta(Math.ceil(data.routes[0].duration / 60) + 2);
        }
      } catch (err) {
        console.error("Routing calculation failed. Using fallback.", err);
      }
    };

    fetchRoute();
  }, [userPos]);

  // Simulation Loop for "Real-Road" movement
  useEffect(() => {
    if (fullRoutePath.length === 0) return;

    const totalSteps = fullRoutePath.length;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < totalSteps - 1) {
          const nextStep = prev + 1;
          const nextPos = fullRoutePath[nextStep];
          
          // Calculate heading/rotation for the truck to face the road
          const bearing = calculateBearing(fullRoutePath[prev], nextPos);
          setTruckRotation(bearing);
          
          setDriverPos(nextPos);
          
          // Progressively decrease ETA and Distance based on the actual path
          setEta(e => Math.max(1, e - 1));
          setDistance(d => Math.max(0.1, parseFloat((d * 0.9).toFixed(2))));
          return nextStep;
        }
        return prev;
      });
    }, 4000); // More frequent updates for smooth road following
    return () => clearInterval(timer);
  }, [fullRoutePath]);

  const [isRequesting, setIsRequesting] = useState(false);

  const handleScheduleBulk = async () => {
    setIsRequesting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRequesting(false);
    alert("Bulk Recovery Request Sent! Agent S. Vasu will contact you shortly.");
  };

  useEffect(() => {
    if (!user) return;
    
    // Listen to real-time pickups
    const q = query(
      collection(db, 'pickups'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPickups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pickup[];
      const active = allPickups.find(p => p.status !== 'completed');
      const past = allPickups.filter(p => p.status === 'completed');
      
      if (active) {
        setActivePickup(active);
        // Use the UNIQUE location from the database for this specific user
        setUserPos([active.location.lat, active.location.lng]);
        setHasFoundLocation(true);
      } else {
        setActivePickup(demoActivePickup);
      }
      setHistory(past);
    });

    return () => unsubscribe();
  }, [user]);

  const steps = [
    { label: 'Confirmed', status: 'confirmed' },
    { label: 'En Route', status: 'en_route' },
    { label: 'At Location', status: 'at_location' },
    { label: 'Processing', status: 'processing' },
    { label: 'Completed', status: 'completed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === activePickup?.status);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header */}
      <section className="space-y-2">
        <h2 className="text-5xl font-bold tracking-tight text-[var(--brand-primary)]">Pickup Status</h2>
        <p className="text-xl text-[var(--on-surface-variant)] font-medium max-w-lg">
          Track your molecular recovery cycle in real-time.
        </p>
      </section>

      {/* Active Pickup Tracker Hero */}
      <section>
        <Card className="glass-card border-none bg-white/60 overflow-hidden glow-sage rounded-[3.5rem] shadow-xl shadow-[rgb(var(--brand-primary-rgb)/0.05)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Tracker Details */}
              <div className="p-10 lg:p-14 space-y-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-3xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] flex items-center justify-center bioluminescent-glow group-hover:scale-110 transition-transform duration-500">
                      <Truck size={32} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--brand-primary)] opacity-40 uppercase tracking-[0.3em]">Recovery ID</p>
                      <p className="text-2xl font-black text-[var(--brand-primary)] uppercase">{activePickup?.id}</p>
                    </div>
                  </div>
                  <div className="px-6 py-2.5 rounded-full bg-[rgb(var(--brand-secondary-rgb)/0.15)] text-[var(--brand-secondary)] text-[10px] font-black uppercase tracking-widest animate-pulse border border-[var(--brand-secondary)]/30">
                    Live Orbit Active
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative pt-8 pb-10">
                  <div className="absolute top-[calc(2.5rem-1px)] left-4 right-4 h-1 bg-[rgb(var(--outline-rgb)/0.1)] rounded-full" />
                  <div 
                    className="absolute top-[calc(2.5rem-1px)] left-4 h-1 bg-[var(--brand-secondary)] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--brand-secondary-rgb),0.4)]" 
                    style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 32px)` }}
                  />
                  
                  <div className="flex justify-between relative px-2">
                    {steps.map((step, idx) => (
                      <div key={step.label} className="flex flex-col items-center gap-6">
                        <motion.div
                          animate={{ 
                            scale: idx === currentStepIndex ? [1, 1.4, 1] : 1,
                            backgroundColor: idx <= currentStepIndex ? 'var(--brand-secondary)' : 'rgb(var(--outline-rgb)/0.3)'
                          }}
                          transition={{ repeat: idx === currentStepIndex ? Infinity : 0, duration: 2.5 }}
                          className={`h-5 w-5 rounded-full z-10 transition-colors duration-500 ${idx <= currentStepIndex ? 'bioluminescent-glow' : ''}`}
                        />
                        <span className={`text-xs font-black uppercase tracking-tighter transition-all duration-500 ${idx <= currentStepIndex ? 'text-[var(--brand-primary)] opacity-100' : 'text-[var(--on-surface-variant)] opacity-30'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Card */}
                <div className="bg-white/90 p-8 rounded-[2.5rem] border border-[var(--brand-primary)]/5 flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <div className="relative flex-shrink-0">
                       <img src={activePickup?.agent.avatar} className="h-20 w-20 rounded-full bg-[var(--brand-secondary)]/10 ring-4 ring-white shadow-lg" alt="Agent" />
                       <div className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white shadow-sm">
                         <ShieldCheck size={14} />
                       </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-2xl font-black text-[var(--brand-primary)] truncate">{activePickup?.agent.name}</h4>
                      <div className="flex items-center gap-3 text-sm font-bold text-[var(--on-surface-variant)] mt-1">
                        <span className="opacity-60">{activePickup?.agent.vehicle}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/40" />
                        <span className="text-[var(--brand-secondary)] font-black">★ {activePickup?.agent.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = 'tel:+1234567890'}
                    className="h-16 w-16 rounded-full bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] hover:scale-110 active:scale-95 shadow-xl shadow-[rgb(var(--brand-primary-rgb)/0.2)] transition-all duration-500 flex-shrink-0"
                  >
                    <Phone size={28} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                   <div className="space-y-2">
                      <p className="text-xs font-black text-[var(--brand-primary)] opacity-40 uppercase tracking-[0.2em]">Estimated Arrival</p>
                      <div className="flex items-center gap-3 text-[var(--brand-primary)]">
                        <div className="h-10 w-10 rounded-xl bg-[var(--brand-secondary)]/10 flex items-center justify-center">
                          <Clock size={20} className="text-[var(--brand-secondary)]" />
                        </div>
                        <span className="text-xl font-black tracking-tight">In {Math.ceil(eta)} Minutes</span>
                      </div>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-xs font-black text-[var(--brand-primary)] opacity-40 uppercase tracking-[0.2em]">Material Weight</p>
                      <p className="text-2xl font-black text-[var(--brand-secondary)] tracking-tight">~ 17.5 KG</p>
                   </div>
                </div>
              </div>

              {/* Recovery Orbit Map (Leaflet Satellite View) */}
              <div className="relative h-full min-h-[450px] lg:min-h-0 overflow-hidden lg:rounded-r-[3.5rem] border-l border-[var(--brand-primary)]/10 shadow-inner bg-black/5">
                <div 
                  className="h-full w-full transition-transform duration-1000 ease-in-out" 
                  style={{ transform: `rotate(${mapRotation}deg)` }}
                >
                  {hasFoundLocation ? (
                    <MapContainer 
                      center={userPos} 
                      zoom={16} 
                      className="h-full w-full"
                      zoomControl={true}
                    >
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      />
                      <Polyline 
                        positions={fullRoutePath.slice(currentStep)} 
                        color="white" 
                        weight={4}
                        opacity={1}
                        className="marching-ants"
                      />
                      <Marker position={userPos} icon={homeIcon} />
                      <Marker position={driverPos} icon={getTruckIcon(truckRotation)} />
                      <RecenterMap center={userPos} />
                    </MapContainer>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-6">
                      <div className="h-20 w-20 rounded-full border-4 border-t-[var(--brand-secondary)] border-white/10 animate-spin" />
                      <div className="text-center space-y-2">
                        <p className="text-xl font-black uppercase tracking-[0.5em] animate-pulse">Establishing Link</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                          Pinpointing {profile?.name || user?.displayName || 'User'}'s Unique Identity...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Satellite HUD Overlay (Ultra-High Contrast) */}
                <div className="absolute top-10 left-10 z-[1000] space-y-3">
                   <div className="px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 flex items-center gap-4 shadow-2xl">
                      <div className="h-3 w-3 rounded-full bg-[var(--brand-secondary)] animate-pulse shadow-[0_0_10px_var(--brand-secondary)]" />
                      <span className="text-sm font-black text-white uppercase tracking-widest">{distance} KM FROM BASE</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-[var(--brand-primary)]/20 flex items-center gap-4 shadow-xl">
                          <Navigation size={14} className="text-[var(--brand-secondary)]" />
                          <span className="text-[11px] font-black text-[var(--brand-primary)] uppercase tracking-widest">
                            Orbiting {profile?.name || user?.displayName || 'User'}'s Base
                          </span>
                      </div>
                      {/* Rotation Control Button */}
                      <button 
                        onClick={() => setMapRotation(prev => (prev + 90) % 360)}
                        className="h-11 w-11 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-[var(--brand-primary)] hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl"
                        title="Rotate Features"
                      >
                        <motion.div animate={{ rotate: -mapRotation }}>
                          <Navigation size={20} />
                        </motion.div>
                      </button>
                   </div>
                </div>

                <div className="absolute bottom-10 right-10 z-[1000] px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl">
                   <p className="text-[11px] font-black text-[var(--brand-secondary)] uppercase tracking-[0.3em] animate-pulse">Live Satellite Link 0x92</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick CTA Banner */}
      <section>
        <div className="relative overflow-hidden bg-[var(--brand-primary)] p-[1px] rounded-[3rem] shadow-2xl group active:scale-[0.99] transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-50 bg-[length:200%_200%] animate-gradient-slow" />
          <div className="relative bg-[#0a1f16]/95 backdrop-blur-3xl rounded-[2.9rem] p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden z-10">
             {/* Decorative glows inside the card */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--brand-secondary)]/30 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--brand-primary)]/40 rounded-full blur-[100px] pointer-events-none" />

             <div className="space-y-4 relative z-10 mix-blend-plus-lighter">
                <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 tracking-tight leading-tight">
                  Dealing with Bulky Recovery?
                </h3>
                <p className="text-white/60 font-semibold max-w-md text-lg leading-relaxed">
                  Schedule a specialized high-volume transport for oversized materials directly from your location.
                </p>
             </div>
             
             <Button 
               onClick={handleScheduleBulk}
               disabled={isRequesting}
               className="h-16 px-10 rounded-full border border-white/20 bg-white/10 text-white font-black tracking-wide backdrop-blur-xl hover:bg-white hover:text-[var(--brand-primary)] transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] disabled:opacity-50 relative z-10 flex items-center gap-3 w-full md:w-auto justify-center"
             >
                {isRequesting ? "SCHEDULING ORBIT..." : "INITIATE BULK RECOVERY"} 
                {!isRequesting && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />}
             </Button>
          </div>
        </div>
      </section>

      {/* Collection Archive */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
           <History className="text-[var(--brand-secondary)]" />
           <h3 className="text-2xl font-bold text-[var(--brand-primary)]">Collection History</h3>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((log) => (
              <Card key={log.id} className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] overflow-hidden group hover:translate-x-1 transition-all duration-500">
                <CardContent className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-[var(--brand-primary)]/5 text-[var(--brand-primary)] flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--brand-primary)]">{log.items.join(', ')}</h4>
                        <p className="text-xs text-[var(--on-surface-variant)] font-medium">{format(log.createdAt.toDate(), 'PPP')}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-bold text-[var(--brand-secondary)]">COMPLETED</p>
                      <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">+ {log.creditsAwarded} Credits</p>
                   </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-[rgb(var(--surface-container-rgb)/0.2)] rounded-[2.5rem] p-12 text-center border-2 border-dashed border-[rgb(var(--outline-rgb)/0.1)]">
               <Calendar size={40} className="mx-auto text-[var(--outline)]/40 mb-4" />
               <p className="text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">No Archived Cycles</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
