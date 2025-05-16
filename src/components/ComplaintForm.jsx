import React, { useState } from 'react';

function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });
  const [category, setCategory] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // First, categorize the complaint
      const categoryResponse = await fetch('http://localhost:8000/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.description,
          location: formData.location,
        }),
      });

      if (!categoryResponse.ok) {
        throw new Error('Categorization failed');
      }

      const categoryData = await categoryResponse.json();
      setCategory(categoryData.category);

      // Then, generate the email
      const emailResponse = await fetch('http://localhost:8000/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.description,
          location: formData.location,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Email generation failed');
      }

      const emailData = await emailResponse.json();
      setGeneratedEmail(emailData.email);
    } catch (error) {
      console.error('Error processing complaint:', error);
      alert('Error processing complaint. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="complaint-form">
      <h2>Submit a Complaint</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Submit Complaint'}
        </button>
      </form>

      {category && (
        <div className="complaint-result">
          <h3>Complaint Category: {category}</h3>
        </div>
      )}

      {generatedEmail && (
        <div className="email-preview">
          <h3>Generated Email:</h3>
          <div className="email-content">
            {generatedEmail.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintForm; 