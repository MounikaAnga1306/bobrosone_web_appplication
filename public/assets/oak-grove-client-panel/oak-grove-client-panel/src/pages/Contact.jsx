import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({
    studentName: "", parentName: "", grade: "", phone: "", email: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: numbersOnly });
    } else if (name === "studentName" || name === "parentName") {
      // Only letters, spaces, dots allowed — no numbers, no special chars
      const lettersOnly = value.replace(/[^a-zA-Z\s.]/g, "");
      setForm({ ...form, [name]: lettersOnly });
    } else if (name === "email") {
      // Email: only letters, numbers, and @ (no dots, no other special chars)
      const emailAllowed = value.replace(/[^a-zA-Z0-9@]/g, "");
      setForm({ ...form, [name]: emailAllowed });
    } else if (name === "message") {
      // Message: only letters, numbers, and spaces (no special characters)
      const messageAllowed = value.replace(/[^a-zA-Z0-9\s]/g, "");
      setForm({ ...form, [name]: messageAllowed });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Student Name
    if (!form.studentName.trim()) {
      newErrors.studentName = "Student name is required";
    } else if (/[0-9]/.test(form.studentName)) {
      newErrors.studentName = "Student name should not contain numbers";
    } else if (/[^a-zA-Z\s.]/.test(form.studentName)) {
      newErrors.studentName = "Student name should not contain special characters";
    } else if (form.studentName.trim().length < 2) {
      newErrors.studentName = "Student name must be at least 2 characters";
    }

    // Parent Name
    if (!form.parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    } else if (/[0-9]/.test(form.parentName)) {
      newErrors.parentName = "Parent name should not contain numbers";
    } else if (/[^a-zA-Z\s.]/.test(form.parentName)) {
      newErrors.parentName = "Parent name should not contain special characters";
    } else if (form.parentName.trim().length < 2) {
      newErrors.parentName = "Parent name must be at least 2 characters";
    }

    // Grade
    if (!form.grade) {
      newErrors.grade = "Please select a grade";
    }

    // Phone — exactly 10 digits, no special chars
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    } else if (/^0{10}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Email — only letters, numbers, and '@' allowed (no dots or other special chars)
    if (!form.email) {
      newErrors.email = "Email address is required";
    } else {
      // Must contain exactly one '@' and only alphanumeric + '@'
      if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/.test(form.email)) {
        newErrors.email = "Email must contain only letters, numbers, and one '@' symbol (no dots or other special characters)";
      }
    }

    // Message — only letters, numbers, and spaces (no special characters)
    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (/[^a-zA-Z0-9\s]/.test(form.message)) {
      newErrors.message = "Message should not contain special characters (only letters, numbers, and spaces)";
    }

    return newErrors;
  };

  // Submit Enquiry
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      const subject = encodeURIComponent("New Admission Enquiry - Oak Grove School");
      const body = encodeURIComponent(
`New Admission Enquiry:
------------------------
Student Name: ${form.studentName}
Parent Name: ${form.parentName}
Grade Applying For: ${form.grade}
Phone: ${form.phone}
Email: ${form.email}
Message: ${form.message}`
      );

      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=oakgroveschool.edu@gmail.com&su=${subject}&body=${body}`,
        '_blank'
      );

      const handleVisibility = () => {
        if (!document.hidden) {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 4000);
          setForm({ studentName: "", parentName: "", grade: "", phone: "", email: "", message: "" });
          setErrors({});
          document.removeEventListener("visibilitychange", handleVisibility);
        }
      };

      document.addEventListener("visibilitychange", handleVisibility);

    } else {
      setErrors(newErrors);
    }
  };

  // Open Gmail compose
  const handleEmailClick = () => {
    const subject = encodeURIComponent("Enquiry - Oak Grove School");
    const body = encodeURIComponent("Hello Oak Grove School,\n\nI would like to enquire about admissions.\n\nThank you.");
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=oakgroveschool.edu@gmail.com&su=${subject}&body=${body}`,
      '_blank'
    );
  };

  // Send WhatsApp
  const handleWhatsApp = (e) => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // If form is valid, proceed with WhatsApp
      const message = `Hi Oak Grove School,%0A%0AI'm interested in admission for my child.%0A%0AStudent Name: ${form.studentName}%0AParent Name: ${form.parentName}%0AGrade: ${form.grade}%0APhone: ${form.phone}%0AEmail: ${form.email}%0AMessage: ${form.message}`;
      window.open(`https://wa.me/919963883881?text=${message}`, '_blank');
    } else {
      // Show validation errors
      setErrors(newErrors);
      // Focus on first field with error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="gradient-navy pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-4">Contact & Admissions</h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch or schedule a campus visit today.
          </p>
        </div>
      </section>

      {/* Contact Info + Map */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Info */}
            <div>
              <h2 className="section-title text-2xl mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover">
                  <div className="w-12 h-12 rounded-xl bg-sky flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-primary">Address</h3>
                    <p className="text-muted-foreground text-sm">Plot No 1006, Netaji Rd, KPHB Phase 9, Hyderabad, Telangana 500085</p>
                  </div>
                </div>
                <a href="tel:9963883881" className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover block cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-primary">Phone</h3>
                    <p className="text-muted-foreground text-sm">9963883881</p>
                  </div>
                </a>
                <div 
                  onClick={handleEmailClick}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover cursor-pointer transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-primary">Email</h3>
                    <p className="text-muted-foreground text-sm break-all">oakgroveschool.edu@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border h-[400px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30447.31491734002!2d78.3621721825818!3d17.46381237774128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93ae1513cf4f%3A0x110f91fba5d6ac5!2sOAK%20GROVE%20SCHOOL!5e0!3m2!1sen!2sin!4v1775553051422!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Oak Grove School Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Banner */}
      <section className="gradient-sky section-padding">
        <div className="container mx-auto text-center">
          <div className="inline-block bg-accent text-accent-foreground px-6 py-2 rounded-full font-bold text-lg mb-6">
            🎓 Admissions Open 2025-26
          </div>
          <h2 className="section-title">Join the Oak Grove Family</h2>
          <p className="section-subtitle mb-8">
            We offer admissions from Playgroup to Grade 7. Our simple process ensures a smooth
            transition for your child into a world of joyful learning.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { step: "1", title: "Enquire", desc: "Fill the form or call us" },
              { step: "2", title: "Visit", desc: "Tour our campus" },
              { step: "3", title: "Enroll", desc: "Complete admission" },
            ].map((s) => (
              <div key={s.step} className="bg-card rounded-2xl p-6 border border-border text-center card-hover">
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                  {s.step}
                </div>
                <h3 className="font-heading font-bold text-primary">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="section-title">Enquiry Form</h2>
            <p className="section-subtitle">Fill out the form and we'll get back to you shortly.</p>
          </div>

          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-center mb-6 animate-fade-in">
              ✅ Thank you! We'll contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border shadow-lg space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-primary mb-1 block">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="studentName" 
                  value={form.studentName} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border ${errors.studentName ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition`} 
                />
                {errors.studentName && (
                  <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-primary mb-1 block">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="parentName" 
                  value={form.parentName} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border ${errors.parentName ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition`} 
                />
                {errors.parentName && (
                  <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-primary mb-1 block">
                  Grade Applying For <span className="text-red-500">*</span>
                </label>
                <select 
                  name="grade" 
                  value={form.grade} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border ${errors.grade ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition`}
                >
                  <option value="">Select Grade</option>
                  {["Playgroup", "Nursery", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-primary mb-1 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  value={form.phone} 
                  onChange={handleChange} 
                  placeholder="1234567890"
                  maxLength={10}
                  className={`w-full rounded-xl border ${errors.phone ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition`} 
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-primary mb-1 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition`} 
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-primary mb-1 block">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="message" 
                rows={4} 
                value={form.message} 
                onChange={handleChange}
                className={`w-full rounded-xl border ${errors.message ? 'border-red-500' : 'border-border'} bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring outline-none transition resize-none`} 
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <button type="submit" className="btn-accent">
                <Send className="w-4 h-4" /> Submit Enquiry
              </button>
              
              <button 
                type="button" 
                className="btn-primary ml-auto" 
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;