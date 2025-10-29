import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const CustomerSupportFloating = ({ supportEmail = "support@educhain.ai" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    // Encode message for mailto
    const subject = encodeURIComponent(`Support request from ${name || "User"}`);
    const body = encodeURIComponent(
      `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`
    );

    // Open user's email client
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    // Reset form
    setFormData({ name: "", email: "", message: "" });
    setIsOpen(false);
  };

  return (
    <div>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-xl"
        style={{
          background: "linear-gradient(180deg, #FFF4CC 0%, #AEE1F4 100%)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={26} color="#2772A0" />
      </motion.button>

      {/* Popup Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl shadow-2xl p-5"
            style={{
              background: "linear-gradient(180deg, #FFF4CC 0%, #AEE1F4 100%)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Contact Support</h3>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} color="#1E293B" />
              </button>
            </div>

            <form onSubmit={handleSend} className="flex flex-col space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="p-2 rounded-md border border-gray-300 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="p-2 rounded-md border border-gray-300 focus:outline-none"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                rows="4"
                required
                className="p-2 rounded-md border border-gray-300 focus:outline-none resize-none"
              />
              <button
                type="submit"
                className="w-full p-2 rounded-md text-white font-semibold"
                style={{
                  background: "linear-gradient(90deg, #2772A0, #4CB8C4)",
                }}
              >
                Send Message
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSupportFloating;


