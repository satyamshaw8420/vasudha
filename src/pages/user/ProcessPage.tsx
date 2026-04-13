import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const StepCard = ({ index, id, num, titleLine1, titleLine2, desc, image, children, reverse = false }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20% 0px -20% 0px', once: false });

  return (
    <section id={id} className="min-h-[90vh] flex flex-col justify-center py-16 group">
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 100 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full"
      >
        <div className={`lg:col-span-7 relative ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(104,219,174,0.08)] border border-[rgb(var(--outline-rgb)/0.1)] group-hover:border-[#68dbae]/20 transition-all duration-700 relative">
            <img 
              src={image} 
              alt={titleLine1} 
              className={`w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${index % 2===0 ? 'brightness-75 group-hover:brightness-100 group-hover:scale-110' : 'brightness-90 group-hover:brightness-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
          </div>
          {index === 0 && (
            <div className="absolute -bottom-10 -right-6 lg:-right-10 bg-[#1d2021]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#68dbae]/20 max-w-[280px] shadow-2xl z-10">
              <div className="flex items-center gap-4 mb-3">
                <Activity className="text-[#68dbae] drop-shadow-[0_0_10px_rgba(29,158,117,0.5)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#68dbae]">Spectral Logic</span>
              </div>
              <p className="text-xs text-[#bccac1] leading-relaxed">Real-time hyperspectral imaging detects 42 unique polymer signatures at 120 FPS.</p>
            </div>
          )}
          {index === 1 && (
            <div className="absolute -top-10 -left-6 w-32 h-32 bg-[#68dbae]/10 blur-3xl rounded-full"></div>
          )}
        </div>

        <div className={`lg:col-span-5 space-y-8 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="inline-flex items-center gap-4">
            <span className="text-5xl font-black text-[#68dbae]/20">{num}</span>
            <div className="h-[1px] w-12 bg-[#68dbae]/30"></div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#e1e3e4] leading-tight font-headline">
            {titleLine1} <br/> {titleLine2}
          </h2>
          <p className="text-[#bccac1] text-lg leading-relaxed font-light">
            {desc}
          </p>
          {children}
        </div>
      </motion.div>
    </section>
  );
};

export default function ProcessPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative min-h-screen text-[#e1e3e4] -mt-6 -mx-6 px-6 overflow-hidden bg-[#111415] font-body selection:bg-[#68dbae] selection:text-[#003827] pb-20">
      {/* Hero Section */}
      <header ref={heroRef} className="min-h-screen flex flex-col justify-center px-4 md:px-16 lg:px-24 py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#68dbae]/5 via-transparent to-transparent opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#1D9E75] blur-[120px] opacity-10 rounded-full pointer-events-none"></div>
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#323536]/50 backdrop-blur-md text-[#68dbae] font-label text-xs font-bold tracking-[0.2em] uppercase mb-8 border border-[#68dbae]/20">
            Alchemy in Motion
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-[#e1e3e4] leading-[1.1] font-headline">
              Transmuting Waste into <br className="hidden md:block"/>
              <span className="text-[#68dbae] italic relative inline-block mt-2">
                  Industrial Gold.
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-[#68dbae] to-transparent opacity-30"></span>
              </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#bccac1] max-w-2xl leading-relaxed font-light">
              Our proprietary four-stage alchemical process combines quantum sensing with mechanical precision to redefine the lifecycle of polymers.
          </p>
        </motion.div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="font-label text-[10px] uppercase tracking-widest text-[#bccac1]">Scroll to explore</span>
          <motion.div 
            animate={{ height: ['0%', '100%'], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-[1px] h-12 bg-gradient-to-b from-[#68dbae] to-transparent"
          />
        </div>
      </header>

      {/* Scrollytelling Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <StepCard
          index={0}
          id="collection"
          num="01"
          titleLine1="Collection &"
          titleLine2="Spectral Ingestion"
          desc="The journey begins with intelligent ingestion. Using advanced spectral analysis, we scan incoming materials to identify chemical compositions with 99.8% accuracy."
          image="/process-collection.png"
          reverse={false}
        >
          <ul className="space-y-6 pt-4">
            <li className="flex gap-4 items-center text-[#e1e3e4] font-medium group">
              <span className="w-2 h-2 rounded-full bg-[#68dbae] shadow-[0_0_20px_rgba(29,158,117,0.3)] group-hover:scale-150 transition-transform"></span>
              <span className="font-label text-sm tracking-wide uppercase">Quantum-Dot Identification</span>
            </li>
            <li className="flex gap-4 items-center text-[#e1e3e4] font-medium group">
              <span className="w-2 h-2 rounded-full bg-[#68dbae] shadow-[0_0_20px_rgba(29,158,117,0.3)] group-hover:scale-150 transition-transform"></span>
              <span className="font-label text-sm tracking-wide uppercase">AI-Driven Volumetric Sorting</span>
            </li>
          </ul>
        </StepCard>

        <StepCard
          index={1}
          id="shredding"
          num="02"
          titleLine1="Kinetic Fracture"
          titleLine2="& Hydro-Cleansing"
          desc="Materials are mechanically reduced into uniform 5mm flakes. A high-pressure, closed-loop cleansing phase removes surface contaminants without harsh chemicals."
          image="/process-shredding.png"
          reverse={true}
        >
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="bg-[#1d2021]/40 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--outline-rgb)/0.1)] flex-1 text-center sm:text-left">
              <p className="text-3xl font-bold text-[#68dbae] mb-1">5mm</p>
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#bccac1] font-bold">Flake Precision</p>
            </div>
            <div className="bg-[#1d2021]/40 backdrop-blur-xl p-6 rounded-2xl border border-[rgb(var(--outline-rgb)/0.1)] flex-1 text-center sm:text-left">
              <p className="text-3xl font-bold text-[#68dbae] mb-1">15k PSI</p>
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#bccac1] font-bold">Wash Pressure</p>
            </div>
          </div>
        </StepCard>

        <StepCard
          index={2}
          id="melting"
          num="03"
          titleLine1="Thermal Fusion &"
          titleLine2="Molecular Sieve"
          desc="In an oxygen-deprived vacuum, flakes are melted at precise temperatures. Molecular purification draws out volatile organic compounds, leaving a pristine polymer matrix."
          image="/process-melting.png"
          reverse={false}
        >
          <div className="bg-[#1d2021]/40 backdrop-blur-xl p-8 rounded-2xl border border-[#68dbae]/10">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-[#68dbae]">Reactor Purity Log</span>
              <span className="font-label text-xs font-mono text-[#68dbae] font-bold">99.98%</span>
            </div>
            <div className="h-1 bg-[#323536] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '99.98%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-[#68dbae] shadow-[0_0_10px_#68dbae]"
              />
            </div>
          </div>
        </StepCard>

        <StepCard
          index={3}
          id="extrusion"
          num="04"
          titleLine1="Precision"
          titleLine2="Filament Extrusion"
          desc="The final alchemy. Purified melt is extruded through diamond-coated nozzles to create high-grade filaments, ready for demanding additive manufacturing."
          image="/process-filament.png"
          reverse={true}
        >
           <button 
             onClick={() => navigate(ROUTES.USER.IMPACT)}
             className="mt-4 flex items-center justify-between sm:justify-start gap-6 bg-[#1d2021]/40 hover:bg-[#323536] text-[#e1e3e4] px-8 py-5 rounded-2xl border border-[#3d4943]/20 hover:border-[#68dbae]/30 transition-all group overflow-hidden relative w-full sm:w-auto"
           >
              <div className="absolute inset-0 bg-[#68dbae]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="font-bold tracking-tight text-lg relative z-10">See Your Impact</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform relative z-10 text-[#68dbae]" />
          </button>
        </StepCard>
      </div>

      {/* CTA Section */}
      <section className="px-4 md:px-16 lg:px-24 py-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto bg-[#1d2021]/40 backdrop-blur-2xl p-12 lg:p-20 rounded-[3rem] border border-[#68dbae]/20 shadow-[0_0_40px_rgba(29,158,117,0.15)] relative overflow-hidden group"
        >
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#68dbae] opacity-[0.03] blur-[120px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#8bd6b6] opacity-[0.03] blur-[120px] rounded-full group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none"></div>
          
          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-[#e1e3e4] leading-tight">Ready to Close the Loop?</h2>
            <p className="text-[#bccac1] text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join the decentralized circular economy. Track your impact from collection to creation with Vashudha.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate(ROUTES.USER.SCAN)}
                className="px-10 py-4 bg-[#68dbae] text-[#002115] rounded-full font-bold text-lg hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(104,219,174,0.3)] hover:bg-[#86f8c9] transition-all"
              >
                  Start Recycling
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
