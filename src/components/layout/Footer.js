import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold mb-4 footer-logo">GAMEDAY+</h3>
            <p className="text-gray-600 mb-6">
              The most comprehensive college football intelligence platform, delivering insights that go beyond traditional sports coverage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:opacity-80 transition duration-300"><i className="fab fa-twitter text-xl icon-gradient"></i></a>
              <a href="#" className="hover:opacity-80 transition duration-300"><i className="fab fa-facebook text-xl icon-gradient"></i></a>
              <a href="#" className="hover:opacity-80 transition duration-300"><i className="fab fa-instagram text-xl icon-gradient"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 gradient-text">Platform</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:gradient-text transition duration-300">Teams & Conferences</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">Analytics</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">Betting</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">News & Media</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 gradient-text">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:gradient-text transition duration-300">Help Center</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:gradient-text transition duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; 2024 GAMEDAY+. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
