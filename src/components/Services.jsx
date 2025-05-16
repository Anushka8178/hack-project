import React from 'react';

function Services() {
  const services = [
    {
      title: 'Voice Complaints',
      description: 'Record and submit voice complaints for quick and easy reporting.'
    },
    {
      title: 'Text Complaints',
      description: 'Submit detailed written complaints with location information.'
    },
    {
      title: 'Track Progress',
      description: 'Monitor the status of your submitted complaints in real-time.'
    },
    {
      title: 'Community Engagement',
      description: 'Connect with other citizens and stay informed about local issues.'
    }
  ];

  return (
    <div className="services-section">
      <h2>Our Services</h2>
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services; 