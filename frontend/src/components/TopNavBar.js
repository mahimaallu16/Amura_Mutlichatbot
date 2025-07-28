import React from "react";
import './TopNavBar.css';

export default function TopNavBar({ selectedSegment, onSegmentSelect }) {
  return (
    <nav className="top-navbar">
      <div className="top-navbar-segments">
        {/* Segments removed for minimal look */}
      </div>
      <button className="top-navbar-refresh" title="Refresh"> 1bb</button>
    </nav>
  );
} 