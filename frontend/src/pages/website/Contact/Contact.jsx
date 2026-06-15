// src/pages/Contact.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import LeadCaptureForm from '../../../components/LeadCaptureForm';

const Contact = () => {
  const offices = [
    {
      city: "New York",
      address: "1271 Avenue of the Americas, 42nd Floor",
      phone: "+1 (212) 555-0189",
      email: "nyc@finbridge.com"
    },
    {
      city: "London",
      address: "25 Bank Street, Canary Wharf",
      phone: "+44 20 7946 0958",
      email: "london@finbridge.com"
    },
    {
      city: "Singapore",
      address: "1 Raffles Place, #32-01",
      phone: "+65 6808 4123",
      email: "singapore@finbridge.com"
    }
  ];

  return (
    <div className="bg-[#0A192F] text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#D4AF37_0%,transparent_60%)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4AF37] text-sm font-medium px-6 py-2 rounded-full mb-6 border border-[#D4AF37]/30">
              GET IN TOUCH
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Let's Build Your<br />
              <span className="text-[#D4AF37]">Financial Future</span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-xl">
              Speak with our senior advisors. Every inquiry receives a response within 4 business hours.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Contact Form — now captures real leads */}
          <div className="lg:col-span-7">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl font-semibold mb-10">Request a Free Consultation</h2>
              <LeadCaptureForm />
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Mail className="text-[#D4AF37]" /> Get In Touch
              </h3>
              <div className="space-y-6">
                <a href="mailto:advisory@finbridge.com" className="block group">
                  <div className="flex items-center gap-4 text-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                      ✉️
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Primary Email</div>
                      <div className="text-white group-hover:text-[#D4AF37] transition-colors">advisory@finbridge.com</div>
                    </div>
                  </div>
                </a>

                <a href="tel:+12125550189" className="block group">
                  <div className="flex items-center gap-4 text-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                      📞
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Global Helpline</div>
                      <div className="text-white group-hover:text-[#D4AF37] transition-colors">+1 (212) 555-0189</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Global Offices */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <MapPin className="text-[#D4AF37]" /> Our Offices
              </h3>
              <div className="space-y-8">
                {offices.map((office, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-[#D4AF37] pl-8"
                  >
                    <div className="font-semibold text-xl mb-3">{office.city}</div>
                    <div className="text-gray-400 text-sm leading-relaxed mb-4">{office.address}</div>
                    <div className="flex flex-col gap-2 text-sm">
                      <a href={`tel:${office.phone}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {office.phone}
                      </a>
                      <a href={`mailto:${office.email}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {office.email}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-5 h-5" />
                <span>Response within 4 business hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <section className="py-20 bg-black/60 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold mb-6">Not sure where to start?</h2>
          <p className="text-gray-400 text-lg mb-10">Our Client Success team will match you with the right expert based on your industry and objectives.</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-4 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#D4AF37] px-10 py-4 rounded-2xl font-medium transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;