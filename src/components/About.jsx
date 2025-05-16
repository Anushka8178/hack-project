import React from 'react';

function About() {
  return (
    <div className="about-section">
      <h2>About Awaaz</h2>
      <div className="about-content">
        <p>
          Awaaz is a platform dedicated to empowering citizens to voice their concerns
          and report issues in their communities. We believe that every voice matters
          and that together we can make a difference.
        </p>
        <div className="about-features">
          <div className="feature">
            <h3>Our Mission</h3>
            <p>To create a more responsive and accountable society through citizen engagement.</p>
          </div>
          <div className="feature">
            <h3>Our Vision</h3>
            <p>To build a platform where every citizen's voice is heard and acted upon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 